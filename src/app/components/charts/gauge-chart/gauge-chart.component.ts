import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { GaugeChartConfig } from '../../../models/ag-ui.models';

echarts.use([GaugeChart, TitleComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-gauge-chart',
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
    <mat-card class="chart-card" [style.height]="config?.height || '300px'">
      <mat-card-header *ngIf="config?.title">
        <mat-card-title>{{ config?.title }}</mat-card-title>
        <mat-card-subtitle *ngIf="config?.subtitle">{{ config?.subtitle }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="chart-content">
        <div
          echarts
          [options]="chartOptions()"
          [merge]="mergeOptions()"
          class="chart-container"
          (chartInit)="onChartInit($event)"
        ></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .chart-card { height: 100%; display: flex; flex-direction: column; }
    mat-card-header { display: flex; align-items: center; padding: 16px 16px 0; }
    mat-card-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
    .chart-content { flex: 1; padding: 16px; min-height: 0; }
    .chart-container { width: 100%; height: 100%; min-height: 200px; }
  `]
})
export class GaugeChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: GaugeChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();
    const min = this.config.min ?? 0;
    const max = this.config.max ?? 100;
    const value = this.config.value;

    // Build axis line colors from thresholds
    let axisLineColors: [number, string][] = [[1, colors.primary[0]]];

    if (this.config.thresholds?.ranges) {
      axisLineColors = this.config.thresholds.ranges.map(range => [
        (range.end - min) / (max - min),
        range.color
      ]);
    } else {
      // Default traffic light colors
      axisLineColors = [
        [0.3, colors.critical],
        [0.7, colors.warning],
        [1, colors.success]
      ];
    }

    const options: EChartsOption = {
      series: [
        {
          type: 'gauge',
          min,
          max,
          splitNumber: this.config.splitNumber ?? 10,
          radius: '85%',
          axisLine: {
            lineStyle: {
              width: 20,
              color: axisLineColors
            }
          },
          pointer: this.config.showPointer !== false ? {
            itemStyle: {
              color: 'auto'
            },
            width: 5
          } : { show: false },
          axisTick: {
            distance: -20,
            length: 8,
            lineStyle: {
              color: '#fff',
              width: 2
            }
          },
          splitLine: {
            distance: -20,
            length: 20,
            lineStyle: {
              color: '#fff',
              width: 3
            }
          },
          axisLabel: {
            color: 'inherit',
            distance: 30,
            fontSize: 12,
            formatter: (value: number) => {
              if (this.config?.unit) {
                return `${value}${this.config.unit}`;
              }
              return value.toString();
            }
          },
          detail: {
            valueAnimation: true,
            formatter: (value: number) => {
              if (this.config?.unit) {
                return `${value.toFixed(0)}${this.config.unit}`;
              }
              return value.toFixed(0);
            },
            color: 'inherit',
            fontSize: 24,
            fontWeight: 'bold',
            offsetCenter: [0, '70%']
          },
          data: [{ value }],
          title: {
            show: false
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getExportData(): unknown {
    return {
      value: this.config?.value,
      min: this.config?.min,
      max: this.config?.max,
      thresholds: this.config?.thresholds
    };
  }
}
