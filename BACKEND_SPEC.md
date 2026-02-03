# Backend Specification: Python Google ADK with Native AG-UI Protocol

## Overview

Build an enterprise-ready Python backend using **Google Agent Development Kit (ADK)** with **Gemini 3 Pro** model, leveraging **native AG-UI protocol support** via `adk-agui-middleware` to communicate with the Angular frontend for interactive chart visualizations.

---

## 1. Architecture Overview (Native AG-UI)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Angular Frontend                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    AG-UI Client Integration                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ LineChart   │  │ BarChart    │  │ KpiCard     │  │ GanttChart  │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │  │
│  │         └─────────────────┴─────────────────┴─────────────────┘        │  │
│  │                                    │                                    │  │
│  │                      DynamicChartRenderer                               │  │
│  │                                    │                                    │  │
│  │  ┌─────────────────────────────────┴───────────────────────────────┐   │  │
│  │  │                    AgUiService                                   │   │  │
│  │  │  - Subscribes to AG-UI Events (SSE)                              │   │  │
│  │  │  - Handles: RUN_STARTED, TEXT_MESSAGE_*, TOOL_CALL_*, STATE_*    │   │  │
│  │  │  - Sends: User actions, state updates                            │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                            AG-UI Protocol (SSE)
                            ───────────────────
                            Events:
                            • RUN_STARTED / RUN_FINISHED
                            • TEXT_MESSAGE_START/CONTENT/END
                            • TOOL_CALL_START/ARGS/END
                            • STATE_SNAPSHOT / STATE_DELTA
                            • CUSTOM (render_chart, render_dashboard)
                                       │
┌──────────────────────────────────────┴───────────────────────────────────────┐
│                           Python Backend                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     adk-agui-middleware                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │  FastAPI + SSE Endpoint (/api/ag-ui/sse)                        │   │  │
│  │  │  - Bridges AG-UI Protocol ↔ Google ADK                          │   │  │
│  │  │  - Handles bidirectional event streaming                        │   │  │
│  │  │  - Manages session state                                        │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────┬───────────────────────────────────┘  │
│                                       │                                       │
│  ┌────────────────────────────────────┴───────────────────────────────────┐  │
│  │                     Google ADK Agent                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │  ChartAnalyticsAgent                                            │   │  │
│  │  │  - Model: Gemini 3 Pro                                          │   │  │
│  │  │  - Tools: render_chart, render_dashboard, query_data, etc.      │   │  │
│  │  │  - Streaming: Native ADK streaming → AG-UI events               │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                       │
│  ┌────────────────────────────────────┴───────────────────────────────────┐  │
│  │                     Data & Services Layer                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │  │
│  │  │ DataService │  │ChartService │  │AnalyticsSvc │                     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AG-UI Protocol Events

### 2.1 Server → Client Events (Backend to Angular)

| Event Type | Purpose | Payload |
|------------|---------|---------|
| `RUN_STARTED` | Agent run begins | `{ runId, threadId, timestamp }` |
| `RUN_FINISHED` | Agent run completes | `{ runId, status }` |
| `TEXT_MESSAGE_START` | Text streaming begins | `{ messageId, role }` |
| `TEXT_MESSAGE_CONTENT` | Text chunk | `{ messageId, content }` |
| `TEXT_MESSAGE_END` | Text streaming ends | `{ messageId }` |
| `TOOL_CALL_START` | Tool invocation begins | `{ toolCallId, toolName }` |
| `TOOL_CALL_ARGS` | Tool arguments (streamed) | `{ toolCallId, args }` |
| `TOOL_CALL_END` | Tool invocation ends | `{ toolCallId, result }` |
| `STATE_SNAPSHOT` | Full state sync | `{ state: { charts: [], kpis: [] } }` |
| `STATE_DELTA` | Incremental state update | `{ delta: { charts: { add: [...] } } }` |
| `CUSTOM` | Custom events | `{ name: "render_chart", value: ChartConfig }` |

### 2.2 Client → Server Events (Angular to Backend)

