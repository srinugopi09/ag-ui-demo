# AG-UI Enterprise Charts for Angular

A comprehensive set of enterprise-ready chart components for Angular applications using the AG-UI (Agent-to-UI) protocol. Built with Apache ECharts and Angular Material.

## Features

- **14 Chart Components** for financial, KPI, and project management visualizations
- **AG-UI Protocol Integration** for seamless agent-to-UI communication
- **Dynamic Rendering** - Render charts from JSON configurations sent by your Python agent
- **Export Capabilities** - Export charts as PNG, SVG, CSV, or JSON
- **Real-time Updates** - Support for streaming data updates
- **Click-to-Filter & Drilldown** - Interactive data exploration
- **Angular Material Theme** - Consistent enterprise styling

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Navigate to `http://localhost:4200/` to see the demo.

## Chart Components

### Financial Charts

| Component | Description | Use Cases |
|-----------|-------------|-----------|
| `app-line-chart` | Line chart with smooth curves | Revenue trends, time series data |
| `app-bar-chart` | Vertical/horizontal bar chart | Revenue by category, comparisons |
| `app-area-chart` | Stacked area chart with gradients | Cumulative metrics, composition over time |
| `app-combo-chart` | Combined line + bar chart | Actuals vs targets, dual-axis metrics |
| `app-waterfall-chart` | Waterfall/bridge chart | Variance analysis, P&L breakdown |

### KPI & Metrics

| Component | Description | Use Cases |
|-----------|-------------|-----------|
| `app-kpi-card` | KPI card with sparkline | Single metric display with trend |
| `app-gauge-chart` | Circular gauge | Performance scores, utilization |
| `app-bullet-chart` | Bullet chart with ranges | Target vs actual comparison |
| `app-radar-chart` | Spider/radar chart | Multi-dimensional KPI comparison |

### Project Management

| Component | Description | Use Cases |
|-----------|-------------|-----------|
| `app-pie-chart` | Pie/donut chart | Budget distribution, composition |
| `app-gantt-chart` | Gantt chart | Project timelines, task scheduling |
| `app-heatmap-chart` | Heatmap matrix | Resource utilization, activity matrix |
| `app-treemap-chart` | Hierarchical treemap | Budget hierarchy, category breakdown |
| `app-funnel-chart` | Funnel chart | Sales pipeline, conversion rates |

## Usage

### Standalone Components

```typescript
import { LineChartComponent } from './components/charts';

@Component({
  imports: [LineChartComponent],
  template: `<app-line-chart [config]="chartConfig"></app-line-chart>`
})
export class MyComponent {
  chartConfig: LineChartConfig = {
    id: 'revenue-chart',
    componentType: 'line-chart',
    title: 'Monthly Revenue',
    xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { name: 'Revenue', data: [150, 230, 224, 218, 135, 147] }
    ],
    smooth: true,
    exportable: true
  };
}
```

### Dynamic Rendering (AG-UI Protocol)

```typescript
import { DynamicChartRendererComponent } from './components/dynamic-renderer';
import { AgUiService } from './services/ag-ui.service';

@Component({
  imports: [DynamicChartRendererComponent],
  template: `
    <app-dynamic-chart-renderer
      [config]="chartConfig"
      (chartClick)="onChartClick($event)">
    </app-dynamic-chart-renderer>
  `
})
export class DashboardComponent {
  chartConfig: ChartConfig;

  constructor(private agUiService: AgUiService) {
    // Listen for chart configurations from the agent
    this.agUiService.chartConfig$.subscribe(config => {
      this.chartConfig = config;
    });
  }
}
```

## AG-UI Protocol Integration

### Python Agent (Google ADK)

Your Python agent can send chart configurations using the AG-UI protocol:

```python
from ag_ui import CustomEvent

# Send a chart configuration to the UI
yield CustomEvent(
    name="render_chart",
    value={
        "componentType": "line-chart",
        "id": "revenue-chart",
        "title": "Monthly Revenue",
        "xAxisData": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "series": [{"name": "Revenue", "data": [100, 150, 200, 180, 220, 250]}],
        "smooth": True,
        "exportable": True
    }
)

# Send multiple charts for a dashboard
yield CustomEvent(
    name="render_dashboard",
    value=[
        {"componentType": "kpi-card", ...},
        {"componentType": "bar-chart", ...},
        {"componentType": "pie-chart", ...}
    ]
)

# Stream real-time updates
yield CustomEvent(
    name="stream_data",
    value={
        "chartId": "revenue-chart",
        "data": {"newPoint": 280}
    }
)
```

### Angular Service

Handle AG-UI events in your Angular application:

```typescript
import { AgUiService } from './services/ag-ui.service';

// When you receive an AG-UI event from your WebSocket/SSE connection
this.agUiService.handleAgUiEvent({
  name: 'render_chart',
  value: chartConfigFromAgent
});
```

## Configuration Models

All chart configurations extend `BaseChartConfig`:

```typescript
interface BaseChartConfig {
  id: string;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  animation?: boolean;
  exportable?: boolean;
  drilldownEnabled?: boolean;
  clickToFilterEnabled?: boolean;
  realTimeEnabled?: boolean;
  refreshInterval?: number;
  height?: string;
  width?: string;
}
```

See `src/app/models/ag-ui.models.ts` for complete type definitions.

## Services

| Service | Purpose |
|---------|---------|
| `ChartThemeService` | Theme management (light/dark) |
| `ChartExportService` | Export charts as images/data |
| `ChartInteractionService` | Handle click, drilldown, filter events |
| `FormatService` | Number/date formatting utilities |
| `AgUiService` | AG-UI protocol integration |

## Building

```bash
npm run build
```

## License

Apache 2.0 (Apache ECharts is free and open-source)
