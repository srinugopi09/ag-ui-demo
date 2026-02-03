import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { ComboChartConfig } from '../../../models/ag-ui.models';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-combo-chart',
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
export class ComboChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: ComboChartConfig | undefined;

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
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#999' }
        }
      },
      legend: {
        data: this.config.series.map(s => s.name),
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: this.config.xAxisData,
        name: this.config.xAxisLabel,
        axisPointer: { type: 'shadow' },
        axisLine: { lineStyle: { color: colors.axisLineColor } },
        axisLabel: { color: colors.textColor }
      },
      yAxis: [
        {
          type: 'value',
          name: this.config.yAxisLabels?.[0] || '',
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisLabel: { color: colors.textColor },
          splitLine: { lineStyle: { color: colors.splitLineColor } }
        },
        {
          type: 'value',
          name: this.config.yAxisLabels?.[1] || '',
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisLabel: { color: colors.textColor },
          splitLine: { show: false }
        }
      ],
      series: this.config.series.map((s, index) => {
        const seriesType = s.type === 'line' ? 'line' : 'bar';
        const isLine = seriesType === 'line';
        return {
          name: s.name,
          type: seriesType as 'line' | 'bar',
          yAxisIndex: s.yAxisIndex ?? (isLine ? 1 : 0),
          data: s.data as number[],
          color: s.color || colors.primary[index % colors.primary.length],
          smooth: isLine ? s.smooth : undefined,
          emphasis: {
            focus: 'series' as const
          },
          ...(isLine ? {
            lineStyle: { width: 2 },
            symbol: 'circle',
            symbolSize: 8
          } : {
            barMaxWidth: 50
          })
        };
      }),
      dataZoom: this.config.showDataZoom ? [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100 }
      ] : undefined,
      grid: {
        left: '3%',
        right: '4%',
        bottom: this.config.showDataZoom ? '15%' : '10%',
        top: this.config.title ? '15%' : '10%',
        containLabel: true
      }
    };

    this.chartOptions.set(options);
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;
    return this.exportService.seriesDataToCsv(
      this.config.xAxisData,
      this.config.series.map(s => ({
        name: s.name,
        data: s.data as number[]
      }))
    );
  }
}