| Event Type | Purpose | Payload |
|------------|---------|---------|
| `USER_MESSAGE` | User chat input | `{ content, threadId }` |
| `USER_ACTION` | Chart interaction | `{ action: "click", chartId, data }` |
| `STATE_UPDATE` | Frontend state change | `{ filters, selectedChart }` |
| `TOOL_APPROVAL` | HITL approval | `{ toolCallId, approved, modifications }` |

---

## 3. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Python | 3.11+ |
| Agent Framework | Google ADK | 1.0.0+ |
| AG-UI Middleware | adk-agui-middleware | Latest |
| LLM Model | Gemini 3 Pro | gemini-3.0-pro |
| Web Framework | FastAPI | 0.110+ |
| SSE | sse-starlette | 1.6+ |
| Async Server | Uvicorn | 0.27+ |
| Data Validation | Pydantic | 2.0+ |

---

## 4. Project Structure

```
ag-ui-backend/
├── pyproject.toml
├── .env.example
├── README.md
│
├── src/
│   └── ag_ui_backend/
│       ├── __init__.py
│       ├── main.py                    # FastAPI + AG-UI middleware setup
│       ├── config.py                  # Settings
│       │
│       ├── agui/                      # AG-UI Protocol Layer
│       │   ├── __init__.py
│       │   ├── middleware.py          # adk-agui-middleware integration
│       │   ├── events.py              # AG-UI event types
│       │   ├── state.py               # Shared state management
│       │   └── handlers.py            # Event handlers
│       │
│       ├── agents/                    # Google ADK Agents
│       │   ├── __init__.py
│       │   ├── chart_agent.py         # Main ChartAnalyticsAgent
│       │   └── tools/
│       │       ├── __init__.py
│       │       ├── chart_tools.py     # render_chart, render_dashboard
│       │       ├── data_tools.py      # query_data, aggregate_data
│       │       └── analysis_tools.py  # analyze_trends, generate_kpis
│       │
│       ├── models/                    # Pydantic Models
│       │   ├── __init__.py
│       │   ├── agui_events.py         # AG-UI protocol events
│       │   ├── state.py               # Shared state models
│       │   └── charts/                # Chart configurations
│       │       ├── __init__.py
│       │       ├── base.py
│       │       ├── line.py
│       │       ├── bar.py
│       │       └── ... (all 14 chart types)
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── data_service.py
│       │   ├── chart_service.py
│       │   └── analytics_service.py
│       │
│       └── data/                      # Sample data
│           ├── __init__.py
│           └── sample_data.py
│
└── tests/
    ├── __init__.py
    ├── test_agui_events.py
    ├── test_agent.py
    └── test_tools.py
```

---

## 5. Core Implementation

### 5.1 Main Application with AG-UI Middleware

```python
# src/ag_ui_backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from adk_agui_middleware import AGUIMiddleware, AGUIConfig
from google.adk import Agent
from google.adk.models import Gemini

from .agents.chart_agent import create_chart_agent
from .config import settings

app = FastAPI(title="AG-UI Chart Analytics Backend")

# CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the ADK Agent
chart_agent = create_chart_agent()

# Configure AG-UI Middleware
agui_config = AGUIConfig(
    agent=chart_agent,
    endpoint="/api/ag-ui",
    enable_hitl=True,  # Human-in-the-Loop
    state_sync=True,   # Enable shared state
    stream_tool_calls=True,
)

# Mount AG-UI middleware - handles SSE streaming automatically
AGUIMiddleware.setup(app, agui_config)

@app.get("/health")
async def health():
    return {"status": "healthy", "agent": "ChartAnalyticsAgent"}
```

### 5.2 Chart Analytics Agent with ADK

