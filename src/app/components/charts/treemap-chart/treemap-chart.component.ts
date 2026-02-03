import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { TreemapChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

import { BaseChartComponent } from '../base-chart.component';
import { TreemapChartConfig, TreemapNode } from '../../../models/ag-ui.models';

echarts.use([TreemapChart, TitleComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-treemap-chart',
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
            <button mat-menu-item (click)="export('json')">
              <mat-icon>data_object</mat-icon>
              <span>Export as JSON</span>
            </button>
          </mat-menu>
        </div>
      </mat-card-header>
      <mat-card-content class="chart-content">
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
    .chart-content { flex: 1; padding: 16px; min-height: 0; }
    .chart-container { width: 100%; height: 100%; min-height: 300px; }
  `]
})
export class TreemapChartComponent extends BaseChartComponent implements OnChanges {
  @Input() declare config: TreemapChartConfig | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.config) return;

    const colors = this.themeService.getColors();

    // Apply colors to top-level nodes
    const coloredData = this.config.data.map((node, index) => ({
      ...node,
      itemStyle: node.itemStyle || { color: colors.primary[index % colors.primary.length] }
    }));

    const options: EChartsOption = {
      title: this.config.title ? {
        text: this.config.title,
        subtext: this.config.subtitle,
        left: 'center'
      } : undefined,
      tooltip: {
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; treePathInfo: { name: string }[] };
          const path = p.treePathInfo?.map(item => item.name).join(' > ') || p.name;
          return `${path}<br/>Value: ${p.value?.toLocaleString() || 'N/A'}`;
        }
      },
      series: [
        {
          type: 'treemap',
          data: coloredData,
          width: '100%',
          height: '100%',
          top: this.config.title ? 50 : 10,
          left: 10,
          right: 10,
          bottom: this.config.showBreadcrumb !== false ? 30 : 10,
          roam: false,
          leafDepth: this.config.leafDepth,
          breadcrumb: this.config.showBreadcrumb !== false ? {
            show: true,
            left: 'center',
            bottom: 0,
            itemStyle: {
              color: colors.background,
              borderColor: colors.axisLineColor,
              textStyle: { color: colors.textColor }
            }
          } : { show: false },
          label: {
            show: true,
            formatter: '{b}',
            fontSize: 12,
            color: '#fff'
          },
          upperLabel: {
            show: true,
            height: 30,
            color: '#fff'
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2
          },
          levels: this.config.levels || [
            {
              itemStyle: {
                borderColor: '#555',
                borderWidth: 4,
                gapWidth: 4
              }
            },
            {
              colorSaturation: [0.3, 0.6],
              itemStyle: {
                borderColorSaturation: 0.7,
                gapWidth: 2,
                borderWidth: 2
              }
            },
            {
              colorSaturation: [0.3, 0.5],
              itemStyle: {
                borderColorSaturation: 0.6,
                gapWidth: 1
              }
            },
            {
              colorSaturation: [0.3, 0.5]
            }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      ]
    };

    this.chartOptions.set(options);
  }

  protected override getExportData(): unknown {
    return { data: this.config?.data };
  }

  // Flatten treemap data for CSV export
  protected override getCsvData(): { headers: string[]; rows: (string | number)[][] } | null {
    if (!this.config) return null;

    const rows: (string | number)[][] = [];
    const flattenNode = (node: TreemapNode, path: string = '') => {
      const currentPath = path ? `${path} > ${node.name}` : node.name;
      if (node.value !== undefined) {
        rows.push([currentPath, node.value]);
      }
      if (node.children) {
        node.children.forEach(child => flattenNode(child, currentPath));
      }
    };

    this.config.data.forEach(node => flattenNode(node));

    return {
      headers: ['Path', 'Value'],
      rows
    };
  }
}
