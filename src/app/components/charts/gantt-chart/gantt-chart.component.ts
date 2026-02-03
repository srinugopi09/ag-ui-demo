import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { CustomChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { GanttChartConfig, GanttTask } from '../../../models/ag-ui.models';

echarts.use([CustomChart, TitleComponent, TooltipComponent, GridComponent, DataZoomComponent, CanvasRenderer]);

@Component({
  selector: 'app-gantt-chart',
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
    <mat-card class="chart-card" [style.height]="config?.height || '500px'">
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
            <button mat-menu-item (click)="export('csv')">
              <mat-icon>table_chart</mat-icon>
              <span>Export as CSV</span>
            </button>
          </mat-menu>
        </div>
      </mat-card-header>
      <mat-card-content class="chart-content">
        <div class="legend">
          <span class="legend-item">
            <span class="legend-color" style="background: #91cc75"></span> Completed
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #5470c6"></span> In Progress
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #fac858"></span> Not Started
          </span>
          <span class="legend-item">
            <span class="legend-color" style="background: #ee6666"></span> Delayed
          </span>
        </div>
        <div
          echarts
          [options]="chartOptions()"
          [merge]="mergeOptions()"
          class="chart-container"
          (chartInit)="onChartInit($event)"
          (chartClick)="onChartClick($event)"
        ></div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; }
    .chart-card { height: 100%; display: flex; flex-direction: column; }
    mat-card-header { display: flex; align-items: center; padding: 16px 16px 0; }
    mat-card-title { flex: 1; margin: 0; font-size: 16px; font-weight: 500; }
    .chart-actions { display: flex; gap: 4px; margin-left: auto; }
    .chart-content { flex: 1; padding: 16px; min-height: 0; display: flex; flex-direction: column; }
    .chart-container { flex: 1; width: 100%; min-height: 300px; }

    .legend {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `]
})
export class GanttChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: GanttChartConfig | undefined;

  private statusColors: Record<string, string> = {
    'completed': '#91cc75',
    'in-progress': '#5470c6',
    'not-started': '#fac858',
    'delayed': '#ee6666'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const tasks = this.config.tasks;
    const taskNames = tasks.map(t => t.name).reverse();

    // Calculate date range
    const allDates = tasks.flatMap(t => [new Date(t.start).getTime(), new Date(t.end).getTime()]);
    const minDate = this.config.startDate ? new Date(this.config.startDate).getTime() : Math.min(...allDates);
    const maxDate = this.config.endDate ? new Date(this.config.endDate).getTime() : Math.max(...allDates);

    const options: EChartsOption = {
      ...this.themeService.getBaseChartOptions(),
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { data?: { task?: GanttTask } };
          const task = p.data?.task;
          if (!task) return '';
          const start = new Date(task.start).toLocaleDateString();
          const end = new Date(task.end).toLocaleDateString();
          let html = `<strong>${task.name}</strong><br/>`;
          html += `Start: ${start}<br/>`;
          html += `End: ${end}<br/>`;
          if (task.progress !== undefined) {
            html += `Progress: ${task.progress}%<br/>`;
          }
          if (task.assignee) {
            html += `Assignee: ${task.assignee}<br/>`;
          }
          if (task.status) {
            html += `Status: ${task.status}`;
          }
          return html;
        }
      },
      grid: {
        left: '15%',
        right: '5%',
        top: this.config.title ? '15%' : '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        min: minDate,
        max: maxDate,
        axisLabel: {
          formatter: (value: number) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }
        }
      },
      yAxis: {
        type: 'category',
        data: taskNames,
        axisLabel: {
          width: 100,
          overflow: 'truncate'
        }
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'slider', xAxisIndex: 0, bottom: 10 }
      ],
      series: [
        {
          type: 'custom',
          renderItem: (params, api) => {
            const taskIndex = tasks.length - 1 - (params.dataIndex || 0);
            const task = tasks[taskIndex];
            if (!task) return;

            const startTime = api.value(0) as number;
            const endTime = api.value(1) as number;
            const yValue = api.coord([0, api.value(2)])[1];
            const barHeight = 20;

            const startPoint = api.coord([startTime, yValue]);
            const endPoint = api.coord([endTime, yValue]);

            const width = endPoint[0] - startPoint[0];
            const color = task.color || this.statusColors[task.status || 'not-started'];

            const rectShape = {
              x: startPoint[0],
              y: startPoint[1] - barHeight / 2,
              width: Math.max(width, 2),
              height: barHeight
            };

            // Progress bar
            const progressWidth = this.config?.showProgress && task.progress
              ? (width * task.progress) / 100
              : 0;

            return {
              type: 'group',
              children: [
                // Background bar
                {
                  type: 'rect',
                  shape: rectShape,
                  style: {
                    fill: color,
                    opacity: 0.3
                  }
                },
                // Progress bar
                {
                  type: 'rect',
                  shape: {
                    ...rectShape,
                    width: progressWidth
                  },
                  style: {
                    fill: color
                  }
                },
                // Border
                {
                  type: 'rect',
                  shape: rectShape,
                  style: {
                    fill: 'transparent',
                    stroke: color,
                    lineWidth: 1
                  }
                }
              ]
            };
          },
          data: tasks.map((task, index) => ({
            value: [
              new Date(task.start).getTime(),
              new Date(task.end).getTime(),
              tasks.length - 1 - index
            ],
            task
          })),
          encode: {
            x: [0, 1],
            y: 2
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;
    return {
      headers: ['Task', 'Start', 'End', 'Progress', 'Status', 'Assignee'],
      rows: this.config.tasks.map(t => [
        t.name,
        t.start,
        t.end,
        t.progress ?? '',
        t.status ?? '',
        t.assignee ?? ''
      ])
    };
  }
}