```python
# src/ag_ui_backend/agents/chart_agent.py

from google.adk import Agent
from google.adk.models import Gemini
from google.adk.tools import tool

from .tools.chart_tools import render_chart, render_dashboard
from .tools.data_tools import query_data, aggregate_data
from .tools.analysis_tools import analyze_trends, detect_anomalies, generate_kpis

SYSTEM_PROMPT = """
You are an Enterprise Analytics Agent for data visualization using the AG-UI protocol.

## Your Capabilities
1. Render interactive charts (line, bar, pie, gauge, gantt, etc.)
2. Generate KPI dashboards with real-time metrics
3. Analyze trends, detect anomalies, and provide insights
4. Support drill-down, filtering, and data exploration

## Available Chart Types
- line-chart: Time series, trends
- bar-chart: Categorical comparisons
- area-chart: Cumulative values
- combo-chart: Mixed line + bar
- waterfall-chart: Variance analysis
- kpi-card: Single metrics with sparklines
- gauge-chart: Progress indicators
- bullet-chart: Target vs actual
- pie-chart: Proportions
- gantt-chart: Project timelines
- heatmap-chart: Matrix visualization
- treemap-chart: Hierarchical data
- funnel-chart: Conversion pipelines
- radar-chart: Multi-dimensional comparison

## AG-UI Integration
- Use render_chart to display a single visualization
- Use render_dashboard to display multiple charts together
- Charts are rendered directly in the user's frontend via AG-UI protocol
- Support real-time updates and user interactions

When users ask questions, analyze the data and render appropriate visualizations.
Always provide insights alongside the charts.
"""

def create_chart_agent() -> Agent:
    """Create the Chart Analytics Agent with all tools."""

    return Agent(
        model=Gemini(model="gemini-3.0-pro"),
        name="ChartAnalyticsAgent",
        description="Enterprise analytics agent for interactive data visualization",
        instructions=SYSTEM_PROMPT,
        tools=[
            # Chart rendering tools
            render_chart,
            render_dashboard,

            # Data tools
            query_data,
            aggregate_data,

            # Analysis tools
            analyze_trends,
            detect_anomalies,
            generate_kpis,
        ]
    )
```

### 5.3 Chart Tools with AG-UI Events

```python
# src/ag_ui_backend/agents/tools/chart_tools.py

from google.adk.tools import tool
from google.adk.events import CustomEvent
from typing import List, Optional, Literal
import uuid

from ...services.chart_service import ChartService
from ...services.data_service import DataService
from ...models.charts import ChartConfig

chart_service = ChartService()
data_service = DataService()

ChartType = Literal[
    "line-chart", "bar-chart", "area-chart", "combo-chart",
    "waterfall-chart", "kpi-card", "gauge-chart", "bullet-chart",
    "pie-chart", "gantt-chart", "heatmap-chart", "treemap-chart",
    "funnel-chart", "radar-chart"
]

@tool
async def render_chart(
    chart_type: ChartType,
    title: str,
    data_query: str,
    subtitle: Optional[str] = None,
    enable_drilldown: bool = True,
    enable_export: bool = True,
) -> CustomEvent:
    """
    Render a single chart visualization to the frontend via AG-UI protocol.

    Args:
        chart_type: Type of chart to render
        title: Chart title
        data_query: Description of data to visualize (e.g., "monthly revenue for 2024")
        subtitle: Optional subtitle
        enable_drilldown: Enable click-to-drilldown
        enable_export: Enable export functionality

    Returns:
        CustomEvent with chart configuration for AG-UI frontend
    """
    # Fetch data based on query
    data = await data_service.fetch_data(data_query)

    # Generate chart configuration
    config = await chart_service.create_config(
        chart_type=chart_type,
        title=title,
        subtitle=subtitle,
        data=data,
        options={
            "drilldownEnabled": enable_drilldown,
            "exportable": enable_export,
        }
    )

    # Return AG-UI CustomEvent - middleware handles streaming to frontend
    return CustomEvent(
        name="render_chart",
        value=config.model_dump(by_alias=True)
    )


@tool
async def render_dashboard(
    charts: List[dict],
    title: str = "Analytics Dashboard",
    layout: Literal["grid", "vertical", "horizontal"] = "grid",
) -> CustomEvent:
    """
    Render multiple charts as a dashboard layout via AG-UI protocol.

    Args:
        charts: List of chart specifications, each with:
            - chart_type: Type of chart
            - title: Chart title
            - data_query: Data to visualize
        title: Dashboard title
        layout: Layout arrangement (grid, vertical, horizontal)

    Returns:
        CustomEvent with dashboard configuration for AG-UI frontend
    """
    configs = []

    for chart_spec in charts:
        data = await data_service.fetch_data(chart_spec.get("data_query", ""))
        config = await chart_service.create_config(
            chart_type=chart_spec["chart_type"],
            title=chart_spec["title"],
            data=data,
            options=chart_spec.get("options", {})
        )
        configs.append(config.model_dump(by_alias=True))

    # Return AG-UI CustomEvent with all charts
    return CustomEvent(
        name="render_dashboard",
        value={
            "title": title,
            "layout": layout,
            "charts": configs
        }
    )
```

