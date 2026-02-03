import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { PieChartConfig } from '../../../models/ag-ui.models';

echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgxEchartsDirective
  ],
  providers: [
    provideEchartsCore({ echarts })
  ],
  template: `
    <mat-card class="chart-card" [style.height]="config?.height || '400px'">
      <mat-card-header *ngIf="config?.title || config?.exportable">
        <mat-card-title>{{ config?.title }}</mat-card-title>
        <mat-card-subtitle *ngIf="config?.subtitle">{{ config?.subtitle }}</mat-card-subtitle>
        <div class="chart-actions" *ngIf="config?.exportable">
          <button mat-icon-button [matMenuTriggerFor]="exportMenu" matTooltip="Export">
            <mat-icon>download</mat-icon>
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="export('png')">
              <mat-icon>image</mat-icon>
              <span>Export as PNG</span>
            </button>
            <button mat-menu-item (click)="export('csv')">
              <mat-icon>table_chart</mat-icon>
              <span>Export as CSV</span>
            </button>
          </mat-menu>
        </div>
      </mat-card-header>
      <mat-card-content class="chart-content">
        <div
          echarts
          [options]="chartOptions()"
          [merge]="mergeOptions()"
          class="chart-container"
          (chartInit)="onChartInit($event)"
          (chartClick)="onChartClick($event)"
        ></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .chart-card { height: 100%; display: flex; flex-direction: column; }
    mat-card-header { display: flex; align-items: center; padding: 16px 16px 0; }
    mat-card-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
    .chart-actions { display: flex; gap: 4px; margin-left: auto; }
    .chart-content { flex: 1; padding: 16px; min-height: 0; }
    .chart-container { width: 100%; height: 100%; min-height: 300px; }
  `]
})
export class PieChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: PieChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();
    const isDonut = this.config.donut ?? false;
    const innerRadius = isDonut ? (this.config.innerRadius || '40%') : '0%';
    const outerRadius = this.config.outerRadius || '70%';

    // Calculate total for center display
    const total = this.config.data.reduce((sum, item) => sum + item.value, 0);

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `${p.name}<br/>Value: ${p.value.toLocaleString()}<br/>Percentage: ${p.percent}%`;
        }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: this.config.data.map(d => d.name)
      },
      series: [
        {
          type: 'pie',
          radius: [innerRadius, outerRadius],
          center: ['40%', '50%'],
          roseType: this.config.roseType === true ? 'radius' : (this.config.roseType || undefined),
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: this.config.showLabels !== false ? {
            show: true,
            position: this.config.labelPosition || 'outside',
            formatter: '{b}: {d}%'
          } : { show: false },
          labelLine: {
            show: this.config.showLabels !== false && this.config.labelPosition !== 'inside'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: this.config.data.map((item, index) => ({
            name: item.name,
            value: item.value,
            selected: item.selected,
            itemStyle: item.color ? { color: item.color } : { color: colors.primary[index % colors.primary.length] }
          }))
        }
      ],
      // Center text for donut
      ...(isDonut ? {
        graphic: {
          type: 'text' as const,
          left: '35%',
          top: '45%',
          style: {
            text: `Total\n${total.toLocaleString()}`,
            fill: colors.textColor,
            fontSize: 16,
            fontWeight: 'bold' as const,
            align: 'center' as const
          }
        }
      } : {})
    };

    this.chartOptions.set(options);
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;
    return this.exportService.pieDataToCsv(this.config.data);
  }

  protected override getExportData(): unknown {
    return { data: this.config?.data };
  }
}
