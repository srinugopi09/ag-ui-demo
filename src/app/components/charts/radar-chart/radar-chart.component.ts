import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { RadarChartConfig } from '../../../models/ag-ui.models';

echarts.use([RadarChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-radar-chart',
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
export class RadarChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: RadarChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: this.config.series.map(s => s.name),
        bottom: 0
      },
      radar: {
        indicator: this.config.indicators.map(ind => ({
          name: ind.name,
          max: ind.max,
          min: ind.min ?? 0
        })),
        shape: this.config.shape || 'polygon',
        radius: '65%',
        center: ['50%', '50%'],
        axisName: {
          color: colors.textColor
        },
        splitArea: {
          areaStyle: {
            color: [
              'rgba(84, 112, 198, 0.05)',
              'rgba(84, 112, 198, 0.1)',
              'rgba(84, 112, 198, 0.05)',
              'rgba(84, 112, 198, 0.1)',
              'rgba(84, 112, 198, 0.05)'
            ]
          }
        },
        axisLine: {
          lineStyle: {
            color: colors.splitLineColor
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.splitLineColor
          }
        }
      },
      series: [
        {
          type: 'radar',
          data: this.config.series.map((s, index) => {
            const color = s.color || colors.primary[index % colors.primary.length];
            return {
              name: s.name,
              value: s.value,
              symbol: 'circle',
              symbolSize: 6,
              lineStyle: {
                color,
                width: 2
              },
              itemStyle: {
                color
              },
              areaStyle: this.config?.showArea !== false ? {
                color,
                opacity: s.areaStyle?.opacity ?? 0.2
              } : undefined
            };
          }),
          emphasis: {
            lineStyle: {
              width: 4
            }
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;

    const headers = ['Indicator', ...this.config.series.map(s => s.name)];
    const rows = this.config.indicators.map((ind, idx) => [
      ind.name,
      ...this.config!.series.map(s => s.value[idx] ?? 0)
    ]);

    return { headers, rows };
  }

  protected override getExportData(): unknown {
    return {
      indicators: this.config?.indicators,
      series: this.config?.series
    };
  }
}