### 5.4 Data Tools

```python
# src/ag_ui_backend/agents/tools/data_tools.py

from google.adk.tools import tool
from typing import Optional, Literal
from datetime import datetime

from ...services.data_service import DataService

data_service = DataService()

@tool
async def query_data(
    source: Literal["revenue", "projects", "kpis", "resources", "sales"],
    aggregation: Optional[Literal["daily", "weekly", "monthly", "quarterly", "yearly"]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    filters: Optional[dict] = None,
) -> dict:
    """
    Query business data from available data sources.

    Args:
        source: Data source to query
        aggregation: Time-based aggregation
        start_date: Start date (ISO format)
        end_date: End date (ISO format)
        filters: Additional filter criteria

    Returns:
        Query results with data records
    """
    result = await data_service.query(
        source=source,
        aggregation=aggregation,
        start_date=datetime.fromisoformat(start_date) if start_date else None,
        end_date=datetime.fromisoformat(end_date) if end_date else None,
        filters=filters or {}
    )

    return {
        "source": source,
        "record_count": len(result.get("records", [])),
        "aggregation": aggregation,
        "data": result
    }


@tool
async def aggregate_data(
    data: list,
    group_by: str,
    metrics: list,
) -> dict:
    """
    Aggregate data with grouping and metric calculations.

    Args:
        data: Data to aggregate
        group_by: Field to group by
        metrics: List of metrics, e.g., [{"field": "revenue", "agg": "sum"}]

    Returns:
        Aggregated results by group
    """
    return await data_service.aggregate(
        data=data,
        group_by=group_by,
        metrics=metrics
    )
```

### 5.5 Analysis Tools

