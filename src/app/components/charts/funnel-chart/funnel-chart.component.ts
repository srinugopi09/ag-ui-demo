import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { FunnelChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { FunnelChartConfig } from '../../../models/ag-ui.models';

echarts.use([FunnelChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-funnel-chart',
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
        <div class="conversion-rates" *ngIf="config?.showConversionRate && conversionRates.length">
          <div class="rate-item" *ngFor="let rate of conversionRates">
            <span class="rate-label">{{ rate.from }} → {{ rate.to }}</span>
            <span class="rate-value">{{ rate.rate }}%</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .chart-card { height: 100%; display: flex; flex-direction: column; }
    mat-card-header { display: flex; align-items: center; padding: 16px 16px 0; }
    mat-card-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
    .chart-actions { display: flex; gap: 4px; margin-left: auto; }
    .chart-content { flex: 1; padding: 16px; min-height: 0; display: flex; flex-direction: column; }
    .chart-container { flex: 1; width: 100%; min-height: 250px; }

    .conversion-rates {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      padding-top: 12px;
      border-top: 1px solid #eee;
      margin-top: 12px;
    }

    .rate-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
    }

    .rate-label {
      font-size: 11px;
      color: #999;
    }

    .rate-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  `]
})
export class FunnelChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: FunnelChartConfig | undefined;

  conversionRates: { from: string; to: string; rate: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
      this.calculateConversionRates();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();
    const isHorizontal = this.config.orient === 'horizontal';

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
          type: 'funnel',
          left: '10%',
          top: this.config.title ? 60 : 20,
          bottom: 20,
          width: '60%',
          min: 0,
          max: Math.max(...this.config.data.map(d => d.value)),
          minSize: '0%',
          maxSize: '100%',
          sort: this.config.sort || 'descending',
          orient: isHorizontal ? 'horizontal' : 'vertical',
          gap: this.config.gap ?? 2,
          label: this.config.showLabels !== false ? {
            show: true,
            position: 'inside',
            formatter: '{b}: {c}',
            color: '#fff'
          } : { show: false },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 14
            }
          },
          data: this.config.data.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.color || colors.primary[index % colors.primary.length]
            }
          }))
        }
      ]
    };

    this.chartOptions.set(options);
  }

  private calculateConversionRates(): void {
    if (!this.config?.data || this.config.data.length < 2) {
      this.conversionRates = [];
      return;
    }

    // Sort data by value descending for conversion calculation
    const sortedData = [...this.config.data].sort((a, b) => b.value - a.value);

    this.conversionRates = [];
    for (let i = 0; i < sortedData.length - 1; i++) {
      const fromValue = sortedData[i].value;
      const toValue = sortedData[i + 1].value;
      const rate = fromValue > 0 ? ((toValue / fromValue) * 100).toFixed(1) : '0';

      this.conversionRates.push({
        from: sortedData[i].name,
        to: sortedData[i + 1].name,
        rate
      });
    }
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;
    const total = this.config.data[0]?.value || 1;
    return {
      headers: ['Stage', 'Value', 'Percentage'],
      rows: this.config.data.map(d => [
        d.name,
        d.value,
        `${((d.value / total) * 100).toFixed(1)}%`
      ])
    };
  }
}
