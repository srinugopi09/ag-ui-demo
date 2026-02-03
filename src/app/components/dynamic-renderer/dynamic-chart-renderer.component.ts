import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { AreaChartComponent } from '../charts/area-chart/area-chart.component';
import { ComboChartComponent } from '../charts/combo-chart/combo-chart.component';
import { WaterfallChartComponent } from '../charts/waterfall-chart/waterfall-chart.component';
import { KpiCardComponent } from '../charts/kpi-card/kpi-card.component';
import { GaugeChartComponent } from '../charts/gauge-chart/gauge-chart.component';
import { BulletChartComponent } from '../charts/bullet-chart/bullet-chart.component';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { GanttChartComponent } from '../charts/gantt-chart/gantt-chart.component';
import { HeatmapChartComponent } from '../charts/heatmap-chart/heatmap-chart.component';
import { TreemapChartComponent } from '../charts/treemap-chart/treemap-chart.component';
import { FunnelChartComponent } from '../charts/funnel-chart/funnel-chart.component';
import { RadarChartComponent } from '../charts/radar-chart/radar-chart.component';

import {
  ChartConfig,
  LineChartConfig,
  BarChartConfig,
  AreaChartConfig,
  ComboChartConfig,
  WaterfallChartConfig,
  KpiCardConfig,
  GaugeChartConfig,
  BulletChartConfig,
  PieChartConfig,
  GanttChartConfig,
  HeatmapChartConfig,
  TreemapChartConfig,
  FunnelChartConfig,
  RadarChartConfig,
  ChartClickEvent
} from '../../models/ag-ui.models';

/**
 * Dynamic Chart Renderer for AG-UI Protocol
 *
 * This component receives chart configurations from the AG-UI protocol
 * and dynamically renders the appropriate chart component.
 *
 * Usage:
 * <app-dynamic-chart-renderer
 *   [config]="chartConfigFromAgent"
 *   (chartClick)="handleClick($event)"
 *   (chartDrilldown)="handleDrilldown($event)">
 * </app-dynamic-chart-renderer>
 */
