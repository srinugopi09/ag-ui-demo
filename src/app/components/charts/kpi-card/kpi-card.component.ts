import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { KpiCardConfig } from '../../../models/ag-ui.models';
import { ChartThemeService } from '../../../services/chart-theme.service';
import { FormatService } from '../../../services/format.service';

echarts.use([LineChart, GridComponent, CanvasRenderer]);

@Component({
  selector: 'app-kpi-card',
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
    <mat-card class="kpi-card" [class.warning]="isWarning" [class.critical]="isCritical">
      <mat-card-content>
        <div class="kpi-header">
          <span class="kpi-title">{{ config?.title }}</span>
          <mat-icon
            *ngIf="config?.target"
            class="target-icon"
            [matTooltip]="'Target: ' + formatValue(config?.target || 0)"
          >
            flag
          </mat-icon>
        </div>

        <div class="kpi-value-container">
          <span class="kpi-value" [style.color]="valueColor">
            {{ formattedValue }}
          </span>
          <span class="kpi-unit" *ngIf="config?.unit">{{ config?.unit }}</span>
        </div>

        <div class="kpi-trend" *ngIf="config?.previousValue !== undefined">
          <mat-icon [class]="trendClass">
            {{ trendIcon }}
          </mat-icon>
          <span class="trend-value" [class]="trendClass">
            {{ trendText }}
          </span>
          <span class="trend-label">vs previous</span>
        </div>

        <div class="kpi-progress" *ngIf="config?.target">
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="progressPercent"
              [style.background-color]="valueColor"
            ></div>
          </div>
          <span class="progress-text">{{ progressPercent.toFixed(0) }}% of target</span>
        </div>

        <div class="sparkline-container" *ngIf="config?.sparklineData?.length">
          <div
            echarts
            [options]="sparklineOptions"
            class="sparkline"
          ></div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .kpi-card {
      height: 100%;
      transition: all 0.3s ease;
    }

    .kpi-card.warning {
      border-left: 4px solid #fac858;
    }

    .kpi-card.critical {
      border-left: 4px solid #ee6666;
    }

    mat-card-content {
      padding: 16px;
    }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .kpi-title {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .target-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .kpi-value-container {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 600;
      line-height: 1.2;
    }

    .kpi-unit {
      font-size: 14px;
      color: #666;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
    }

    .kpi-trend mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .trend-value {
      font-size: 14px;
      font-weight: 500;
    }

    .trend-label {
      font-size: 12px;
      color: #999;
    }

    .trend-up {
      color: #91cc75;
    }

    .trend-down {
      color: #ee6666;
    }

    .trend-neutral {
      color: #999;
    }

    .kpi-progress {
      margin-bottom: 12px;
    }

    .progress-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 11px;
      color: #999;
    }

    .sparkline-container {
      margin-top: 8px;
    }

    .sparkline {
      width: 100%;
      height: 40px;
    }
  `]
})
export class KpiCardComponent implements OnChanges {
  @Input() config?: KpiCardConfig;

  private themeService = inject(ChartThemeService);
  private formatService = inject(FormatService);

  sparklineOptions: EChartsOption = {};

  get formattedValue(): string {
    if (!this.config) return '';
    return this.formatService.formatValue(
      this.config.value,
      this.config.format || 'number',
      {
        decimals: this.config.decimals,
        prefix: this.config.prefix,
        suffix: this.config.suffix
      }
    );
  }

  get valueColor(): string {
    if (!this.config) return '';
    const colors = this.themeService.getColors();

    if (this.config.thresholds) {
      return this.formatService.getThresholdColor(
        this.config.value,
        this.config.thresholds,
        {
          success: colors.success,
          warning: colors.warning,
          critical: colors.critical
        }
      );
    }
    return colors.primary[0];
  }

  get isWarning(): boolean {
    if (!this.config?.thresholds?.warning) return false;
    return this.config.value <= this.config.thresholds.warning &&
           (!this.config.thresholds.critical || this.config.value > this.config.thresholds.critical);
  }

  get isCritical(): boolean {
    if (!this.config?.thresholds?.critical) return false;
    return this.config.value <= this.config.thresholds.critical;
  }

  get trendClass(): string {
    if (!this.config) return 'trend-neutral';
    const trend = this.config.trend || this.calculateTrend();
    return `trend-${trend}`;
  }

  get trendIcon(): string {
    if (!this.config) return 'remove';
    const trend = this.config.trend || this.calculateTrend();
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  get trendText(): string {
    if (!this.config || this.config.previousValue === undefined) return '';
    const change = this.formatService.calculateChange(
      this.config.value,
      this.config.previousValue
    );
    const sign = change.percentage >= 0 ? '+' : '';
    return `${sign}${change.percentage.toFixed(1)}%`;
  }

  get progressPercent(): number {
    if (!this.config?.target) return 0;
    return Math.min(100, (this.config.value / this.config.target) * 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildSparkline();
    }
  }

  formatValue(value: number): string {
    return this.formatService.formatValue(
      value,
      this.config?.format || 'number',
      { decimals: this.config?.decimals }
    );
  }

  private calculateTrend(): 'up' | 'down' | 'neutral' {
    if (!this.config || this.config.previousValue === undefined) return 'neutral';
    if (this.config.value > this.config.previousValue) return 'up';
    if (this.config.value < this.config.previousValue) return 'down';
    return 'neutral';
  }

  private buildSparkline(): void {
    if (!this.config?.sparklineData?.length) return;

    const colors = this.themeService.getColors();

    this.sparklineOptions = {
      grid: {
        left: 0,
        right: 0,
        top: 5,
        bottom: 5
      },
      xAxis: {
        type: 'category',
        show: false,
        data: this.config.sparklineData.map((_, i) => i)
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [{
        type: 'line',
        data: this.config.sparklineData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: this.valueColor || colors.primary[0],
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: this.valueColor || colors.primary[0] },
              { offset: 1, color: 'rgba(255,255,255,0)' }
            ]
          }
        }
      }]
    };
  }
}
