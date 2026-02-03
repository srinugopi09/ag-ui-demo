import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  ChartClickEvent,
  ChartDrilldownEvent,
  ChartFilterEvent
} from '../models/ag-ui.models';

@Injectable({
  providedIn: 'root'
})
export class ChartInteractionService {
  private clickEvents = new Subject<ChartClickEvent>();
  private drilldownEvents = new Subject<ChartDrilldownEvent>();
  private filterEvents = new Subject<ChartFilterEvent>();
  private realTimeUpdates = new Map<string, Subject<unknown>>();

  // Click events
  emitClick(event: ChartClickEvent): void {
    this.clickEvents.next(event);
  }

  onClick(chartId?: string): Observable<ChartClickEvent> {
    if (chartId) {
      return this.clickEvents.pipe(
        filter(event => event.chartId === chartId)
      );
    }
    return this.clickEvents.asObservable();
  }

  // Drilldown events
  emitDrilldown(event: ChartDrilldownEvent): void {
    this.drilldownEvents.next(event);
  }

  onDrilldown(chartId?: string): Observable<ChartDrilldownEvent> {
    if (chartId) {
      return this.drilldownEvents.pipe(
        filter(event => event.chartId === chartId)
      );
    }
    return this.drilldownEvents.asObservable();
  }

  // Filter events (click-to-filter)
  emitFilter(event: ChartFilterEvent): void {
    this.filterEvents.next(event);
  }

  onFilter(chartId?: string): Observable<ChartFilterEvent> {
    if (chartId) {
      return this.filterEvents.pipe(
        filter(event => event.chartId === chartId)
      );
    }
    return this.filterEvents.asObservable();
  }

  // Real-time streaming updates
  registerChart(chartId: string): void {
    if (!this.realTimeUpdates.has(chartId)) {
      this.realTimeUpdates.set(chartId, new Subject<unknown>());
    }
  }

  unregisterChart(chartId: string): void {
    const subject = this.realTimeUpdates.get(chartId);
    if (subject) {
      subject.complete();
      this.realTimeUpdates.delete(chartId);
    }
  }

  pushUpdate(chartId: string, data: unknown): void {
    const subject = this.realTimeUpdates.get(chartId);
    if (subject) {
      subject.next(data);
    }
  }

  onUpdates(chartId: string): Observable<unknown> | undefined {
    return this.realTimeUpdates.get(chartId)?.asObservable();
  }

  // Broadcast update to all registered charts
  broadcastUpdate(data: unknown): void {
    this.realTimeUpdates.forEach(subject => subject.next(data));
  }
}
