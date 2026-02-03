import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
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
import { BarChartConfig } from '../../../models/ag-ui.models';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-bar-chart',
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
export class BarChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: BarChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();
    const isHorizontal = this.config.horizontal ?? false;

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: this.config.series.map(s => s.name),
        bottom: 0
      },
      xAxis: {
        type: isHorizontal ? 'value' : 'category',
        data: isHorizontal ? undefined : this.config.xAxisData,
        name: this.config.xAxisLabel,
        axisLine: { lineStyle: { color: colors.axisLineColor } },
        axisLabel: { color: colors.textColor }
      },
      yAxis: {
        type: isHorizontal ? 'category' : 'value',
        data: isHorizontal ? this.config.xAxisData : undefined,
        name: this.config.yAxisLabel,
        axisLine: { lineStyle: { color: colors.axisLineColor } },
        axisLabel: { color: colors.textColor },
        splitLine: { lineStyle: { color: colors.splitLineColor } }
      },
      series: this.config.series.map((s, index) => ({
        name: s.name,
        type: 'bar' as const,
        data: s.data as number[],
        stack: this.config?.stacked ? 'total' : undefined,
        color: s.color || colors.primary[index % colors.primary.length],
        emphasis: {
          focus: 'series'
        },
        label: {
          show: true,
          position: isHorizontal ? 'right' : 'top',
          formatter: '{c}'
        },
        barMaxWidth: 50
      })),
      dataZoom: this.config.showDataZoom ? [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, ...(isHorizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }) }
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
