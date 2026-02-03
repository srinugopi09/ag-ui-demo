import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { HeatmapChartConfig } from '../../../models/ag-ui.models';

echarts.use([HeatmapChart, TitleComponent, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer]);

@Component({
  selector: 'app-heatmap-chart',
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
export class HeatmapChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: HeatmapChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();

    // Calculate min/max from data if not provided
    const values = this.config.data.map(d => d[2]);
    const min = this.config.min ?? Math.min(...values);
    const max = this.config.max ?? Math.max(...values);

    const colorRange = this.config.colorRange || ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        position: 'top',
        formatter: (params: unknown) => {
          const p = params as { data: number[] };
          const [xIdx, yIdx, value] = p.data;
          const xLabel = this.config?.xAxisData[xIdx] || '';
          const yLabel = this.config?.yAxisData[yIdx] || '';
          return `${yLabel} - ${xLabel}<br/>Value: ${value}`;
        }
      },
      grid: {
        left: '15%',
        right: '15%',
        top: this.config.title ? '15%' : '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.config.xAxisData,
        name: this.config.xAxisLabel,
        splitArea: { show: true },
        axisLabel: {
          color: colors.textColor,
          rotate: this.config.xAxisData.length > 10 ? 45 : 0
        }
      },
      yAxis: {
        type: 'category',
        data: this.config.yAxisData,
        name: this.config.yAxisLabel,
        splitArea: { show: true },
        axisLabel: { color: colors.textColor }
      },
      visualMap: {
        min,
        max,
        calculable: true,
        orient: 'vertical',
        right: '2%',
        top: 'center',
        inRange: {
          color: colorRange
        }
      },
      series: [
        {
          type: 'heatmap',
          data: this.config.data,
          label: this.config.showLabels ? {
            show: true,
            formatter: (params: unknown) => {
              const p = params as { data: number[] };
              return p.data[2].toString();
            }
          } : { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#fff'
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;

    const headers = ['', ...this.config.xAxisData];
    const rows: (string | number)[][] = [];

    this.config.yAxisData.forEach((yLabel, yIdx) => {
      const row: (string | number)[] = [yLabel];
      this.config!.xAxisData.forEach((_, xIdx) => {
        const dataPoint = this.config!.data.find(d => d[0] === xIdx && d[1] === yIdx);
        row.push(dataPoint ? dataPoint[2] : 0);
      });
      rows.push(row);
    });

    return { headers, rows };
  }
}
