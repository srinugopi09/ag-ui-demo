import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ChartConfig, ChartClickEvent, ChartDrilldownEvent, ChartFilterEvent } from '../models/ag-ui.models';
import { ChartInteractionService } from './chart-interaction.service';

/**
 * AG-UI Service for handling Agent-to-UI communication
 *
 * This service provides methods to:
 * 1. Receive chart configurations from the agent (via AG-UI protocol)
 * 2. Send user interactions back to the agent
 * 3. Handle real-time streaming updates
 *
 * Integration with Python Agent (Google ADK):
 *
 * The agent sends CUSTOM events with chart configurations:
 * ```python
 * from ag_ui import CustomEvent
 *
 * # Send a chart configuration to the UI
 * yield CustomEvent(
 *     name="render_chart",
 *     value={
 *         "componentType": "line-chart",
 *         "id": "revenue-chart",
 *         "title": "Monthly Revenue",
 *         "xAxisData": ["Jan", "Feb", "Mar"],
 *         "series": [{"name": "Revenue", "data": [100, 150, 200]}]
 *     }
 * )
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AgUiService {
  private interactionService = inject(ChartInteractionService);

  // Streams for receiving data from agent
  private chartConfigs = new Subject<ChartConfig>();
  private chartConfigsArray = new Subject<ChartConfig[]>();

  // Streams for sending data to agent
  private userActions = new Subject<{
    type: 'click' | 'drilldown' | 'filter' | 'refresh';
    payload: unknown;
  }>();

  /**
   * Observable for single chart configurations
   */
  get chartConfig$(): Observable<ChartConfig> {
    return this.chartConfigs.asObservable();
  }

  /**
   * Observable for multiple chart configurations (dashboard)
   */
  get chartConfigs$(): Observable<ChartConfig[]> {
    return this.chartConfigsArray.asObservable();
  }

  /**
   * Observable for user actions to send back to agent
   */
  get userActions$(): Observable<{ type: string; payload: unknown }> {
    return this.userActions.asObservable();
  }

  /**
   * Process an AG-UI custom event from the agent
   * Call this method when you receive a CUSTOM event from the AG-UI protocol
   */
  handleAgUiEvent(event: { name: string; value: unknown }): void {
    switch (event.name) {
      case 'render_chart':
        this.chartConfigs.next(event.value as ChartConfig);
        break;

      case 'render_dashboard':
      case 'render_charts':
        this.chartConfigsArray.next(event.value as ChartConfig[]);
        break;

      case 'update_chart':
        const updatePayload = event.value as { chartId: string; data: unknown };
        this.interactionService.pushUpdate(updatePayload.chartId, updatePayload.data);
        break;

      case 'stream_data':
        const streamPayload = event.value as { chartId: string; data: unknown };
        this.interactionService.pushUpdate(streamPayload.chartId, streamPayload.data);
        break;

      default:
        console.warn('Unknown AG-UI event:', event.name);
    }
  }

  /**
   * Send a click event to the agent
   */
  sendClickEvent(event: ChartClickEvent): void {
    this.userActions.next({
      type: 'click',
      payload: event
    });
  }

  /**
   * Send a drilldown event to the agent
   */
  sendDrilldownEvent(event: ChartDrilldownEvent): void {
    this.userActions.next({
      type: 'drilldown',
      payload: event
    });
  }

  /**
   * Send a filter event to the agent
   */
  sendFilterEvent(event: ChartFilterEvent): void {
    this.userActions.next({
      type: 'filter',
      payload: event
    });
  }

  /**
   * Request a chart refresh from the agent
   */
  requestRefresh(chartId: string): void {
    this.userActions.next({
      type: 'refresh',
      payload: { chartId }
    });
  }

  /**
   * Helper method to create a mock chart config for testing
   */
  static createMockConfig(type: string): ChartConfig {
    const baseConfig = {
      id: `chart-${Date.now()}`,
      title: 'Sample Chart',
      exportable: true,
      animation: true
    };

    switch (type) {
      case 'line-chart':
        return {
          ...baseConfig,
          componentType: 'line-chart',
          xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          series: [
            { name: 'Revenue', data: [150, 230, 224, 218, 135, 147] },
            { name: 'Expenses', data: [100, 150, 180, 120, 90, 110] }
          ],
          smooth: true,
          showDataZoom: true
        };

      case 'bar-chart':
        return {
          ...baseConfig,
          componentType: 'bar-chart',
          xAxisData: ['Product A', 'Product B', 'Product C', 'Product D'],
          series: [
            { name: 'Q1', data: [120, 200, 150, 80] },
            { name: 'Q2', data: [140, 180, 170, 100] }
          ]
        };

      case 'pie-chart':
        return {
          ...baseConfig,
          componentType: 'pie-chart',
          data: [
            { name: 'Marketing', value: 335 },
            { name: 'Sales', value: 310 },
            { name: 'Engineering', value: 234 },
            { name: 'Operations', value: 135 },
            { name: 'HR', value: 48 }
          ],
          donut: true
        };

      case 'kpi-card':
        return {
          ...baseConfig,
          componentType: 'kpi-card',
          value: 1234567,
          previousValue: 1100000,
          target: 1500000,
          format: 'currency',
          sparklineData: [65, 70, 72, 68, 75, 80, 85, 82, 88, 90, 92, 95]
        };

      default:
        return {
          ...baseConfig,
          componentType: 'line-chart',
          xAxisData: ['A', 'B', 'C'],
          series: [{ name: 'Data', data: [1, 2, 3] }]
        } as ChartConfig;
    }
  }
}