@Component({
  selector: 'app-dynamic-chart-renderer',
  standalone: true,
  imports: [
    CommonModule,
    LineChartComponent,
    BarChartComponent,
    AreaChartComponent,
    ComboChartComponent,
    WaterfallChartComponent,
    KpiCardComponent,
    GaugeChartComponent,
    BulletChartComponent,
    PieChartComponent,
    GanttChartComponent,
    HeatmapChartComponent,
    TreemapChartComponent,
    FunnelChartComponent,
    RadarChartComponent
  ],
  template: `
    <ng-container [ngSwitch]="config?.componentType">
      <!-- Line Chart -->
      <app-line-chart
        *ngSwitchCase="'line-chart'"
        [config]="asLineChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-line-chart>

      <!-- Bar Chart -->
      <app-bar-chart
        *ngSwitchCase="'bar-chart'"
        [config]="asBarChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-bar-chart>

      <!-- Area Chart -->
      <app-area-chart
        *ngSwitchCase="'area-chart'"
        [config]="asAreaChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-area-chart>

      <!-- Combo Chart -->
      <app-combo-chart
        *ngSwitchCase="'combo-chart'"
        [config]="asComboChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-combo-chart>

      <!-- Waterfall Chart -->
      <app-waterfall-chart
        *ngSwitchCase="'waterfall-chart'"
        [config]="asWaterfallChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-waterfall-chart>

      <!-- KPI Card -->
      <app-kpi-card
        *ngSwitchCase="'kpi-card'"
        [config]="asKpiCard(config)">
      </app-kpi-card>

      <!-- Gauge Chart -->
      <app-gauge-chart
        *ngSwitchCase="'gauge-chart'"
        [config]="asGaugeChart(config)">
      </app-gauge-chart>

      <!-- Bullet Chart -->
      <app-bullet-chart
        *ngSwitchCase="'bullet-chart'"
        [config]="asBulletChart(config)">
      </app-bullet-chart>

      <!-- Pie/Donut Chart -->
      <app-pie-chart
        *ngSwitchCase="'pie-chart'"
        [config]="asPieChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-pie-chart>

      <!-- Gantt Chart -->
      <app-gantt-chart
        *ngSwitchCase="'gantt-chart'"
        [config]="asGanttChart(config)"
        (chartClick)="onChartClick($event)">
      </app-gantt-chart>

      <!-- Heatmap Chart -->
      <app-heatmap-chart
        *ngSwitchCase="'heatmap-chart'"
        [config]="asHeatmapChart(config)"
        (chartClick)="onChartClick($event)">
      </app-heatmap-chart>

      <!-- Treemap Chart -->
      <app-treemap-chart
        *ngSwitchCase="'treemap-chart'"
        [config]="asTreemapChart(config)"
        (chartClick)="onChartClick($event)"
        (chartDrilldown)="onDrilldown($event)">
      </app-treemap-chart>

      <!-- Funnel Chart -->
      <app-funnel-chart
        *ngSwitchCase="'funnel-chart'"
        [config]="asFunnelChart(config)"
        (chartClick)="onChartClick($event)">
      </app-funnel-chart>

      <!-- Radar Chart -->
      <app-radar-chart
        *ngSwitchCase="'radar-chart'"
        [config]="asRadarChart(config)"
        (chartClick)="onChartClick($event)">
      </app-radar-chart>

      <!-- Unknown component type -->
      <div *ngSwitchDefault class="unknown-component">
        <p>Unknown chart type: {{ config?.componentType }}</p>
      </div>
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .unknown-component {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class DynamicChartRendererComponent implements OnChanges {
  @Input() config?: ChartConfig;

  @Output() chartClick = new EventEmitter<ChartClickEvent>();
  @Output() chartDrilldown = new EventEmitter<unknown>();
  @Output() chartFilter = new EventEmitter<unknown>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      // Config changed - component will re-render
    }
  }

  onChartClick(event: ChartClickEvent): void {
    this.chartClick.emit(event);
  }

  onDrilldown(event: unknown): void {
    this.chartDrilldown.emit(event);
  }

  // Type guard methods for template type safety
  asLineChart(config: ChartConfig | undefined): LineChartConfig | undefined {
    return config as LineChartConfig;
  }

  asBarChart(config: ChartConfig | undefined): BarChartConfig | undefined {
    return config as BarChartConfig;
  }

  asAreaChart(config: ChartConfig | undefined): AreaChartConfig | undefined {
    return config as AreaChartConfig;
  }

  asComboChart(config: ChartConfig | undefined): ComboChartConfig | undefined {
    return config as ComboChartConfig;
  }

  asWaterfallChart(config: ChartConfig | undefined): WaterfallChartConfig | undefined {
    return config as WaterfallChartConfig;
  }

  asKpiCard(config: ChartConfig | undefined): KpiCardConfig | undefined {
    return config as KpiCardConfig;
  }

  asGaugeChart(config: ChartConfig | undefined): GaugeChartConfig | undefined {
    return config as GaugeChartConfig;
  }

  asBulletChart(config: ChartConfig | undefined): BulletChartConfig | undefined {
    return config as BulletChartConfig;
  }

  asPieChart(config: ChartConfig | undefined): PieChartConfig | undefined {
    return config as PieChartConfig;
  }

  asGanttChart(config: ChartConfig | undefined): GanttChartConfig | undefined {
    return config as GanttChartConfig;
  }

  asHeatmapChart(config: ChartConfig | undefined): HeatmapChartConfig | undefined {
    return config as HeatmapChartConfig;
  }

  asTreemapChart(config: ChartConfig | undefined): TreemapChartConfig | undefined {
    return config as TreemapChartConfig;
  }

  asFunnelChart(config: ChartConfig | undefined): FunnelChartConfig | undefined {
    return config as FunnelChartConfig;
  }

  asRadarChart(config: ChartConfig | undefined): RadarChartConfig | undefined {
    return config as RadarChartConfig;
  }
}