```python
# src/ag_ui_backend/agents/tools/analysis_tools.py

from google.adk.tools import tool
from google.adk.events import CustomEvent
from typing import Optional, Literal, List

from ...services.analytics_service import AnalyticsService
from ...services.data_service import DataService

analytics_service = AnalyticsService()
data_service = DataService()

@tool
async def analyze_trends(
    data_source: str,
    analysis_type: Literal["trend", "seasonality", "forecast", "all"] = "all",
    forecast_periods: int = 3,
) -> dict:
    """
    Analyze trends and patterns in time series data.

    Args:
        data_source: Description of data to analyze
        analysis_type: Type of analysis to perform
        forecast_periods: Number of periods to forecast

    Returns:
        Analysis results with insights and statistics
    """
    data = await data_service.fetch_data(data_source)

    result = await analytics_service.analyze_trends(
        data=data.get("records", []),
        analysis_type=analysis_type,
        periods=forecast_periods
    )

    return {
        "analysis_type": analysis_type,
        "insights": result.get("insights", []),
        "statistics": result.get("statistics", {}),
        "forecast": result.get("forecast"),
    }


@tool
async def detect_anomalies(
    data_source: str,
    sensitivity: Literal["low", "medium", "high"] = "medium",
) -> dict:
    """
    Detect anomalies and outliers in data.

    Args:
        data_source: Description of data to analyze
        sensitivity: Detection sensitivity level

    Returns:
        Detected anomalies with details
    """
    data = await data_service.fetch_data(data_source)

    result = await analytics_service.detect_anomalies(
        data=data.get("records", []),
        sensitivity=sensitivity
    )

    return {
        "anomaly_count": len(result.get("anomalies", [])),
        "anomalies": result.get("anomalies", []),
        "method": result.get("method"),
        "threshold": result.get("threshold"),
    }


@tool
async def generate_kpis(
    metrics: List[str],
    comparison: Literal["previous_period", "previous_year", "target"] = "previous_period",
    include_sparkline: bool = True,
) -> CustomEvent:
    """
    Generate KPI cards for specified metrics via AG-UI protocol.

    Args:
        metrics: List of metric names (e.g., ["total_revenue", "active_projects"])
        comparison: Comparison period for trend calculation
        include_sparkline: Include sparkline trend data

    Returns:
        CustomEvent with KPI card configurations
    """
    kpi_configs = []

    for metric in metrics:
        data = await data_service.get_kpi_data(
            metric=metric,
            comparison=comparison,
            include_history=include_sparkline
        )

        kpi_configs.append({
            "componentType": "kpi-card",
            "id": f"kpi-{metric}",
            "title": metric.replace("_", " ").title(),
            "value": data["value"],
            "previousValue": data.get("previous_value"),
            "trendValue": data.get("change_percent"),
            "format": data.get("format", "number"),
            "sparklineData": data.get("history") if include_sparkline else None,
            "icon": _get_kpi_icon(metric),
        })

    return CustomEvent(
        name="render_dashboard",
        value={
            "title": "Key Performance Indicators",
            "layout": "horizontal",
            "charts": kpi_configs
        }
    )


def _get_kpi_icon(metric: str) -> str:
    """Get appropriate Material icon for metric."""
    icons = {
        "revenue": "attach_money",
        "sales": "trending_up",
        "projects": "folder",
        "utilization": "speed",
        "satisfaction": "sentiment_satisfied",
    }
    for key, icon in icons.items():
        if key in metric.lower():
            return icon
    return "analytics"
```

---

## 6. AG-UI Event Models

```python
# src/ag_ui_backend/models/agui_events.py

from pydantic import BaseModel, Field
from typing import Optional, List, Any, Literal
from datetime import datetime
from enum import Enum

class AGUIEventType(str, Enum):
    # Lifecycle events
    RUN_STARTED = "RUN_STARTED"
    RUN_FINISHED = "RUN_FINISHED"

    # Text streaming
    TEXT_MESSAGE_START = "TEXT_MESSAGE_START"
    TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT"
    TEXT_MESSAGE_END = "TEXT_MESSAGE_END"

    # Tool calls
    TOOL_CALL_START = "TOOL_CALL_START"
    TOOL_CALL_ARGS = "TOOL_CALL_ARGS"
    TOOL_CALL_END = "TOOL_CALL_END"

    # State management
    STATE_SNAPSHOT = "STATE_SNAPSHOT"
    STATE_DELTA = "STATE_DELTA"

    # Custom events (charts)
    CUSTOM = "CUSTOM"


class BaseAGUIEvent(BaseModel):
    """Base class for all AG-UI events."""
    type: AGUIEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    run_id: Optional[str] = Field(None, alias="runId")


class RunStartedEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.RUN_STARTED] = AGUIEventType.RUN_STARTED
    thread_id: str = Field(..., alias="threadId")


class RunFinishedEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.RUN_FINISHED] = AGUIEventType.RUN_FINISHED
    status: Literal["completed", "error", "cancelled"]


class TextMessageStartEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TEXT_MESSAGE_START] = AGUIEventType.TEXT_MESSAGE_START
    message_id: str = Field(..., alias="messageId")
    role: Literal["assistant", "user"] = "assistant"


class TextMessageContentEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TEXT_MESSAGE_CONTENT] = AGUIEventType.TEXT_MESSAGE_CONTENT
    message_id: str = Field(..., alias="messageId")
    content: str


class TextMessageEndEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TEXT_MESSAGE_END] = AGUIEventType.TEXT_MESSAGE_END
    message_id: str = Field(..., alias="messageId")


class ToolCallStartEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TOOL_CALL_START] = AGUIEventType.TOOL_CALL_START
    tool_call_id: str = Field(..., alias="toolCallId")
    tool_name: str = Field(..., alias="toolName")


class ToolCallArgsEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TOOL_CALL_ARGS] = AGUIEventType.TOOL_CALL_ARGS
    tool_call_id: str = Field(..., alias="toolCallId")
    args: dict


class ToolCallEndEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.TOOL_CALL_END] = AGUIEventType.TOOL_CALL_END
    tool_call_id: str = Field(..., alias="toolCallId")
    result: Any


class StateSnapshotEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.STATE_SNAPSHOT] = AGUIEventType.STATE_SNAPSHOT
    state: dict


class StateDeltaEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.STATE_DELTA] = AGUIEventType.STATE_DELTA
    delta: dict


class CustomEvent(BaseAGUIEvent):
    type: Literal[AGUIEventType.CUSTOM] = AGUIEventType.CUSTOM
    name: str  # e.g., "render_chart", "render_dashboard"
    value: Any
```

