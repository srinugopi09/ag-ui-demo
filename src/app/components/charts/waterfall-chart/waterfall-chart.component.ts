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
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { WaterfallChartConfig } from '../../../models/ag-ui.models';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-waterfall-chart',
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
export class WaterfallChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: WaterfallChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();
    const customColors = this.config.colors || {
      increase: colors.increase,
      decrease: colors.decrease,
      total: colors.total
    };

    // Calculate waterfall data
    const { baseData, increaseData, decreaseData, totalData, categories } = this.processWaterfallData();

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const paramArray = params as Array<{ seriesName: string; value: number; name: string }>;
          const item = this.config?.data.find(d => d.name === paramArray[0].name);
          if (item) {
            const sign = item.value >= 0 ? '+' : '';
            return `${item.name}<br/>Value: ${sign}${item.value.toLocaleString()}`;
          }
          return '';
        }
      },
      legend: {
        data: ['Increase', 'Decrease', 'Total'],
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: categories,
        name: this.config.xAxisLabel,
        axisLine: { lineStyle: { color: colors.axisLineColor } },
        axisLabel: { color: colors.textColor, rotate: 30 }
      },
      yAxis: {
        type: 'value',
        name: this.config.yAxisLabel,
        axisLine: { lineStyle: { color: colors.axisLineColor } },
        axisLabel: { color: colors.textColor },
        splitLine: { lineStyle: { color: colors.splitLineColor } }
      },
      series: [
        {
          name: 'Base',
          type: 'bar',
          stack: 'waterfall',
          silent: true,
          itemStyle: { color: 'transparent' },
          data: baseData
        },
        {
          name: 'Increase',
          type: 'bar',
          stack: 'waterfall',
          data: increaseData,
          itemStyle: { color: customColors.increase },
          label: {
            show: true,
            position: 'top',
            formatter: (params: unknown) => {
              const p = params as { value: number };
              return p.value > 0 ? `+${p.value.toLocaleString()}` : '';
            }
          }
        },
        {
          name: 'Decrease',
          type: 'bar',
          stack: 'waterfall',
          data: decreaseData,
          itemStyle: { color: customColors.decrease },
          label: {
            show: true,
            position: 'bottom',
            formatter: (params: unknown) => {
              const p = params as { value: number };
              return p.value < 0 ? p.value.toLocaleString() : '';
            }
          }
        },
        {
          name: 'Total',
          type: 'bar',
          stack: 'waterfall',
          data: totalData,
          itemStyle: { color: customColors.total },
          label: {
            show: true,
            position: 'top',
            formatter: (params: unknown) => {
              const p = params as { value: number };
              return p.value > 0 ? p.value.toLocaleString() : '';
            }
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: this.config.title ? '15%' : '10%',
        containLabel: true
      }
    };

    this.chartOptions.set(options);
  }

  private processWaterfallData(): {
    baseData: number[];
    increaseData: number[];
    decreaseData: number[];
    totalData: number[];
    categories: string[];
  } {
    const data = this.config?.data || [];
    const categories = data.map(d => d.name);
    const baseData: number[] = [];
    const increaseData: number[] = [];
    const decreaseData: number[] = [];
    const totalData: number[] = [];

    let runningTotal = 0;

    data.forEach((item, index) => {
      if (item.itemType === 'total' || index === data.length - 1) {
        // Total bar
        baseData.push(0);
        increaseData.push(0);
        decreaseData.push(0);
        totalData.push(runningTotal + item.value);
        runningTotal += item.value;
      } else if (item.value >= 0) {
        // Increase
        baseData.push(runningTotal);
        increaseData.push(item.value);
        decreaseData.push(0);
        totalData.push(0);
        runningTotal += item.value;
      } else {
        // Decrease
        baseData.push(runningTotal + item.value);
        increaseData.push(0);
        decreaseData.push(Math.abs(item.value));
        totalData.push(0);
        runningTotal += item.value;
      }
    });

    return { baseData, increaseData, decreaseData, totalData, categories };
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;
    return {
      headers: ['Name', 'Value', 'Type'],
      rows: this.config.data.map(d => [d.name, d.value, d.itemType || 'change'])
    };
  }
}
