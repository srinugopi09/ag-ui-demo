import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Chart Components
import { LineChartComponent } from '../../components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../components/charts/bar-chart/bar-chart.component';
import { AreaChartComponent } from '../../components/charts/area-chart/area-chart.component';
import { ComboChartComponent } from '../../components/charts/combo-chart/combo-chart.component';
import { WaterfallChartComponent } from '../../components/charts/waterfall-chart/waterfall-chart.component';
import { KpiCardComponent } from '../../components/charts/kpi-card/kpi-card.component';
import { GaugeChartComponent } from '../../components/charts/gauge-chart/gauge-chart.component';
import { BulletChartComponent } from '../../components/charts/bullet-chart/bullet-chart.component';
import { PieChartComponent } from '../../components/charts/pie-chart/pie-chart.component';
import { GanttChartComponent } from '../../components/charts/gantt-chart/gantt-chart.component';
import { HeatmapChartComponent } from '../../components/charts/heatmap-chart/heatmap-chart.component';
import { TreemapChartComponent } from '../../components/charts/treemap-chart/treemap-chart.component';
import { FunnelChartComponent } from '../../components/charts/funnel-chart/funnel-chart.component';
import { RadarChartComponent } from '../../components/charts/radar-chart/radar-chart.component';
import { DynamicChartRendererComponent } from '../../components/dynamic-renderer/dynamic-chart-renderer.component';