---

## 7. Shared State Management

```python
# src/ag_ui_backend/models/state.py

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from .charts import ChartConfig

class DashboardState(BaseModel):
    """Shared state between frontend and backend."""

    # Currently displayed charts
    charts: List[ChartConfig] = Field(default_factory=list)

    # Active filters
    filters: Dict[str, Any] = Field(default_factory=dict)

    # Selected chart for drilldown
    selected_chart_id: Optional[str] = Field(None, alias="selectedChartId")

    # Drilldown path
    drilldown_path: List[str] = Field(default_factory=list, alias="drilldownPath")

    # User preferences
    theme: str = "light"

    # Real-time subscriptions
    subscribed_charts: List[str] = Field(default_factory=list, alias="subscribedCharts")


# src/ag_ui_backend/agui/state.py

from typing import Dict
from ..models.state import DashboardState

class StateManager:
    """Manages shared state across AG-UI sessions."""

    def __init__(self):
        self._sessions: Dict[str, DashboardState] = {}

    def get_state(self, session_id: str) -> DashboardState:
        if session_id not in self._sessions:
            self._sessions[session_id] = DashboardState()
        return self._sessions[session_id]

    def update_state(self, session_id: str, updates: dict) -> DashboardState:
        state = self.get_state(session_id)
        for key, value in updates.items():
            if hasattr(state, key):
                setattr(state, key, value)
        return state

    def add_chart(self, session_id: str, chart: dict) -> DashboardState:
        state = self.get_state(session_id)
        state.charts.append(chart)
        return state

    def clear_charts(self, session_id: str) -> DashboardState:
        state = self.get_state(session_id)
        state.charts = []
        return state

state_manager = StateManager()
```

---

## 8. Angular Frontend Integration

### 8.1 Updated AgUiService for AG-UI Protocol

