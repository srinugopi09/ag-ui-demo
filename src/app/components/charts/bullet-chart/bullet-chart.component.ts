import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, CustomChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { BulletChartConfig } from '../../../models/ag-ui.models';

echarts.use([BarChart, CustomChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

@Component({
  selector: 'app-bullet-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    NgxEchartsDirective
  ],
  providers: [
    provideEchartsCore({ echarts })
  ],
  template: `
    <mat-card class="chart-card" [style.height]="config?.height || '150px'">
      <mat-card-content class="chart-content">
        <div class="bullet-header" *ngIf="config?.title">
          <span class="bullet-title">{{ config?.title }}</span>
          <div class="bullet-values">
            <span class="actual-value">{{ config?.actual }}{{ config?.unit }}</span>
            <span class="target-label">Target: {{ config?.target }}{{ config?.unit }}</span>
          </div>
        </div>
        <div
          echarts
          [options]="chartOptions()"
          [merge]="mergeOptions()"
          class="chart-container"
          (chartInit)="onChartInit($event)"
        ></div>
        <div class="legend" *ngIf="config?.ranges?.length">
          <span *ngFor="let range of config?.ranges" class="legend-item">
            <span class="legend-color" [style.background-color]="range.color"></span>
            {{ range.label || range.value }}
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .chart-card { height: 100%; display: flex; flex-direction: column; }
    .chart-content { flex: 1; padding: 16px; min-height: 0; display: flex; flex-direction: column; }

    .bullet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .bullet-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .bullet-values {
      text-align: right;
    }

    .actual-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: block;
    }

    .target-label {
      font-size: 11px;
      color: #999;
    }

    .chart-container {
      flex: 1;
      width: 100%;
      min-height: 40px;
    }

    .legend {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #666;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `]
})
export class BulletChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: BulletChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const isHorizontal = this.config.orientation !== 'vertical';
    const min = this.config.min ?? 0;
    const max = this.config.max ?? Math.max(this.config.target * 1.2, ...this.config.ranges.map(r => r.value));

    // Build range bars (background qualitative ranges)
    const rangeSeries = this.config.ranges.map((range, index) => ({
      type: 'bar' as const,
      silent: true,
      barGap: '-100%',
      barCategoryGap: '20%',
      data: [range.value],
      itemStyle: {
        color: range.color
      },
      z: index
    }));

    // Actual value bar (the measure)
    const actualSeries = {
      type: 'bar' as const,
      barGap: '-100%',
      barWidth: 15,
      data: [this.config.actual],
      itemStyle: {
        color: '#333'
      },
      z: 10
    };

    const options: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: () => {
          return `
            <div>
              <strong>${this.config?.title || 'Value'}</strong><br/>
              Actual: ${this.config?.actual}${this.config?.unit || ''}<br/>
              Target: ${this.config?.target}${this.config?.unit || ''}
            </div>
          `;
        }
      },
      grid: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        containLabel: false
      },
      xAxis: isHorizontal ? {
        type: 'value',
        min,
        max,
        show: false
      } : {
        type: 'category',
        data: [''],
        show: false
      },
      yAxis: isHorizontal ? {
        type: 'category',
        data: [''],
        show: false
      } : {
        type: 'value',
        min,
        max,
        show: false
      },
      series: [
        ...rangeSeries,
        actualSeries,
        // Target marker line
        {
          type: 'bar' as const,
          silent: true,
          barGap: '-100%',
          barWidth: 3,
          data: [this.config.target],
          itemStyle: {
            color: '#000'
          },
          z: 20,
          markLine: {
            symbol: 'none',
            silent: true,
            data: [{
              xAxis: this.config.target,
              lineStyle: {
                color: '#000',
                width: 2,
                type: 'solid'
              },
              label: { show: false }
            }]
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getExportData(): unknown {
    return {
      actual: this.config?.actual,
      target: this.config?.target,
      ranges: this.config?.ranges
    };
  }
}
