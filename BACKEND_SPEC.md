# Backend Specification: Python Google ADK with Gemini 3 Pro

## Overview

Build an enterprise-ready Python backend using **Google Agent Development Kit (ADK)** with **Gemini 3 Pro** model to power the AG-UI chart dashboard. The agent will analyze business data, generate insights, and render interactive visualizations through the AG-UI protocol.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Angular Frontend                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ LineChart   │  │ BarChart    │  │ KpiCard     │  │ GanttChart  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         └─────────────────┴─────────────────┴─────────────────┘         │
│                                    │                                     │
│                      DynamicChartRenderer                                │
│                                    │                                     │
│                         AgUiService (RxJS)                               │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ AG-UI Protocol
                                     │ (SSE / WebSocket)
┌────────────────────────────────────┼─────────────────────────────────────┐
│                          Python Backend                                   │
│                                    │                                      │
│  ┌─────────────────────────────────┴─────────────────────────────────┐   │
│  │                    FastAPI Application Server                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │  │ /api/chat   │  │ /api/stream │  │ /api/data   │                │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │   │
│  └─────────┼────────────────┼────────────────┼───────────────────────┘   │
│            │                │                │                            │
│  ┌─────────┴────────────────┴────────────────┴───────────────────────┐   │
│  │                     Google ADK Agent Layer                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐  │   │
│  │  │                  ChartAnalyticsAgent                         │  │   │
│  │  │  - Gemini 3 Pro Model                                        │  │   │
│  │  │  - Tool: render_chart()                                      │  │   │
│  │  │  - Tool: render_dashboard()                                  │  │   │
│  │  │  - Tool: query_data()                                        │  │   │
│  │  │  - Tool: analyze_trends()                                    │  │   │
│  │  │  - Tool: generate_kpis()                                     │  │   │
│  │  └─────────────────────────────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│  ┌─────────────────────────────────┴─────────────────────────────────┐   │
│  │                      Data Services Layer                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │  │ DataLoader  │  │ Aggregator  │  │ Transformer │                │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│  ┌─────────────────────────────────┴─────────────────────────────────┐   │
│  │                      Data Sources                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│  │  │ PostgreSQL  │  │ BigQuery    │  │ REST APIs   │                │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Python | 3.11+ |
| Agent Framework | Google ADK | Latest |
| LLM Model | Gemini 3 Pro | gemini-3.0-pro |
| Web Framework | FastAPI | 0.110+ |
| Async Server | Uvicorn | 0.27+ |
| Data Validation | Pydantic | 2.0+ |
| Database ORM | SQLAlchemy | 2.0+ |
| Caching | Redis | 7.0+ |
| Task Queue | Celery (optional) | 5.3+ |
| Testing | pytest, pytest-asyncio | Latest |

---

## 3. Project Structure

```
ag-ui-backend/
├── pyproject.toml                 # Project config & dependencies
├── .env.example                   # Environment variables template
├── .env                           # Local environment (gitignored)
├── README.md
│
├── src/
│   └── ag_ui_backend/
│       ├── __init__.py
│       ├── main.py                # FastAPI application entry
│       ├── config.py              # Settings & configuration
│       │
│       ├── api/                   # API Layer
│       │   ├── __init__.py
│       │   ├── routes/
│       │   │   ├── __init__.py
│       │   │   ├── chat.py        # /api/chat endpoints
│       │   │   ├── stream.py      # /api/stream SSE endpoints
│       │   │   ├── data.py        # /api/data CRUD endpoints
│       │   │   └── health.py      # /api/health endpoints
│       │   ├── middleware/
│       │   │   ├── __init__.py
│       │   │   ├── cors.py
│       │   │   ├── auth.py        # API key / JWT auth
│       │   │   └── logging.py
│       │   └── dependencies.py    # FastAPI dependencies
│       │
│       ├── agents/                # Google ADK Agents
│       │   ├── __init__.py
│       │   ├── chart_agent.py     # Main ChartAnalyticsAgent
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── render_tools.py      # render_chart, render_dashboard
│       │   │   ├── data_tools.py        # query_data, aggregate_data
│       │   │   ├── analysis_tools.py    # analyze_trends, detect_anomalies
│       │   │   └── kpi_tools.py         # generate_kpis, calculate_metrics
│       │   ├── prompts/
│       │   │   ├── __init__.py
│       │   │   ├── system_prompt.py     # Base system instructions
│       │   │   ├── chart_prompts.py     # Chart-specific prompts
│       │   │   └── analysis_prompts.py  # Analysis prompts
│       │   └── callbacks.py       # Agent event callbacks
│       │
│       ├── models/                # Pydantic Models (AG-UI Protocol)
│       │   ├── __init__.py
│       │   ├── base.py            # BaseChartConfig
│       │   ├── charts/
│       │   │   ├── __init__.py
│       │   │   ├── line.py        # LineChartConfig
│       │   │   ├── bar.py         # BarChartConfig
│       │   │   ├── area.py        # AreaChartConfig
│       │   │   ├── combo.py       # ComboChartConfig
│       │   │   ├── waterfall.py   # WaterfallChartConfig
│       │   │   ├── kpi.py         # KpiCardConfig
│       │   │   ├── gauge.py       # GaugeChartConfig
│       │   │   ├── bullet.py      # BulletChartConfig
│       │   │   ├── pie.py         # PieChartConfig
│       │   │   ├── gantt.py       # GanttChartConfig
│       │   │   ├── heatmap.py     # HeatmapChartConfig
│       │   │   ├── treemap.py     # TreemapChartConfig
│       │   │   ├── funnel.py      # FunnelChartConfig
│       │   │   └── radar.py       # RadarChartConfig
│       │   ├── events.py          # AG-UI Event models
│       │   └── requests.py        # API request/response models
│       │
│       ├── services/              # Business Logic Layer
│       │   ├── __init__.py
│       │   ├── data_service.py    # Data fetching & transformation
│       │   ├── chart_service.py   # Chart config generation
│       │   ├── analytics_service.py  # Statistical analysis
│       │   └── cache_service.py   # Redis caching
│       │
│       ├── repositories/          # Data Access Layer
│       │   ├── __init__.py
│       │   ├── base.py            # BaseRepository
│       │   ├── revenue_repo.py    # Revenue data
│       │   ├── project_repo.py    # Project management data
│       │   └── kpi_repo.py        # KPI metrics data
│       │
│       ├── db/                    # Database
│       │   ├── __init__.py
│       │   ├── session.py         # Database session management
│       │   ├── models.py          # SQLAlchemy ORM models
│       │   └── migrations/        # Alembic migrations
│       │
│       └── utils/
│           ├── __init__.py
│           ├── formatters.py      # Data formatting utilities
│           ├── validators.py      # Custom validators
│           └── date_utils.py      # Date/time helpers
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # pytest fixtures
│   ├── unit/
│   │   ├── test_agents.py
│   │   ├── test_tools.py
│   │   └── test_services.py
│   ├── integration/
│   │   ├── test_api.py
│   │   └── test_agent_flow.py
│   └── e2e/
│       └── test_full_pipeline.py
│
├── scripts/
│   ├── seed_data.py               # Seed sample data
│   └── run_dev.py                 # Development server
│
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

---

## 4. Pydantic Models (AG-UI Protocol)

### 4.1 Base Configuration

```python
# src/ag_ui_backend/models/base.py

