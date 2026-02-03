import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, GaugeChart, RadarChart, TreemapChart, FunnelChart, HeatmapChart, CustomChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

// Use a more permissive type for the chart instance to handle ngx-echarts compatibility
type EChartsInstance = ReturnType<typeof echarts.init>;
import { Subject, Subscription, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ChartThemeService } from '../../services/chart-theme.service';
import { ChartExportService } from '../../services/chart-export.service';
import { ChartInteractionService } from '../../services/chart-interaction.service';
import { BaseChartConfig, ChartClickEvent, ExportOptions } from '../../models/ag-ui.models';

// Register ECharts components
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  RadarChart,
  TreemapChart,
  FunnelChart,
  HeatmapChart,
  CustomChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-base-chart',
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
            <button mat-menu-item (click)="export('svg')">
              <mat-icon>code</mat-icon>
              <span>Export as SVG</span>
            </button>
            <button mat-menu-item (click)="export('csv')">
              <mat-icon>table_chart</mat-icon>
              <span>Export as CSV</span>
            </button>
            <button mat-menu-item (click)="export('json')">
              <mat-icon>data_object</mat-icon>
              <span>Export as JSON</span>
            </button>
          </mat-menu>
          <button mat-icon-button (click)="refresh()" matTooltip="Refresh" *ngIf="config?.realTimeEnabled">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </mat-card-header>
      <mat-card-content class="chart-content">
        <div
          #chartContainer
          echarts
          [options]="chartOptions()"
          [merge]="mergeOptions()"
          class="chart-container"
          (chartInit)="onChartInit($event)"
          (chartClick)="onChartClick($event)"
          (chartDblClick)="onChartDblClick($event)"
        ></div>
        <div class="loading-overlay" *ngIf="loading()">
          <mat-icon class="spin">sync</mat-icon>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .chart-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      padding: 16px 16px 0;
    }

    mat-card-title {
      flex: 1;
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    mat-card-subtitle {
      margin: 4px 0 0;
      font-size: 12px;
    }

    .chart-actions {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }

    .chart-content {
      flex: 1;
      padding: 16px;
      position: relative;
      min-height: 0;
    }

    .chart-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class BaseChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  @Input() config?: BaseChartConfig;

  @Output() chartClick = new EventEmitter<ChartClickEvent>();
  @Output() chartDrilldown = new EventEmitter<unknown>();
  @Output() chartFilter = new EventEmitter<unknown>();
  @Output() chartRefresh = new EventEmitter<void>();

  protected themeService = inject(ChartThemeService);
  protected exportService = inject(ChartExportService);
  protected interactionService = inject(ChartInteractionService);

  protected chartInstance: EChartsInstance | null = null;
  protected destroy$ = new Subject<void>();
  protected refreshSubscription?: Subscription;

  protected loading = signal(false);
  protected chartOptions = signal<EChartsOption>({});
  protected mergeOptions = signal<EChartsOption>({});

  ngAfterViewInit(): void {
    if (this.config?.id) {
      this.interactionService.registerChart(this.config.id);

      // Subscribe to real-time updates
      if (this.config.realTimeEnabled) {
        this.interactionService.onUpdates(this.config.id)?.pipe(
          takeUntil(this.destroy$)
        ).subscribe(data => {
          this.handleRealtimeUpdate(data);
        });

        // Auto-refresh if interval is set
        if (this.config.refreshInterval) {
          this.refreshSubscription = interval(this.config.refreshInterval).pipe(
            takeUntil(this.destroy$)
          ).subscribe(() => {
            this.refresh();
          });
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.config?.id) {
      this.interactionService.unregisterChart(this.config.id);
    }
    this.refreshSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.chartInstance?.dispose();
  }

  onChartInit(chart: unknown): void {
    this.chartInstance = chart as EChartsInstance;
  }

  onChartClick(event: unknown): void {
    if (!this.config) return;

    const clickEvent: ChartClickEvent = {
      chartId: this.config.id,
      componentType: (this.config as { componentType?: string }).componentType || 'unknown',
      dataIndex: (event as { dataIndex?: number }).dataIndex || 0,
      seriesName: (event as { seriesName?: string }).seriesName,
      data: (event as { data?: unknown }).data,
      event: 'click'
    };

    this.chartClick.emit(clickEvent);
    this.interactionService.emitClick(clickEvent);

    if (this.config.clickToFilterEnabled) {
      this.handleClickToFilter(event);
    }
  }

  onChartDblClick(event: unknown): void {
    if (!this.config?.drilldownEnabled) return;

    this.chartDrilldown.emit({
      chartId: this.config.id,
      data: event
    });
  }

  export(format: 'png' | 'svg' | 'csv' | 'json'): void {
    if (!this.chartInstance) return;

    const options: ExportOptions = {
      format,
      filename: this.config?.title || `chart-${this.config?.id}`
    };

    if (format === 'png' || format === 'svg') {
      this.exportService.exportAsImage(this.chartInstance, options);
    } else if (format === 'json') {
      this.exportService.exportAsJson(this.getExportData(), options.filename);
    } else if (format === 'csv') {
      const csvData = this.getCsvData();
      if (csvData) {
        this.exportService.exportAsCsv(csvData, options.filename);
      }
    }
  }

  refresh(): void {
    this.loading.set(true);
    this.chartRefresh.emit();
    // Loading will be set to false when new data arrives
    setTimeout(() => this.loading.set(false), 500);
  }

  // Override in child components
  protected getExportData(): unknown {
    return this.chartOptions();
  }

  // Override in child components
  protected getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    return null;
  }

  // Override in child components
  protected handleRealtimeUpdate(data: unknown): void {
    console.log('Real-time update received:', data);
  }

  // Override in child components
  protected handleClickToFilter(event: unknown): void {
    if (!this.config) return;

    this.chartFilter.emit({
      chartId: this.config.id,
      filterType: 'include',
      filterValue: (event as { data?: unknown }).data
    });
  }

  protected updateChart(options: EChartsOption): void {
    this.mergeOptions.set(options);
  }
}
