/**
 * AG-UI Protocol Models for Generative UI
 * These models define the contract between the Python agent and Angular frontend
 */

// Base chart configuration that all charts inherit from
export interface BaseChartConfig {
  id: string;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark' | 'custom';
  animation?: boolean;
  exportable?: boolean;
  drilldownEnabled?: boolean;
  clickToFilterEnabled?: boolean;
  realTimeEnabled?: boolean;
  refreshInterval?: number; // milliseconds
  height?: string;
  width?: string;
}

// Data point for time series
export interface TimeSeriesDataPoint {
  date: string; // ISO date string
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// Data point for categorical data
export interface CategoricalDataPoint {
  category: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

// Series configuration for multi-series charts
export interface ChartSeries {
  name: string;
  data: number[] | TimeSeriesDataPoint[] | CategoricalDataPoint[];
  type?: 'line' | 'bar' | 'area' | 'scatter';
  color?: string;
  stack?: string;
  yAxisIndex?: number;
  smooth?: boolean;
  areaStyle?: { opacity?: number };
}

// Line Chart Configuration
export interface LineChartConfig extends BaseChartConfig {
  componentType: 'line-chart';
  xAxisData: string[];
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showDataZoom?: boolean;
  smooth?: boolean;
  showArea?: boolean;
}

// Bar Chart Configuration
export interface BarChartConfig extends BaseChartConfig {
  componentType: 'bar-chart';
  xAxisData: string[];
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  horizontal?: boolean;
  stacked?: boolean;
  showDataZoom?: boolean;
}

// Area Chart Configuration
export interface AreaChartConfig extends BaseChartConfig {
  componentType: 'area-chart';
  xAxisData: string[];
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  stacked?: boolean;
  gradient?: boolean;
  showDataZoom?: boolean;
}

// Combo Chart Configuration (Line + Bar)
export interface ComboChartConfig extends BaseChartConfig {
  componentType: 'combo-chart';
  xAxisData: string[];
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabels?: [string, string]; // Primary and secondary Y-axis labels
  showDataZoom?: boolean;
}

// Waterfall Chart Configuration
export interface WaterfallDataPoint {
  name: string;
  value: number;
  itemType?: 'increase' | 'decrease' | 'total';
}

export interface WaterfallChartConfig extends BaseChartConfig {
  componentType: 'waterfall-chart';
  data: WaterfallDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: {
    increase?: string;
    decrease?: string;
    total?: string;
  };
}

// KPI Card Configuration
export interface KpiCardConfig extends BaseChartConfig {
  componentType: 'kpi-card';
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  sparklineData?: number[];
  format?: 'number' | 'currency' | 'percentage';
  decimals?: number;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

// Gauge Chart Configuration
export interface GaugeChartConfig extends BaseChartConfig {
  componentType: 'gauge-chart';
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  thresholds?: {
    ranges: { start: number; end: number; color: string }[];
  };
  showPointer?: boolean;
  splitNumber?: number;
}

// Bullet Chart Configuration
export interface BulletChartConfig extends BaseChartConfig {
  componentType: 'bullet-chart';
  actual: number;
  target: number;
  ranges: { value: number; color: string; label?: string }[];
  min?: number;
  max?: number;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
}

// Pie/Donut Chart Configuration
export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
  selected?: boolean;
}

export interface PieChartConfig extends BaseChartConfig {
  componentType: 'pie-chart';
  data: PieChartDataPoint[];
  donut?: boolean;
  innerRadius?: string;
  outerRadius?: string;
  showLabels?: boolean;
  labelPosition?: 'inside' | 'outside';
  roseType?: boolean | 'radius' | 'area';
}

// Gantt Chart Configuration
export interface GanttTask {
  id: string;
  name: string;
  start: string; // ISO date
  end: string; // ISO date
  progress?: number;
  dependencies?: string[];
  color?: string;
  category?: string;
  assignee?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

export interface GanttChartConfig extends BaseChartConfig {
  componentType: 'gantt-chart';
  tasks: GanttTask[];
  startDate?: string;
  endDate?: string;
  showProgress?: boolean;
  showDependencies?: boolean;
  categories?: string[];
}

// Heatmap Configuration
export interface HeatmapChartConfig extends BaseChartConfig {
  componentType: 'heatmap-chart';
  xAxisData: string[];
  yAxisData: string[];
  data: [number, number, number][]; // [xIndex, yIndex, value]
  min?: number;
  max?: number;
  colorRange?: string[];
  showLabels?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// Treemap Configuration
export interface TreemapNode {
  name: string;
  value?: number;
  children?: TreemapNode[];
  itemStyle?: { color?: string };
}

export interface TreemapChartConfig extends BaseChartConfig {
  componentType: 'treemap-chart';
  data: TreemapNode[];
  colorRange?: string[];
  showBreadcrumb?: boolean;
  leafDepth?: number;
  levels?: {
    colorSaturation?: [number, number];
    itemStyle?: { borderColor?: string; borderWidth?: number };
  }[];
}

// Funnel Chart Configuration
export interface FunnelDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface FunnelChartConfig extends BaseChartConfig {
  componentType: 'funnel-chart';
  data: FunnelDataPoint[];
  sort?: 'ascending' | 'descending' | 'none';
  orient?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showConversionRate?: boolean;
  gap?: number;
}

// Radar Chart Configuration
export interface RadarIndicator {
  name: string;
  max: number;
  min?: number;
}

export interface RadarSeriesData {
  name: string;
  value: number[];
  color?: string;
  areaStyle?: { opacity?: number };
}

export interface RadarChartConfig extends BaseChartConfig {
  componentType: 'radar-chart';
  indicators: RadarIndicator[];
  series: RadarSeriesData[];
  shape?: 'polygon' | 'circle';
  showArea?: boolean;
}

// Union type for all chart configurations
export type ChartConfig =
  | LineChartConfig
  | BarChartConfig
  | AreaChartConfig
  | ComboChartConfig
  | WaterfallChartConfig
  | KpiCardConfig
  | GaugeChartConfig
  | BulletChartConfig
  | PieChartConfig
  | GanttChartConfig
  | HeatmapChartConfig
  | TreemapChartConfig
  | FunnelChartConfig
  | RadarChartConfig;

// AG-UI Event types
export interface AgUiCustomEvent {
  type: 'CUSTOM';
  name: string;
  value: ChartConfig | ChartConfig[];
}

export interface AgUiStreamEvent {
  type: 'STREAM_UPDATE';
  chartId: string;
  data: unknown;
}

// Chart interaction events (emitted from components)
export interface ChartClickEvent {
  chartId: string;
  componentType: string;
  dataIndex: number;
  seriesName?: string;
  data: unknown;
  event: 'click' | 'dblclick';
}

export interface ChartDrilldownEvent {
  chartId: string;
  componentType: string;
  path: string[];
  data: unknown;
}

export interface ChartFilterEvent {
  chartId: string;
  componentType: string;
  filterType: 'include' | 'exclude';
  filterValue: unknown;
}

// Export options
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv' | 'json';
  filename?: string;
  quality?: number;
  backgroundColor?: string;
}