// Models
import {
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
  ChartConfig
} from '../../models/ag-ui.models';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
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
    RadarChartComponent,
    DynamicChartRendererComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>AG-UI Enterprise Charts Demo</span>
      <span class="spacer"></span>
      <button mat-icon-button (click)="toggleTheme()">
        <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
    </mat-toolbar>

    <mat-tab-group class="demo-tabs">
      <!-- Financial Charts -->
      <mat-tab label="Financial">
        <div class="tab-content">
          <h2>Financial & Revenue Charts</h2>

          <!-- KPI Cards Row -->
          <div class="kpi-row">
            <app-kpi-card [config]="revenueKpi"></app-kpi-card>
            <app-kpi-card [config]="profitKpi"></app-kpi-card>
            <app-kpi-card [config]="expenseKpi"></app-kpi-card>
            <app-kpi-card [config]="marginKpi"></app-kpi-card>
          </div>

          <!-- Charts Grid -->
          <div class="charts-grid">
            <div class="chart-item">
              <app-line-chart [config]="revenueLineChart"></app-line-chart>
            </div>
            <div class="chart-item">
              <app-bar-chart [config]="revenueBarChart"></app-bar-chart>
            </div>
            <div class="chart-item">
              <app-area-chart [config]="cumulativeAreaChart"></app-area-chart>
            </div>
            <div class="chart-item">
              <app-combo-chart [config]="targetVsActualChart"></app-combo-chart>
            </div>
            <div class="chart-item full-width">
              <app-waterfall-chart [config]="waterfallChart"></app-waterfall-chart>
            </div>
          </div>
        </div>
      </mat-tab>

      <!-- KPI & Metrics -->
      <mat-tab label="KPIs & Metrics">
        <div class="tab-content">
          <h2>KPI Dashboards & Metrics</h2>

          <div class="metrics-grid">
            <div class="metric-item">
              <app-gauge-chart [config]="performanceGauge"></app-gauge-chart>
            </div>
            <div class="metric-item">
              <app-gauge-chart [config]="satisfactionGauge"></app-gauge-chart>
            </div>
            <div class="metric-item">
              <app-gauge-chart [config]="utilizationGauge"></app-gauge-chart>
            </div>
          </div>

          <div class="bullet-row">
            <app-bullet-chart [config]="salesBullet"></app-bullet-chart>
            <app-bullet-chart [config]="qualityBullet"></app-bullet-chart>
          </div>

          <div class="charts-grid">
            <div class="chart-item">
              <app-radar-chart [config]="kpiRadarChart"></app-radar-chart>
            </div>
            <div class="chart-item">
              <app-pie-chart [config]="budgetPieChart"></app-pie-chart>
            </div>
          </div>
        </div>
      </mat-tab>

      <!-- Project Management -->
      <mat-tab label="Project Management">
        <div class="tab-content">
          <h2>Project Management Charts</h2>

          <div class="chart-item full-width">
            <app-gantt-chart [config]="projectGantt"></app-gantt-chart>
          </div>

          <div class="charts-grid">
            <div class="chart-item">
              <app-heatmap-chart [config]="resourceHeatmap"></app-heatmap-chart>
            </div>
            <div class="chart-item">
              <app-treemap-chart [config]="budgetTreemap"></app-treemap-chart>
            </div>
            <div class="chart-item">
              <app-funnel-chart [config]="salesFunnel"></app-funnel-chart>
            </div>
            <div class="chart-item">
              <app-pie-chart [config]="resourcePieChart"></app-pie-chart>
            </div>
          </div>
        </div>
      </mat-tab>

      <!-- Dynamic Renderer -->
      <mat-tab label="Dynamic Renderer">
        <div class="tab-content">
          <h2>AG-UI Dynamic Renderer Demo</h2>
          <p class="description">
            This demonstrates how charts can be dynamically rendered based on configurations
            received from your Python agent via the AG-UI protocol.
          </p>

          <div class="dynamic-controls">
            <button mat-raised-button color="primary" (click)="setDynamicChart('line-chart')">
              Line Chart
            </button>
            <button mat-raised-button color="primary" (click)="setDynamicChart('bar-chart')">
              Bar Chart
            </button>
            <button mat-raised-button color="primary" (click)="setDynamicChart('pie-chart')">
              Pie Chart
            </button>
            <button mat-raised-button color="primary" (click)="setDynamicChart('kpi-card')">
              KPI Card
            </button>
            <button mat-raised-button color="primary" (click)="setDynamicChart('gauge-chart')">
              Gauge
            </button>
            <button mat-raised-button color="primary" (click)="setDynamicChart('radar-chart')">
              Radar
            </button>
          </div>

          <div class="dynamic-chart-container">
            <app-dynamic-chart-renderer
              [config]="dynamicConfig"
              (chartClick)="onDynamicChartClick($event)">
            </app-dynamic-chart-renderer>
          </div>

          <div class="config-preview">
            <h3>Current Configuration (JSON)</h3>
            <pre>{{ dynamicConfig | json }}</pre>
          </div>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f5f5;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .spacer {
      flex: 1;
    }

    .demo-tabs {
      padding: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    h2 {
      margin: 0 0 24px;
      color: #333;
      font-weight: 500;
    }

    .description {
      color: #666;
      margin-bottom: 24px;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .chart-item {
      min-height: 400px;
    }

    .chart-item.full-width {
      grid-column: 1 / -1;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 24px;
    }

    .metric-item {
      min-height: 300px;
    }

    .bullet-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 24px;
    }

    .dynamic-controls {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .dynamic-chart-container {
      min-height: 400px;
      margin-bottom: 24px;
    }

    .config-preview {
      background: #1e1e1e;
      border-radius: 8px;
      padding: 16px;
    }

    .config-preview h3 {
      color: #fff;
      margin: 0 0 12px;
      font-size: 14px;
    }

    .config-preview pre {
      color: #9cdcfe;
      margin: 0;
      font-size: 12px;
      overflow-x: auto;
      max-height: 300px;
    }
  `]
})
export class DemoComponent {
  isDarkTheme = false;
  dynamicConfig: ChartConfig;

  // KPI Card Configurations
  revenueKpi: KpiCardConfig = {
    id: 'revenue-kpi',
    componentType: 'kpi-card',
    title: 'Total Revenue',
    value: 2847500,
    previousValue: 2456000,
    target: 3000000,
    format: 'currency',
    decimals: 0,
    sparklineData: [180, 195, 210, 205, 220, 235, 225, 240, 255, 265, 275, 285]
  };

  profitKpi: KpiCardConfig = {
    id: 'profit-kpi',
    componentType: 'kpi-card',
    title: 'Net Profit',
    value: 487000,
    previousValue: 420000,
    format: 'currency',
    decimals: 0,
    sparklineData: [30, 35, 32, 38, 42, 45, 48, 46, 52, 55, 58, 49]
  };

  expenseKpi: KpiCardConfig = {
    id: 'expense-kpi',
    componentType: 'kpi-card',
    title: 'Operating Expenses',
    value: 1250000,
    previousValue: 1180000,
    format: 'currency',
    decimals: 0,
    thresholds: { warning: 1300000, critical: 1500000 },
    sparklineData: [95, 98, 100, 102, 105, 108, 110, 115, 118, 120, 122, 125]
  };

  marginKpi: KpiCardConfig = {
    id: 'margin-kpi',
    componentType: 'kpi-card',
    title: 'Profit Margin',
    value: 17.1,
    previousValue: 15.8,
    target: 20,
    format: 'percentage',
    suffix: '%',
    sparklineData: [14, 14.5, 15, 15.2, 15.5, 16, 16.2, 16.5, 16.8, 17, 17.1, 17.1]
  };

  // Line Chart Configuration
  revenueLineChart: LineChartConfig = {
    id: 'revenue-trend',
    componentType: 'line-chart',
    title: 'Revenue Trend',
    subtitle: 'Monthly revenue over the past year',
    exportable: true,
    xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    xAxisLabel: 'Month',
    yAxisLabel: 'Revenue ($)',
    series: [
      { name: '2024', data: [180000, 195000, 210000, 205000, 220000, 235000, 225000, 240000, 255000, 265000, 275000, 285000] },
      { name: '2023', data: [150000, 165000, 175000, 180000, 190000, 195000, 200000, 210000, 215000, 225000, 230000, 245000] }
    ],
    smooth: true,
    showDataZoom: true
  };

  // Bar Chart Configuration
  revenueBarChart: BarChartConfig = {
    id: 'revenue-by-region',
    componentType: 'bar-chart',
    title: 'Revenue by Region',
    subtitle: 'Q4 2024 Performance',
    exportable: true,
    xAxisData: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
    series: [
      { name: 'Q3 2024', data: [450000, 380000, 290000, 120000, 85000] },
      { name: 'Q4 2024', data: [520000, 410000, 350000, 145000, 95000] }
    ],
    stacked: false
  };

  // Area Chart Configuration
  cumulativeAreaChart: AreaChartConfig = {
    id: 'cumulative-revenue',
    componentType: 'area-chart',
    title: 'Cumulative Revenue',
    exportable: true,
    xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Product A', data: [120, 132, 101, 134, 90, 230] },
      { name: 'Product B', data: [220, 182, 191, 234, 290, 330] },
      { name: 'Product C', data: [150, 232, 201, 154, 190, 330] }
    ],
    stacked: true,
    gradient: true
  };

  // Combo Chart Configuration
  targetVsActualChart: ComboChartConfig = {
    id: 'target-vs-actual',
    componentType: 'combo-chart',
    title: 'Actual vs Target Revenue',
    exportable: true,
    xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    yAxisLabels: ['Revenue ($)', 'Target ($)'],
    series: [
      { name: 'Actual', type: 'bar', data: [180, 195, 210, 205, 220, 235] },
      { name: 'Target', type: 'line', data: [200, 200, 200, 220, 220, 220], yAxisIndex: 1, smooth: true }
    ]
  };

  // Waterfall Chart Configuration
  waterfallChart: WaterfallChartConfig = {
    id: 'revenue-waterfall',
    componentType: 'waterfall-chart',
    title: 'Revenue Bridge Analysis',
    subtitle: 'Q3 to Q4 2024',
    exportable: true,
    data: [
      { name: 'Q3 Revenue', value: 1250000, itemType: 'total' },
      { name: 'New Customers', value: 180000 },
      { name: 'Upsells', value: 95000 },
      { name: 'Renewals', value: 45000 },
      { name: 'Churn', value: -85000 },
      { name: 'Price Adjustments', value: -25000 },
      { name: 'Q4 Revenue', value: 0, itemType: 'total' }
    ]
  };

  // Gauge Configurations
  performanceGauge: GaugeChartConfig = {
    id: 'performance-gauge',
    componentType: 'gauge-chart',
    title: 'Performance Score',
    value: 78,
    min: 0,
    max: 100,
    unit: '%'
  };

  satisfactionGauge: GaugeChartConfig = {
    id: 'satisfaction-gauge',
    componentType: 'gauge-chart',
    title: 'Customer Satisfaction',
    value: 4.2,
    min: 0,
    max: 5,
    splitNumber: 5
  };

  utilizationGauge: GaugeChartConfig = {
    id: 'utilization-gauge',
    componentType: 'gauge-chart',
    title: 'Resource Utilization',
    value: 85,
    min: 0,
    max: 100,
    unit: '%'
  };

  // Bullet Chart Configurations
  salesBullet: BulletChartConfig = {
    id: 'sales-bullet',
    componentType: 'bullet-chart',
    title: 'Sales Performance',
    actual: 275,
    target: 300,
    min: 0,
    max: 350,
    unit: 'K',
    ranges: [
      { value: 150, color: '#ee6666', label: 'Poor' },
      { value: 250, color: '#fac858', label: 'Average' },
      { value: 350, color: '#91cc75', label: 'Good' }
    ]
  };

  qualityBullet: BulletChartConfig = {
    id: 'quality-bullet',
    componentType: 'bullet-chart',
    title: 'Quality Score',
    actual: 92,
    target: 95,
    min: 0,
    max: 100,
    unit: '%',
    ranges: [
      { value: 70, color: '#ee6666', label: 'Below Target' },
      { value: 85, color: '#fac858', label: 'Near Target' },
      { value: 100, color: '#91cc75', label: 'On Target' }
    ]
  };

  // Radar Chart Configuration
  kpiRadarChart: RadarChartConfig = {
    id: 'kpi-radar',
    componentType: 'radar-chart',
    title: 'Department KPI Comparison',
    exportable: true,
    indicators: [
      { name: 'Sales', max: 100 },
      { name: 'Marketing', max: 100 },
      { name: 'Engineering', max: 100 },
      { name: 'Support', max: 100 },
      { name: 'Operations', max: 100 }
    ],
    series: [
      { name: 'Target', value: [90, 85, 88, 92, 87] },
      { name: 'Actual', value: [85, 82, 92, 88, 78] }
    ],
    showArea: true
  };

  // Pie/Donut Chart Configurations
  budgetPieChart: PieChartConfig = {
    id: 'budget-pie',
    componentType: 'pie-chart',
    title: 'Budget Allocation',
    exportable: true,
    donut: true,
    data: [
      { name: 'Engineering', value: 450000 },
      { name: 'Marketing', value: 280000 },
      { name: 'Sales', value: 320000 },
      { name: 'Operations', value: 180000 },
      { name: 'HR', value: 120000 }
    ]
  };

  resourcePieChart: PieChartConfig = {
    id: 'resource-pie',
    componentType: 'pie-chart',
    title: 'Resource Distribution',
    exportable: true,
    data: [
      { name: 'Development', value: 45 },
      { name: 'QA', value: 20 },
      { name: 'DevOps', value: 15 },
      { name: 'Design', value: 12 },
      { name: 'Management', value: 8 }
    ]
  };

  // Gantt Chart Configuration
  projectGantt: GanttChartConfig = {
    id: 'project-gantt',
    componentType: 'gantt-chart',
    title: 'Project Timeline',
    subtitle: 'Q1 2025 Roadmap',
    exportable: true,
    showProgress: true,
    tasks: [
      { id: '1', name: 'Requirements Gathering', start: '2025-01-01', end: '2025-01-15', progress: 100, status: 'completed' },
      { id: '2', name: 'System Design', start: '2025-01-10', end: '2025-01-31', progress: 80, status: 'in-progress' },
      { id: '3', name: 'Backend Development', start: '2025-01-20', end: '2025-02-28', progress: 40, status: 'in-progress' },
      { id: '4', name: 'Frontend Development', start: '2025-02-01', end: '2025-03-15', progress: 20, status: 'in-progress' },
      { id: '5', name: 'Integration Testing', start: '2025-03-01', end: '2025-03-20', progress: 0, status: 'not-started' },
      { id: '6', name: 'User Acceptance Testing', start: '2025-03-15', end: '2025-03-31', progress: 0, status: 'not-started' }
    ]
  };

  // Heatmap Configuration
  resourceHeatmap: HeatmapChartConfig = {
    id: 'resource-heatmap',
    componentType: 'heatmap-chart',
    title: 'Team Utilization Matrix',
    subtitle: 'Hours per project per week',
    exportable: true,
    xAxisData: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    yAxisData: ['Project A', 'Project B', 'Project C', 'Project D'],
    data: [
      [0, 0, 35], [1, 0, 40], [2, 0, 38], [3, 0, 42],
      [0, 1, 28], [1, 1, 32], [2, 1, 30], [3, 1, 25],
      [0, 2, 15], [1, 2, 18], [2, 2, 22], [3, 2, 28],
      [0, 3, 8], [1, 3, 12], [2, 3, 15], [3, 3, 18]
    ],
    showLabels: true
  };

  // Treemap Configuration
  budgetTreemap: TreemapChartConfig = {
    id: 'budget-treemap',
    componentType: 'treemap-chart',
    title: 'Hierarchical Budget View',
    exportable: true,
    showBreadcrumb: true,
    data: [
      {
        name: 'Technology',
        children: [
          { name: 'Cloud Infrastructure', value: 180000 },
          { name: 'Software Licenses', value: 95000 },
          { name: 'Hardware', value: 65000 },
          { name: 'Security', value: 45000 }
        ]
      },
      {
        name: 'Personnel',
        children: [
          { name: 'Salaries', value: 450000 },
          { name: 'Benefits', value: 120000 },
          { name: 'Training', value: 35000 }
        ]
      },
      {
        name: 'Operations',
        children: [
          { name: 'Facilities', value: 85000 },
          { name: 'Utilities', value: 25000 },
          { name: 'Supplies', value: 15000 }
        ]
      }
    ]
  };

  // Funnel Chart Configuration
  salesFunnel: FunnelChartConfig = {
    id: 'sales-funnel',
    componentType: 'funnel-chart',
    title: 'Sales Pipeline',
    subtitle: 'Current quarter',
    exportable: true,
    showConversionRate: true,
    data: [
      { name: 'Leads', value: 1200 },
      { name: 'Qualified', value: 840 },
      { name: 'Proposal', value: 520 },
      { name: 'Negotiation', value: 280 },
      { name: 'Closed Won', value: 145 }
    ]
  };

  constructor() {
    // Initialize with a line chart
    this.dynamicConfig = this.createDynamicConfig('line-chart');
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    // Theme toggling would be implemented via ChartThemeService
  }

  setDynamicChart(type: string): void {
    this.dynamicConfig = this.createDynamicConfig(type);
  }

  onDynamicChartClick(event: unknown): void {
    console.log('Chart clicked:', event);
  }

  private createDynamicConfig(type: string): ChartConfig {
    const baseConfig = {
      id: `dynamic-${type}`,
      title: `Dynamic ${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      exportable: true,
      animation: true
    };

    switch (type) {
      case 'line-chart':
        return {
          ...baseConfig,
          componentType: 'line-chart',
          xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          series: [
            { name: 'This Week', data: [120, 200, 150, 80, 70, 110, 130] },
            { name: 'Last Week', data: [100, 180, 140, 90, 60, 100, 120] }
          ],
          smooth: true
        } as LineChartConfig;

      case 'bar-chart':
        return {
          ...baseConfig,
          componentType: 'bar-chart',
          xAxisData: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [
            { name: 'Sales', data: [320, 380, 350, 420] },
            { name: 'Returns', data: [20, 25, 18, 22] }
          ]
        } as BarChartConfig;

      case 'pie-chart':
        return {
          ...baseConfig,
          componentType: 'pie-chart',
          donut: true,
          data: [
            { name: 'Category A', value: 335 },
            { name: 'Category B', value: 310 },
            { name: 'Category C', value: 234 },
            { name: 'Category D', value: 135 }
          ]
        } as PieChartConfig;

      case 'kpi-card':
        return {
          ...baseConfig,
          componentType: 'kpi-card',
          title: 'Dynamic KPI',
          value: 42567,
          previousValue: 38000,
          target: 50000,
          format: 'currency',
          sparklineData: [30, 35, 38, 36, 40, 42, 41, 43, 42, 42.5]
        } as KpiCardConfig;

      case 'gauge-chart':
        return {
          ...baseConfig,
          componentType: 'gauge-chart',
          value: 72,
          min: 0,
          max: 100,
          unit: '%'
        } as GaugeChartConfig;

      case 'radar-chart':
        return {
          ...baseConfig,
          componentType: 'radar-chart',
          indicators: [
            { name: 'Speed', max: 100 },
            { name: 'Quality', max: 100 },
            { name: 'Cost', max: 100 },
            { name: 'Reliability', max: 100 },
            { name: 'Support', max: 100 }
          ],
          series: [
            { name: 'Product A', value: [80, 90, 70, 85, 75] },
            { name: 'Product B', value: [70, 75, 90, 80, 85] }
          ],
          showArea: true
        } as RadarChartConfig;

      default:
        return {
          ...baseConfig,
          componentType: 'line-chart',
          xAxisData: ['A', 'B', 'C'],
          series: [{ name: 'Data', data: [1, 2, 3] }]
        } as LineChartConfig;
    }
  }
}