```typescript
// src/app/services/ag-ui.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ChartConfig } from '../models/ag-ui.models';

interface AGUIEvent {
  type: string;
  runId?: string;
  timestamp?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AgUiService {
  private readonly SSE_URL = 'http://localhost:8000/api/ag-ui/sse';

  // State observables
  private chartConfigsSubject = new BehaviorSubject<ChartConfig[]>([]);
  private messagesSubject = new BehaviorSubject<string[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<string>();

  public chartConfigs$ = this.chartConfigsSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private eventSource: EventSource | null = null;
  private currentMessageContent = '';

  /**
   * Send a message to the agent and receive streaming response
   */
  sendMessage(message: string, sessionId?: string): void {
    this.loadingSubject.next(true);
    this.currentMessageContent = '';

    // Close existing connection
    this.closeConnection();

    // Create SSE connection with message
    const url = new URL(this.SSE_URL);
    url.searchParams.set('message', message);
    if (sessionId) {
      url.searchParams.set('session_id', sessionId);
    }

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      const data: AGUIEvent = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      this.errorSubject.next('Connection error');
      this.loadingSubject.next(false);
      this.closeConnection();
    };
  }

  /**
   * Handle incoming AG-UI protocol events
   */
  private handleEvent(event: AGUIEvent): void {
    switch (event.type) {
      case 'RUN_STARTED':
        this.loadingSubject.next(true);
        break;

      case 'RUN_FINISHED':
        this.loadingSubject.next(false);
        this.closeConnection();
        break;

      case 'TEXT_MESSAGE_START':
        this.currentMessageContent = '';
        break;

      case 'TEXT_MESSAGE_CONTENT':
        this.currentMessageContent += event.content;
        // Update messages in real-time
        const messages = [...this.messagesSubject.value];
        if (messages.length > 0 && messages[messages.length - 1].startsWith('[streaming]')) {
          messages[messages.length - 1] = `[streaming]${this.currentMessageContent}`;
        } else {
          messages.push(`[streaming]${this.currentMessageContent}`);
        }
        this.messagesSubject.next(messages);
        break;

      case 'TEXT_MESSAGE_END':
        // Finalize the message
        const finalMessages = this.messagesSubject.value.map(m =>
          m.startsWith('[streaming]') ? m.replace('[streaming]', '') : m
        );
        this.messagesSubject.next(finalMessages);
        break;

      case 'TOOL_CALL_START':
        console.log(`Tool call started: ${event.toolName}`);
        break;

      case 'TOOL_CALL_END':
        // Tool completed - result might contain chart config
        if (event.result?.name === 'render_chart') {
          this.handleRenderChart(event.result.value);
        } else if (event.result?.name === 'render_dashboard') {
          this.handleRenderDashboard(event.result.value);
        }
        break;

      case 'CUSTOM':
        this.handleCustomEvent(event);
        break;

      case 'STATE_SNAPSHOT':
        this.handleStateSnapshot(event.state);
        break;

      case 'STATE_DELTA':
        this.handleStateDelta(event.delta);
        break;
    }
  }

  private handleRenderChart(config: ChartConfig): void {
    const current = this.chartConfigsSubject.value;
    this.chartConfigsSubject.next([...current, config]);
  }

  private handleRenderDashboard(dashboard: { charts: ChartConfig[] }): void {
    this.chartConfigsSubject.next(dashboard.charts);
  }

  private handleCustomEvent(event: AGUIEvent): void {
    if (event.name === 'render_chart') {
      this.handleRenderChart(event.value);
    } else if (event.name === 'render_dashboard') {
      this.handleRenderDashboard(event.value);
    }
  }

  private handleStateSnapshot(state: any): void {
    if (state.charts) {
      this.chartConfigsSubject.next(state.charts);
    }
  }

  private handleStateDelta(delta: any): void {
    if (delta.charts?.add) {
      const current = this.chartConfigsSubject.value;
      this.chartConfigsSubject.next([...current, ...delta.charts.add]);
    }
  }

  /**
   * Send user action (click, drilldown, filter)
   */
  sendAction(action: { type: string; chartId: string; data: any }): void {
    fetch(`${this.SSE_URL.replace('/sse', '/action')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
  }

  private closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  clearCharts(): void {
    this.chartConfigsSubject.next([]);
  }
}
```

---

## 9. Sample Interactions

### 9.1 User Requests Dashboard

```
User: "Show me a dashboard with revenue trends and KPIs"

Agent Flow:
1. Agent receives message via AG-UI SSE
2. Calls query_data(source="revenue", aggregation="monthly")
3. Calls generate_kpis(metrics=["total_revenue", "active_projects", "utilization"])
4. Calls render_dashboard with charts config

AG-UI Events Sent:
1. RUN_STARTED { runId: "xxx", threadId: "yyy" }
2. TEXT_MESSAGE_START { messageId: "msg1" }
3. TEXT_MESSAGE_CONTENT { content: "I'll create a dashboard..." }
4. TEXT_MESSAGE_END { messageId: "msg1" }
5. TOOL_CALL_START { toolName: "query_data" }
6. TOOL_CALL_END { result: { records: [...] } }
7. TOOL_CALL_START { toolName: "render_dashboard" }
8. CUSTOM { name: "render_dashboard", value: { charts: [...] } }
9. TOOL_CALL_END { ... }
10. RUN_FINISHED { status: "completed" }