from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum

class ThemeType(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    CUSTOM = "custom"

class BaseChartConfig(BaseModel):
    """Base configuration inherited by all chart types"""
    id: str = Field(..., description="Unique chart identifier")
    component_type: str = Field(..., alias="componentType")
    title: str
    subtitle: Optional[str] = None
    theme: ThemeType = ThemeType.LIGHT
    animation: bool = True
    exportable: bool = True
    drilldown_enabled: bool = Field(False, alias="drilldownEnabled")
    click_to_filter_enabled: bool = Field(False, alias="clickToFilterEnabled")
    real_time_enabled: bool = Field(False, alias="realTimeEnabled")
    refresh_interval: Optional[int] = Field(None, alias="refreshInterval")
    height: Optional[str] = "400px"
    width: Optional[str] = "100%"

    class Config:
        populate_by_name = True
        use_enum_values = True
```

### 4.2 Chart-Specific Models

```python
# src/ag_ui_backend/models/charts/line.py

from pydantic import BaseModel, Field
from typing import Optional, List, Union
from ..base import BaseChartConfig

class ChartSeries(BaseModel):
    name: str
    data: List[Union[float, int, None]]
    color: Optional[str] = None
    smooth: Optional[bool] = None

class LineChartConfig(BaseChartConfig):
    component_type: str = Field("line-chart", alias="componentType")
    x_axis_data: List[str] = Field(..., alias="xAxisData")
    series: List[ChartSeries]
    show_data_zoom: bool = Field(False, alias="showDataZoom")
    smooth: bool = True
    show_area: bool = Field(False, alias="showArea")
```

```python
# src/ag_ui_backend/models/charts/kpi.py

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from ..base import BaseChartConfig

class KpiThreshold(BaseModel):
    value: float
    color: str
    label: Optional[str] = None

class KpiCardConfig(BaseChartConfig):
    component_type: str = Field("kpi-card", alias="componentType")
    value: Union[float, int, str]
    previous_value: Optional[Union[float, int]] = Field(None, alias="previousValue")
    target: Optional[Union[float, int]] = None
    format: Literal["number", "currency", "percentage"] = "number"
    currency_code: Optional[str] = Field("USD", alias="currencyCode")
    decimal_places: int = Field(2, alias="decimalPlaces")
    trend_value: Optional[float] = Field(None, alias="trendValue")
    sparkline_data: Optional[List[float]] = Field(None, alias="sparklineData")
    icon: Optional[str] = None
    thresholds: Optional[List[KpiThreshold]] = None
```

```python
# src/ag_ui_backend/models/charts/gantt.py

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from ..base import BaseChartConfig

class GanttTask(BaseModel):
    id: str
    name: str
    start: datetime
    end: datetime
    progress: float = Field(ge=0, le=100)
    dependencies: Optional[List[str]] = None
    color: Optional[str] = None
    status: Literal["not_started", "in_progress", "completed", "delayed"] = "not_started"
    assignee: Optional[str] = None
    metadata: Optional[dict] = None

class GanttChartConfig(BaseChartConfig):
    component_type: str = Field("gantt-chart", alias="componentType")
    tasks: List[GanttTask]
    show_progress: bool = Field(True, alias="showProgress")
    show_dependencies: bool = Field(True, alias="showDependencies")
```

### 4.3 AG-UI Events

```python
# src/ag_ui_backend/models/events.py

from pydantic import BaseModel
from typing import Union, List, Literal, Any
from .charts import (
    LineChartConfig, BarChartConfig, AreaChartConfig,
    ComboChartConfig, WaterfallChartConfig, KpiCardConfig,
    GaugeChartConfig, BulletChartConfig, PieChartConfig,
    GanttChartConfig, HeatmapChartConfig, TreemapChartConfig,
    FunnelChartConfig, RadarChartConfig
)

ChartConfig = Union[
    LineChartConfig, BarChartConfig, AreaChartConfig,
    ComboChartConfig, WaterfallChartConfig, KpiCardConfig,
    GaugeChartConfig, BulletChartConfig, PieChartConfig,
    GanttChartConfig, HeatmapChartConfig, TreemapChartConfig,
    FunnelChartConfig, RadarChartConfig
]

class RenderChartEvent(BaseModel):
    name: Literal["render_chart"] = "render_chart"
    value: ChartConfig

class RenderDashboardEvent(BaseModel):
    name: Literal["render_dashboard"] = "render_dashboard"
    value: List[ChartConfig]

class UpdateChartEvent(BaseModel):
    name: Literal["update_chart"] = "update_chart"
    value: dict  # { chartId: str, data: Any }

class StreamDataEvent(BaseModel):
    name: Literal["stream_data"] = "stream_data"
    value: dict  # { chartId: str, data: Any }

# User interaction events (Frontend → Backend)
class ChartClickEvent(BaseModel):
    chart_id: str = Field(..., alias="chartId")
    component_type: str = Field(..., alias="componentType")
    data_index: int = Field(..., alias="dataIndex")
    series_name: Optional[str] = Field(None, alias="seriesName")
    data: Any
    event: Literal["click", "dblclick"]

class DrilldownEvent(BaseModel):
    chart_id: str = Field(..., alias="chartId")
    component_type: str = Field(..., alias="componentType")
    path: List[str]
    data: Any

class FilterEvent(BaseModel):
    chart_id: str = Field(..., alias="chartId")
    component_type: str = Field(..., alias="componentType")
    filter_type: Literal["include", "exclude"] = Field(..., alias="filterType")
    filter_value: Any = Field(..., alias="filterValue")
```

---

## 5. Google ADK Agent Implementation

### 5.1 Main Agent Definition

```python
# src/ag_ui_backend/agents/chart_agent.py

from google.adk import Agent, Tool
from google.adk.models import Gemini
from typing import AsyncGenerator
import uuid

from .tools.render_tools import render_chart, render_dashboard
from .tools.data_tools import query_data, aggregate_data
from .tools.analysis_tools import analyze_trends, detect_anomalies
from .tools.kpi_tools import generate_kpis, calculate_metrics
from .prompts.system_prompt import SYSTEM_PROMPT

class ChartAnalyticsAgent:
    """
    Enterprise analytics agent powered by Gemini 3 Pro.
    Analyzes business data and generates AG-UI chart configurations.
    """

    def __init__(self, data_service, chart_service, analytics_service):
        self.data_service = data_service
        self.chart_service = chart_service
        self.analytics_service = analytics_service

        self.agent = Agent(
            model=Gemini(model="gemini-3.0-pro"),
            name="ChartAnalyticsAgent",
            description="Enterprise analytics agent for data visualization",
            instructions=SYSTEM_PROMPT,
            tools=[
                # Rendering tools
                self._create_render_chart_tool(),
                self._create_render_dashboard_tool(),

                # Data tools
                self._create_query_data_tool(),
                self._create_aggregate_data_tool(),

                # Analysis tools
                self._create_analyze_trends_tool(),
                self._create_detect_anomalies_tool(),

                # KPI tools
                self._create_generate_kpis_tool(),
                self._create_calculate_metrics_tool(),
            ]
        )

    async def chat(self, message: str, session_id: str = None) -> AsyncGenerator:
        """
        Process user message and yield AG-UI events.

        Args:
            message: User's natural language query
            session_id: Session identifier for context continuity

        Yields:
            AG-UI events (render_chart, render_dashboard, etc.)
        """
        session_id = session_id or str(uuid.uuid4())

        async for event in self.agent.stream(message, session_id=session_id):
            if event.type == "tool_call":
                # Tool execution - yield AG-UI events
                yield event.result
            elif event.type == "text":
                # Text response from agent
                yield {"name": "agent_message", "value": event.content}
            elif event.type == "error":
                yield {"name": "error", "value": str(event.error)}

    async def handle_user_action(self, action: dict) -> AsyncGenerator:
        """
        Handle user interactions (clicks, drilldowns, filters).

        Args:
            action: User action event from frontend

        Yields:
            Follow-up AG-UI events
        """
        action_type = action.get("type")

        if action_type == "click":
            # Generate contextual analysis or drilldown
            prompt = f"User clicked on {action['componentType']} chart. Data: {action['data']}. Provide relevant insights or drilldown."
            async for event in self.chat(prompt):
                yield event

        elif action_type == "drilldown":
            # Fetch and render drilldown data
            prompt = f"Show drilldown for path: {action['path']} in {action['componentType']}"
            async for event in self.chat(prompt):
                yield event

        elif action_type == "filter":
            # Apply filter and refresh affected charts
            prompt = f"Apply filter {action['filterType']}: {action['filterValue']} and refresh dashboard"
            async for event in self.chat(prompt):
                yield event
```

### 5.2 Agent Tools

```python
# src/ag_ui_backend/agents/tools/render_tools.py

from google.adk import Tool, ToolParameter
from typing import List, Optional
from ...models.events import RenderChartEvent, RenderDashboardEvent
from ...models.charts import ChartConfig

@Tool(
    name="render_chart",
    description="Render a single chart visualization to the UI",
    parameters=[
        ToolParameter(
            name="chart_type",
            type="string",
            description="Type of chart: line-chart, bar-chart, area-chart, combo-chart, waterfall-chart, kpi-card, gauge-chart, bullet-chart, pie-chart, gantt-chart, heatmap-chart, treemap-chart, funnel-chart, radar-chart",
            required=True,
            enum=["line-chart", "bar-chart", "area-chart", "combo-chart",
                  "waterfall-chart", "kpi-card", "gauge-chart", "bullet-chart",
                  "pie-chart", "gantt-chart", "heatmap-chart", "treemap-chart",
                  "funnel-chart", "radar-chart"]
        ),
        ToolParameter(
            name="title",
            type="string",
            description="Chart title",
            required=True
        ),
        ToolParameter(
            name="data_query",
            type="string",
            description="Description of data to fetch and visualize",
            required=True
        ),
        ToolParameter(
            name="options",
            type="object",
            description="Additional chart-specific options",
            required=False
        )
    ]
)
async def render_chart(
    chart_type: str,
    title: str,
    data_query: str,
    options: Optional[dict] = None,
    context: dict = None  # Injected context with services
) -> RenderChartEvent:
    """
    Render a chart based on the specified type and data query.
    """
    chart_service = context["chart_service"]
    data_service = context["data_service"]

    # Fetch data based on query
    data = await data_service.fetch_data(data_query)

    # Generate chart configuration
    config = await chart_service.create_chart_config(
        chart_type=chart_type,
        title=title,
        data=data,
        options=options or {}
    )

    return RenderChartEvent(value=config)


@Tool(
    name="render_dashboard",
    description="Render multiple charts as a dashboard layout",
    parameters=[
        ToolParameter(
            name="charts",
            type="array",
            description="List of chart specifications to render",
            required=True
        ),
        ToolParameter(
            name="layout",
            type="string",
            description="Dashboard layout: grid, vertical, horizontal",
            required=False
        )
    ]
)
async def render_dashboard(
    charts: List[dict],
    layout: str = "grid",
    context: dict = None
) -> RenderDashboardEvent:
    """
    Render a complete dashboard with multiple charts.
    """
    chart_service = context["chart_service"]
    data_service = context["data_service"]

    configs = []
    for chart_spec in charts:
        data = await data_service.fetch_data(chart_spec.get("data_query", ""))
        config = await chart_service.create_chart_config(
            chart_type=chart_spec["chart_type"],
            title=chart_spec["title"],
            data=data,
            options=chart_spec.get("options", {})
        )
        configs.append(config)

    return RenderDashboardEvent(value=configs)
```

```python
# src/ag_ui_backend/agents/tools/data_tools.py

from google.adk import Tool, ToolParameter
from typing import Optional, List

@Tool(
    name="query_data",
    description="Query business data from available data sources",
    parameters=[
        ToolParameter(
            name="source",
            type="string",
            description="Data source: revenue, projects, kpis, resources",
            required=True,
            enum=["revenue", "projects", "kpis", "resources", "sales", "customers"]
        ),
        ToolParameter(
            name="filters",
            type="object",
            description="Filter criteria (date_range, category, status, etc.)",
            required=False
        ),
        ToolParameter(
            name="aggregation",
            type="string",
            description="Aggregation type: daily, weekly, monthly, quarterly, yearly",
            required=False
        ),
        ToolParameter(
            name="limit",
            type="integer",
            description="Maximum records to return",
            required=False
        )
    ]
)
async def query_data(
    source: str,
    filters: Optional[dict] = None,
    aggregation: Optional[str] = None,
    limit: Optional[int] = None,
    context: dict = None
) -> dict:
    """
    Query data from specified source with optional filters and aggregation.
    """
    data_service = context["data_service"]

    result = await data_service.query(
        source=source,
        filters=filters or {},
        aggregation=aggregation,
        limit=limit
    )

    return {
        "source": source,
        "record_count": len(result.get("records", [])),
        "data": result
    }


@Tool(
    name="aggregate_data",
    description="Perform aggregations on data (sum, avg, count, min, max)",
    parameters=[
        ToolParameter(
            name="data",
            type="array",
            description="Data to aggregate",
            required=True
        ),
        ToolParameter(
            name="group_by",
            type="string",
            description="Field to group by",
            required=True
        ),
        ToolParameter(
            name="metrics",
            type="array",
            description="Metrics to calculate: [{field: 'revenue', agg: 'sum'}]",
            required=True
        )
    ]
)
async def aggregate_data(
    data: List[dict],
    group_by: str,
    metrics: List[dict],
    context: dict = None
) -> dict:
    """
    Aggregate data by grouping and calculating metrics.
    """
    analytics_service = context["analytics_service"]

    result = await analytics_service.aggregate(
        data=data,
        group_by=group_by,
        metrics=metrics
    )

    return result
```

```python
# src/ag_ui_backend/agents/tools/analysis_tools.py

from google.adk import Tool, ToolParameter
from typing import Optional, List

@Tool(
    name="analyze_trends",
    description="Analyze trends and patterns in time series data",
    parameters=[
        ToolParameter(
            name="data",
            type="array",
            description="Time series data points",
            required=True
        ),
        ToolParameter(
            name="analysis_type",
            type="string",
            description="Type: trend, seasonality, forecast, comparison",
            required=True,
            enum=["trend", "seasonality", "forecast", "comparison", "all"]
        ),
        ToolParameter(
            name="periods",
            type="integer",
            description="Number of periods for forecast",
            required=False
        )
    ]
)
async def analyze_trends(
    data: List[dict],
    analysis_type: str,
    periods: Optional[int] = 3,
    context: dict = None
) -> dict:
    """
    Perform trend analysis on time series data.
    """
    analytics_service = context["analytics_service"]

    result = await analytics_service.analyze_trends(
        data=data,
        analysis_type=analysis_type,
        periods=periods
    )

    return {
        "analysis_type": analysis_type,
        "insights": result.get("insights", []),
        "statistics": result.get("statistics", {}),
        "forecast": result.get("forecast", None)
    }


@Tool(
    name="detect_anomalies",
    description="Detect anomalies and outliers in data",
    parameters=[
        ToolParameter(
            name="data",
            type="array",
            description="Data to analyze for anomalies",
            required=True
        ),
        ToolParameter(
            name="sensitivity",
            type="string",
            description="Detection sensitivity: low, medium, high",
            required=False,
            enum=["low", "medium", "high"]
        )
    ]
)
async def detect_anomalies(
    data: List[dict],
    sensitivity: str = "medium",
    context: dict = None
) -> dict:
    """
    Detect anomalies in the provided data.
    """
    analytics_service = context["analytics_service"]

    result = await analytics_service.detect_anomalies(
        data=data,
        sensitivity=sensitivity
    )

    return {
        "anomaly_count": len(result.get("anomalies", [])),
        "anomalies": result.get("anomalies", []),
        "threshold": result.get("threshold"),
        "method": result.get("method")
    }
```

```python
# src/ag_ui_backend/agents/tools/kpi_tools.py

from google.adk import Tool, ToolParameter
from typing import Optional, List

@Tool(
    name="generate_kpis",
    description="Generate KPI cards based on business metrics",
    parameters=[
        ToolParameter(
            name="metrics",
            type="array",
            description="List of metric names to generate KPIs for",
            required=True
        ),
        ToolParameter(
            name="comparison_period",
            type="string",
            description="Period for comparison: previous_period, previous_year, target",
            required=False,
            enum=["previous_period", "previous_year", "target", "budget"]
        ),
        ToolParameter(
            name="include_sparkline",
            type="boolean",
            description="Include sparkline trend data",
            required=False
        )
    ]
)
async def generate_kpis(
    metrics: List[str],
    comparison_period: str = "previous_period",
    include_sparkline: bool = True,
    context: dict = None
) -> List[dict]:
    """
    Generate KPI card configurations for specified metrics.
    """
    chart_service = context["chart_service"]
    data_service = context["data_service"]

    kpi_configs = []
    for metric in metrics:
        data = await data_service.get_kpi_data(
            metric=metric,
            comparison=comparison_period,
            include_history=include_sparkline
        )

        config = await chart_service.create_kpi_config(
            metric_name=metric,
            data=data
        )
        kpi_configs.append(config)

    return kpi_configs


@Tool(
    name="calculate_metrics",
    description="Calculate custom business metrics from raw data",
    parameters=[
        ToolParameter(
            name="formula",
            type="string",
            description="Calculation formula or metric type",
            required=True
        ),
        ToolParameter(
            name="data_source",
            type="string",
            description="Source data for calculation",
            required=True
        ),
        ToolParameter(
            name="filters",
            type="object",
            description="Filter criteria",
            required=False
        )
    ]
)
async def calculate_metrics(
    formula: str,
    data_source: str,
    filters: Optional[dict] = None,
    context: dict = None
) -> dict:
    """
    Calculate custom metrics using specified formula.
    """
    analytics_service = context["analytics_service"]
    data_service = context["data_service"]

    # Fetch source data
    data = await data_service.fetch_data(data_source, filters)

    # Calculate metric
    result = await analytics_service.calculate_metric(
        formula=formula,
        data=data
    )

    return {
        "metric": formula,
        "value": result.get("value"),
        "breakdown": result.get("breakdown", {}),
        "metadata": result.get("metadata", {})
    }
```

### 5.3 System Prompt

```python
# src/ag_ui_backend/agents/prompts/system_prompt.py

SYSTEM_PROMPT = """
You are an Enterprise Analytics Agent specialized in data visualization and business intelligence.
Your role is to analyze business data and render interactive charts using the AG-UI protocol.

## Capabilities
1. **Data Analysis**: Query, aggregate, and analyze business data
2. **Visualization**: Render charts, dashboards, and KPI cards
3. **Insights**: Detect trends, anomalies, and provide actionable insights
4. **Interactivity**: Support drill-down, filtering, and real-time updates

## Available Chart Types
- **Line Chart**: Time series, trends, comparisons
- **Bar Chart**: Categorical comparisons, rankings
- **Area Chart**: Cumulative values, stacked comparisons
- **Combo Chart**: Mixed metrics (bars + lines)
- **Waterfall Chart**: Variance analysis, contributions
- **KPI Card**: Single metrics with trends and targets
- **Gauge Chart**: Progress indicators, scores
- **Bullet Chart**: Target vs actual performance
- **Pie/Donut Chart**: Proportions, distributions
- **Gantt Chart**: Project timelines, schedules
- **Heatmap**: Matrix visualization, correlations
- **Treemap**: Hierarchical data, budgets
- **Funnel Chart**: Conversion pipelines
- **Radar Chart**: Multi-dimensional comparisons

## Guidelines
1. Always choose the most appropriate chart type for the data
2. Include meaningful titles and labels
3. Enable interactivity (drilldown, export) when relevant
4. Provide context with trend comparisons (vs previous period/target)
5. Use consistent color schemes and theming
6. For dashboards, include a mix of KPIs and detailed charts
7. Highlight anomalies and significant changes

## Data Domains
- Financial: Revenue, costs, profit, budget variance
- KPIs: Sales, utilization, satisfaction scores
- Projects: Timelines, progress, resource allocation
- Sales: Pipeline, conversions, performance

When users ask questions, analyze the data and render appropriate visualizations.
Always explain your analysis alongside the charts.
"""
```

---

## 6. API Endpoints

### 6.1 Chat Endpoint (Streaming)

```python
# src/ag_ui_backend/api/routes/chat.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from ...agents.chart_agent import ChartAnalyticsAgent
from ..dependencies import get_agent

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    event: str
    data: dict

@router.post("/")
async def chat(
    request: ChatRequest,
    agent: ChartAnalyticsAgent = Depends(get_agent)
):
    """
    Process natural language query and return AG-UI events.
    Supports Server-Sent Events for streaming responses.
    """
    async def event_generator():
        try:
            async for event in agent.chat(request.message, request.session_id):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'name': 'error', 'value': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/action")
async def handle_action(
    action: dict,
    agent: ChartAnalyticsAgent = Depends(get_agent)
):
    """
    Handle user interaction events (clicks, drilldowns, filters).
    """
    async def event_generator():
        async for event in agent.handle_user_action(action):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### 6.2 Data Endpoints

```python
# src/ag_ui_backend/api/routes/data.py

from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from datetime import datetime

from ...services.data_service import DataService
from ..dependencies import get_data_service

router = APIRouter(prefix="/api/data", tags=["data"])

@router.get("/revenue")
async def get_revenue_data(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    group_by: str = Query("month", enum=["day", "week", "month", "quarter", "year"]),
    categories: Optional[List[str]] = Query(None),
    data_service: DataService = Depends(get_data_service)
):
    """Fetch revenue data with optional filters and aggregation."""
    return await data_service.get_revenue(
        start_date=start_date,
        end_date=end_date,
        group_by=group_by,
        categories=categories
    )

@router.get("/kpis")
async def get_kpi_data(
    metrics: List[str] = Query(...),
    comparison: str = Query("previous_period"),
    data_service: DataService = Depends(get_data_service)
):
    """Fetch KPI metrics with comparisons."""
    return await data_service.get_kpis(
        metrics=metrics,
        comparison=comparison
    )

@router.get("/projects")
async def get_project_data(
    status: Optional[str] = Query(None, enum=["not_started", "in_progress", "completed", "delayed"]),
    team: Optional[str] = Query(None),
    data_service: DataService = Depends(get_data_service)
):
    """Fetch project management data."""
    return await data_service.get_projects(status=status, team=team)

@router.get("/resources")
async def get_resource_data(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    teams: Optional[List[str]] = Query(None),
    data_service: DataService = Depends(get_data_service)
):
    """Fetch resource utilization data."""
    return await data_service.get_resource_utilization(
        start_date=start_date,
        end_date=end_date,
        teams=teams
    )
```

### 6.3 Stream Endpoint (Real-time)

```python
# src/ag_ui_backend/api/routes/stream.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
import asyncio
import json

from ...agents.chart_agent import ChartAnalyticsAgent
from ..dependencies import get_agent

router = APIRouter(prefix="/api/stream", tags=["stream"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)

    async def send_event(self, session_id: str, event: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json(event)

manager = ConnectionManager()

@router.websocket("/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str
):
    """
    WebSocket endpoint for real-time bidirectional communication.
    """
    await manager.connect(websocket, session_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "chat":
                # Process chat message
                agent = get_agent()
                async for event in agent.chat(data["message"], session_id):
                    await websocket.send_json(event)

            elif message_type == "action":
                # Handle user action
                agent = get_agent()
                async for event in agent.handle_user_action(data["action"]):
                    await websocket.send_json(event)

            elif message_type == "subscribe":
                # Subscribe to real-time updates for specific charts
                chart_ids = data.get("chartIds", [])
                # Register subscription

            elif message_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
```

---

## 7. Services Layer

### 7.1 Data Service

```python
# src/ag_ui_backend/services/data_service.py

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd

from ..repositories.revenue_repo import RevenueRepository
from ..repositories.project_repo import ProjectRepository
from ..repositories.kpi_repo import KpiRepository

class DataService:
    """
    Service for fetching and transforming business data.
    """

    def __init__(
        self,
        revenue_repo: RevenueRepository,
        project_repo: ProjectRepository,
        kpi_repo: KpiRepository
    ):
        self.revenue_repo = revenue_repo
        self.project_repo = project_repo
        self.kpi_repo = kpi_repo

    async def fetch_data(
        self,
        query: str,
        filters: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Fetch data based on natural language query or structured request.
        """
        # Parse query to determine data source and filters
        source = self._parse_data_source(query)

        if source == "revenue":
            return await self.get_revenue(**filters or {})
        elif source == "projects":
            return await self.get_projects(**filters or {})
        elif source == "kpis":
            return await self.get_kpis(**filters or {})
        elif source == "resources":
            return await self.get_resource_utilization(**filters or {})
        else:
            raise ValueError(f"Unknown data source: {source}")

    async def get_revenue(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        group_by: str = "month",
        categories: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Fetch revenue data with aggregation."""
        data = await self.revenue_repo.get_revenue(
            start_date=start_date or datetime.now() - timedelta(days=365),
            end_date=end_date or datetime.now(),
            categories=categories
        )

        # Aggregate by period
        df = pd.DataFrame(data)
        aggregated = self._aggregate_by_period(df, group_by, "revenue")

        return {
            "periods": aggregated["periods"],
            "values": aggregated["values"],
            "total": sum(aggregated["values"]),
            "by_category": aggregated.get("by_category", {})
        }

    async def get_kpis(
        self,
        metrics: List[str],
        comparison: str = "previous_period"
    ) -> List[Dict[str, Any]]:
        """Fetch KPI data with trend information."""
        kpis = []

        for metric in metrics:
            current = await self.kpi_repo.get_current_value(metric)
            previous = await self.kpi_repo.get_previous_value(metric, comparison)
            history = await self.kpi_repo.get_history(metric, periods=12)

            change = ((current - previous) / previous * 100) if previous else 0

            kpis.append({
                "metric": metric,
                "value": current,
                "previous_value": previous,
                "change_percent": round(change, 2),
                "trend": "up" if change > 0 else "down" if change < 0 else "flat",
                "sparkline_data": history
            })

        return kpis

    async def get_projects(
        self,
        status: Optional[str] = None,
        team: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch project data for Gantt charts."""
        return await self.project_repo.get_projects(
            status=status,
            team=team
        )

    async def get_resource_utilization(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        teams: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Fetch resource utilization data for heatmaps."""
        return await self.kpi_repo.get_utilization(
            start_date=start_date,
            end_date=end_date,
            teams=teams
        )

    def _parse_data_source(self, query: str) -> str:
        """Parse query to determine data source."""
        query_lower = query.lower()

        if any(word in query_lower for word in ["revenue", "sales", "income", "profit"]):
            return "revenue"
        elif any(word in query_lower for word in ["project", "task", "timeline", "gantt"]):
            return "projects"
        elif any(word in query_lower for word in ["kpi", "metric", "performance", "score"]):
            return "kpis"
        elif any(word in query_lower for word in ["resource", "utilization", "capacity", "allocation"]):
            return "resources"
        else:
            return "revenue"  # Default

    def _aggregate_by_period(
        self,
        df: pd.DataFrame,
        period: str,
        value_column: str
    ) -> Dict[str, Any]:
        """Aggregate data by time period."""
        # Implementation for period aggregation
        pass
```

### 7.2 Chart Service

```python
# src/ag_ui_backend/services/chart_service.py

from typing import Dict, Any, Optional
import uuid

from ..models.charts import (
    LineChartConfig, BarChartConfig, AreaChartConfig,
    ComboChartConfig, WaterfallChartConfig, KpiCardConfig,
    GaugeChartConfig, BulletChartConfig, PieChartConfig,
    GanttChartConfig, HeatmapChartConfig, TreemapChartConfig,
    FunnelChartConfig, RadarChartConfig, ChartSeries
)

class ChartService:
    """
    Service for generating chart configurations from data.
    """

    CHART_CREATORS = {
        "line-chart": "_create_line_chart",
        "bar-chart": "_create_bar_chart",
        "area-chart": "_create_area_chart",
        "combo-chart": "_create_combo_chart",
        "waterfall-chart": "_create_waterfall_chart",
        "kpi-card": "_create_kpi_card",
        "gauge-chart": "_create_gauge_chart",
        "bullet-chart": "_create_bullet_chart",
        "pie-chart": "_create_pie_chart",
        "gantt-chart": "_create_gantt_chart",
        "heatmap-chart": "_create_heatmap_chart",
        "treemap-chart": "_create_treemap_chart",
        "funnel-chart": "_create_funnel_chart",
        "radar-chart": "_create_radar_chart"
    }

    async def create_chart_config(
        self,
        chart_type: str,
        title: str,
        data: Dict[str, Any],
        options: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create chart configuration based on type and data.
        """
        creator_method = self.CHART_CREATORS.get(chart_type)
        if not creator_method:
            raise ValueError(f"Unknown chart type: {chart_type}")

        creator = getattr(self, creator_method)
        config = await creator(title, data, options or {})

        return config.model_dump(by_alias=True)

    async def _create_line_chart(
        self,
        title: str,
        data: Dict[str, Any],
        options: Dict
    ) -> LineChartConfig:
        """Create line chart configuration."""
        return LineChartConfig(
            id=str(uuid.uuid4()),
            title=title,
            x_axis_data=data.get("periods", []),
            series=[
                ChartSeries(
                    name=series.get("name", "Series"),
                    data=series.get("data", []),
                    color=series.get("color"),
                    smooth=options.get("smooth", True)
                )
                for series in data.get("series", [{"name": "Value", "data": data.get("values", [])}])
            ],
            smooth=options.get("smooth", True),
            show_area=options.get("show_area", False),
            show_data_zoom=options.get("show_data_zoom", len(data.get("periods", [])) > 12),
            exportable=options.get("exportable", True),
            drilldown_enabled=options.get("drilldown_enabled", True)
        )

    async def _create_bar_chart(
        self,
        title: str,
        data: Dict[str, Any],
        options: Dict
    ) -> BarChartConfig:
        """Create bar chart configuration."""
        # Similar implementation
        pass

    async def _create_kpi_card(
        self,
        title: str,
        data: Dict[str, Any],
        options: Dict
    ) -> KpiCardConfig:
        """Create KPI card configuration."""
        return KpiCardConfig(
            id=str(uuid.uuid4()),
            title=title,
            value=data.get("value", 0),
            previous_value=data.get("previous_value"),
            target=data.get("target"),
            format=data.get("format", "number"),
            trend_value=data.get("change_percent"),
            sparkline_data=data.get("sparkline_data"),
            icon=self._get_kpi_icon(title),
            thresholds=options.get("thresholds")
        )

    async def create_kpi_config(
        self,
        metric_name: str,
        data: Dict[str, Any]
    ) -> KpiCardConfig:
        """Create KPI configuration from metric data."""
        return await self._create_kpi_card(
            title=self._format_metric_name(metric_name),
            data=data,
            options={}
        )

    def _format_metric_name(self, name: str) -> str:
        """Format metric name for display."""
        return name.replace("_", " ").title()

    def _get_kpi_icon(self, title: str) -> str:
        """Get appropriate icon for KPI."""
        title_lower = title.lower()
        if "revenue" in title_lower or "sales" in title_lower:
            return "attach_money"
        elif "project" in title_lower:
            return "folder"
        elif "utilization" in title_lower:
            return "speed"
        elif "satisfaction" in title_lower:
            return "sentiment_satisfied"
        else:
            return "analytics"
```

### 7.3 Analytics Service

```python
# src/ag_ui_backend/services/analytics_service.py

from typing import List, Dict, Any, Optional
import numpy as np
from scipy import stats

class AnalyticsService:
    """
    Service for statistical analysis and insights generation.
    """

    async def analyze_trends(
        self,
        data: List[Dict],
        analysis_type: str,
        periods: int = 3
    ) -> Dict[str, Any]:
        """
        Analyze trends in time series data.
        """
        values = [d.get("value", 0) for d in data]

        result = {
            "insights": [],
            "statistics": {}
        }

        if analysis_type in ["trend", "all"]:
            trend = self._calculate_trend(values)
            result["statistics"]["trend"] = trend
            result["insights"].append(
                f"Data shows {'upward' if trend > 0 else 'downward'} trend "
                f"with {abs(trend):.1f}% average change"
            )

        if analysis_type in ["seasonality", "all"]:
            seasonality = self._detect_seasonality(values)
            result["statistics"]["seasonality"] = seasonality

        if analysis_type in ["forecast", "all"]:
            forecast = self._simple_forecast(values, periods)
            result["forecast"] = forecast

        return result

    async def detect_anomalies(
        self,
        data: List[Dict],
        sensitivity: str = "medium"
    ) -> Dict[str, Any]:
        """
        Detect anomalies using statistical methods.
        """
        values = [d.get("value", 0) for d in data]

        # Z-score based anomaly detection
        threshold_map = {"low": 3.0, "medium": 2.5, "high": 2.0}
        threshold = threshold_map.get(sensitivity, 2.5)

        z_scores = stats.zscore(values)
        anomalies = []

        for i, (value, z) in enumerate(zip(values, z_scores)):
            if abs(z) > threshold:
                anomalies.append({
                    "index": i,
                    "value": value,
                    "z_score": round(z, 2),
                    "severity": "high" if abs(z) > 3 else "medium"
                })

        return {
            "anomalies": anomalies,
            "threshold": threshold,
            "method": "z-score"
        }

    async def aggregate(
        self,
        data: List[Dict],
        group_by: str,
        metrics: List[Dict]
    ) -> Dict[str, Any]:
        """
        Aggregate data by grouping.
        """
        # Group data
        groups = {}
        for item in data:
            key = item.get(group_by)
            if key not in groups:
                groups[key] = []
            groups[key].append(item)

        # Calculate metrics for each group
        result = {}
        for key, items in groups.items():
            result[key] = {}
            for metric in metrics:
                field = metric["field"]
                agg = metric["agg"]
                values = [item.get(field, 0) for item in items]

                if agg == "sum":
                    result[key][field] = sum(values)
                elif agg == "avg":
                    result[key][field] = sum(values) / len(values) if values else 0
                elif agg == "count":
                    result[key][field] = len(values)
                elif agg == "min":
                    result[key][field] = min(values) if values else 0
                elif agg == "max":
                    result[key][field] = max(values) if values else 0

        return result

    async def calculate_metric(
        self,
        formula: str,
        data: List[Dict]
    ) -> Dict[str, Any]:
        """
        Calculate custom metric based on formula.
        """
        # Implement formula parser and calculator
        pass

    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate average period-over-period change."""
        if len(values) < 2:
            return 0

        changes = []
        for i in range(1, len(values)):
            if values[i-1] != 0:
                change = (values[i] - values[i-1]) / values[i-1] * 100
                changes.append(change)

        return np.mean(changes) if changes else 0

    def _detect_seasonality(self, values: List[float]) -> Dict:
        """Detect seasonal patterns."""
        # Simple autocorrelation-based detection
        if len(values) < 12:
            return {"detected": False}

        # Check for quarterly and monthly patterns
        return {"detected": True, "period": 12}

    def _simple_forecast(self, values: List[float], periods: int) -> List[float]:
        """Simple linear regression forecast."""
        if len(values) < 2:
            return [values[-1] if values else 0] * periods

        x = np.arange(len(values))
        slope, intercept = np.polyfit(x, values, 1)

        forecast = []
        for i in range(periods):
            forecast.append(round(slope * (len(values) + i) + intercept, 2))

        return forecast
```

---

## 8. Configuration & Environment

### 8.1 Configuration

```python
# src/ag_ui_backend/config.py

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    app_name: str = "AG-UI Backend"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4

    # Google AI
    google_api_key: str
    gemini_model: str = "gemini-3.0-pro"

    # Database
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/agui"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # CORS
    cors_origins: list[str] = ["http://localhost:4200"]

    # Auth
    api_key: Optional[str] = None
    jwt_secret: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### 8.2 Environment Variables

```bash
# .env.example

# Application
DEBUG=false
LOG_LEVEL=INFO

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Google AI
GOOGLE_API_KEY=your-google-api-key-here
GEMINI_MODEL=gemini-3.0-pro

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/agui

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# Security (optional)
API_KEY=your-api-key
JWT_SECRET=your-jwt-secret
```

---

## 9. Sample User Interactions

### 9.1 Dashboard Request

```
User: "Show me a dashboard with revenue trends and top KPIs"

Agent Response:
1. Calls query_data(source="revenue", aggregation="monthly")
2. Calls generate_kpis(metrics=["total_revenue", "active_projects", "team_utilization", "customer_satisfaction"])
3. Calls render_dashboard with:
   - Line chart: Monthly Revenue Trend (2024 vs 2025)
   - 4 KPI cards with sparklines
   - Bar chart: Revenue by Category
```

### 9.2 Drill-down Request

```
User: Clicks on "Engineering" in budget pie chart

Frontend sends: { type: "drilldown", chartId: "budget-pie", path: ["Engineering"], data: {...} }

Agent Response:
1. Calls query_data(source="budget", filters={"department": "Engineering"})
2. Calls render_chart(chart_type="treemap", title="Engineering Budget Breakdown")
   - Shows: Frontend ($150K), Backend ($180K), DevOps ($120K)
```

### 9.3 Analysis Request

```
User: "Analyze revenue trends and detect any anomalies"

Agent Response:
1. Calls query_data(source="revenue", aggregation="monthly")
2. Calls analyze_trends(analysis_type="all", periods=3)
3. Calls detect_anomalies(sensitivity="medium")
4. Renders:
   - Line chart with trend line and forecast
   - Text insight: "Revenue shows 8.5% upward trend. Anomaly detected in March (spike of 32% above average)"
   - Highlighted data points for anomalies
```

### 9.4 Real-time Update

```
User: "Show me live sales metrics with auto-refresh"

Agent Response:
1. Calls generate_kpis(metrics=["live_sales", "orders_today", "conversion_rate"])
2. Renders KPI cards with realTimeEnabled=true, refreshInterval=30000
3. Backend pushes stream_data events every 30 seconds
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```python
# tests/unit/test_chart_service.py

import pytest
from src.ag_ui_backend.services.chart_service import ChartService

@pytest.fixture
def chart_service():
    return ChartService()

@pytest.mark.asyncio
async def test_create_line_chart(chart_service):
    data = {
        "periods": ["Jan", "Feb", "Mar"],
        "values": [100, 150, 200]
    }

    config = await chart_service.create_chart_config(
        chart_type="line-chart",
        title="Test Chart",
        data=data,
        options={}
    )

    assert config["componentType"] == "line-chart"
    assert config["title"] == "Test Chart"
    assert len(config["xAxisData"]) == 3
    assert len(config["series"]) == 1

@pytest.mark.asyncio
async def test_create_kpi_card(chart_service):
    data = {
        "value": 1250000,
        "previous_value": 1100000,
        "change_percent": 13.6,
        "sparkline_data": [100, 110, 105, 120, 125]
    }

    config = await chart_service.create_chart_config(
        chart_type="kpi-card",
        title="Total Revenue",
        data=data,
        options={"format": "currency"}
    )

    assert config["componentType"] == "kpi-card"
    assert config["value"] == 1250000
    assert config["trendValue"] == 13.6
```

### 10.2 Integration Tests

```python
# tests/integration/test_agent_flow.py

import pytest
from httpx import AsyncClient
from src.ag_ui_backend.main import app

@pytest.mark.asyncio
async def test_chat_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/chat/",
            json={"message": "Show me revenue trends"}
        )

        assert response.status_code == 200
        # Verify SSE response contains expected events

@pytest.mark.asyncio
async def test_user_action_drilldown():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/chat/action",
            json={
                "type": "drilldown",
                "chartId": "budget-chart",
                "componentType": "pie-chart",
                "path": ["Engineering"],
                "data": {"value": 450000}
            }
        )

        assert response.status_code == 200
```

---

## 11. Deployment

### 11.1 Docker Configuration

```dockerfile
# docker/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev

# Copy application
COPY src/ ./src/

# Environment
ENV PYTHONPATH=/app/src
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "ag_ui_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/agui
      - REDIS_URL=redis://redis:6379/0
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=agui
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 12. Dependencies

```toml
# pyproject.toml

[tool.poetry]
name = "ag-ui-backend"
version = "1.0.0"
description = "AG-UI Backend with Google ADK and Gemini 3 Pro"

[tool.poetry.dependencies]
python = "^3.11"
google-adk = "^0.1.0"
google-generativeai = "^0.4.0"
fastapi = "^0.110.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
pydantic = "^2.6.0"
pydantic-settings = "^2.2.0"
sqlalchemy = {extras = ["asyncio"], version = "^2.0.0"}
asyncpg = "^0.29.0"
redis = "^5.0.0"
pandas = "^2.2.0"
numpy = "^1.26.0"
scipy = "^1.12.0"
python-multipart = "^0.0.9"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
pytest-asyncio = "^0.23.0"
httpx = "^0.27.0"
black = "^24.2.0"
ruff = "^0.2.0"
mypy = "^1.8.0"
```

---

## 13. Verification & Testing Plan

1. **Unit Tests**: Run `pytest tests/unit/` - verify all services and tools work correctly
2. **Integration Tests**: Run `pytest tests/integration/` - verify API endpoints and agent flows
3. **Manual Testing**:
   - Start backend: `uvicorn ag_ui_backend.main:app --reload`
   - Start frontend: `npm start` (Angular app)
   - Test chat: Send "Show me a dashboard with revenue and KPIs"
   - Verify charts render correctly in browser
   - Test drilldown by clicking on chart elements
   - Test real-time updates with refresh enabled

---

## 14. Implementation Priority

| Phase | Components | Effort |
|-------|-----------|--------|
| 1 | Project setup, Pydantic models, FastAPI skeleton | 1 day |
| 2 | Agent with basic tools (render_chart, query_data) | 2 days |
| 3 | All chart types, data service | 2 days |
| 4 | Analytics service, advanced tools | 1 day |
| 5 | WebSocket streaming, real-time updates | 1 day |
| 6 | Testing, documentation, deployment | 1 day |

**Total Estimated Effort: 8 days**