Angular receives CUSTOM event → renders charts via DynamicChartRenderer
```

### 9.2 User Clicks for Drilldown

```
User: Clicks on "Engineering" slice in pie chart

Frontend sends:
POST /api/ag-ui/action
{
  "type": "drilldown",
  "chartId": "budget-pie",
  "data": { "category": "Engineering", "value": 450000 }
}

Agent Flow:
1. Receives drilldown action
2. Calls query_data with filter for Engineering
3. Calls render_chart(chart_type="treemap", title="Engineering Budget")

AG-UI Events:
1. CUSTOM { name: "render_chart", value: TreemapConfig }

Angular receives → replaces/adds treemap chart
```

---

## 10. Configuration

```python
# src/ag_ui_backend/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    app_name: str = "AG-UI Chart Analytics"
    debug: bool = False

    # Google AI
    google_api_key: str
    gemini_model: str = "gemini-3.0-pro"

    # AG-UI
    agui_endpoint: str = "/api/ag-ui"
    enable_hitl: bool = True
    enable_state_sync: bool = True

    # CORS
    cors_origins: list[str] = ["http://localhost:4200"]

    class Config:
        env_file = ".env"

settings = Settings()
```

```bash
# .env
GOOGLE_API_KEY=your-api-key
GEMINI_MODEL=gemini-3.0-pro
CORS_ORIGINS=http://localhost:4200
DEBUG=true
```

---

## 11. Dependencies

```toml
# pyproject.toml

[tool.poetry.dependencies]
python = "^3.11"
google-adk = "^1.0.0"
adk-agui-middleware = "^0.1.0"
google-generativeai = "^0.4.0"
fastapi = "^0.110.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
sse-starlette = "^1.6.0"
pydantic = "^2.6.0"
pydantic-settings = "^2.2.0"
pandas = "^2.2.0"
numpy = "^1.26.0"
```

---

## 12. Implementation Plan

| Phase | Tasks | Effort |
|-------|-------|--------|
| 1 | Setup project, install adk-agui-middleware, basic FastAPI | 0.5 day |
| 2 | Create ADK agent with chart tools | 1 day |
| 3 | Implement data and analytics services | 1 day |
| 4 | Update Angular AgUiService for AG-UI protocol | 0.5 day |
| 5 | Add sample data and test end-to-end | 1 day |
| 6 | Add HITL and state sync features | 1 day |

**Total: ~5 days** (reduced from 8 days due to native AG-UI support)

---

## 13. Key Differences from Previous Spec

| Aspect | Previous | Updated |
|--------|----------|---------|
| **Integration** | Custom FastAPI + manual SSE | Native adk-agui-middleware |
| **Events** | Custom event types | Standard AG-UI protocol events |
| **State** | Manual state management | Built-in STATE_SNAPSHOT/DELTA |
| **Streaming** | Custom implementation | Native ADK streaming → AG-UI |
| **HITL** | Not included | Built-in Human-in-the-Loop |
| **Complexity** | ~50 files | ~25 files |
| **Effort** | 8 days | 5 days |

---

## 14. Files to Modify

### Backend (New)
- `ag-ui-backend/src/ag_ui_backend/main.py` - FastAPI + AG-UI middleware
- `ag-ui-backend/src/ag_ui_backend/agents/chart_agent.py` - ADK agent
- `ag-ui-backend/src/ag_ui_backend/agents/tools/*.py` - Agent tools
- `ag-ui-backend/src/ag_ui_backend/services/*.py` - Data services

### Frontend (Update)
- `src/app/services/ag-ui.service.ts` - Update for AG-UI protocol SSE

---

## 15. Verification

1. Start backend: `uvicorn ag_ui_backend.main:app --reload`
2. Start frontend: `npm start`
3. Open http://localhost:4200
4. Type: "Show me revenue trends for 2024"
5. Verify: Line chart renders via AG-UI protocol
6. Click on chart element
7. Verify: Drilldown chart renders
