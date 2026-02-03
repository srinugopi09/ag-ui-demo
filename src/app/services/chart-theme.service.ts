import { Injectable, signal } from '@angular/core';
import type { EChartsOption } from 'echarts';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ChartThemeService {
  private currentTheme = signal<ThemeMode>('light');

  // Enterprise color palette
  private readonly colorPalette = {
    light: {
      primary: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      background: '#ffffff',
      textColor: '#333333',
      axisLineColor: '#cccccc',
      splitLineColor: '#eeeeee',
      tooltipBackground: 'rgba(255, 255, 255, 0.95)',
      tooltipBorderColor: '#ccc',
      increase: '#91cc75',
      decrease: '#ee6666',
      total: '#5470c6',
      warning: '#fac858',
      critical: '#ee6666',
      success: '#91cc75'
    },
    dark: {
      primary: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'],
      background: '#1a1a2e',
      textColor: '#e0e0e0',
      axisLineColor: '#404040',
      splitLineColor: '#2a2a3e',
      tooltipBackground: 'rgba(30, 30, 50, 0.95)',
      tooltipBorderColor: '#404040',
      increase: '#7cffb2',
      decrease: '#ff6e76',
      total: '#4992ff',
      warning: '#fddd60',
      critical: '#ff6e76',
      success: '#7cffb2'
    }
  };

  getTheme(): ThemeMode {
    return this.currentTheme();
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    this.currentTheme.set(this.currentTheme() === 'light' ? 'dark' : 'light');
  }

  getColors(): typeof this.colorPalette.light {
    return this.colorPalette[this.currentTheme()];
  }

  getBaseChartOptions(): Partial<EChartsOption> {
    const colors = this.getColors();

    return {
      color: colors.primary,
      backgroundColor: 'transparent',
      textStyle: {
        color: colors.textColor,
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif'
      },
      title: {
        textStyle: {
          color: colors.textColor,
          fontSize: 16,
          fontWeight: 500
        },
        subtextStyle: {
          color: colors.textColor,
          fontSize: 12
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBackground,
        borderColor: colors.tooltipBorderColor,
        textStyle: {
          color: colors.textColor
        },
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: colors.axisLineColor
          }
        }
      },
      legend: {
        textStyle: {
          color: colors.textColor
        }
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: colors.axisLineColor
          }
        },
        axisLabel: {
          color: colors.textColor
        },
        splitLine: {
          lineStyle: {
            color: colors.splitLineColor
          }
        }
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: colors.axisLineColor
          }
        },
        axisLabel: {
          color: colors.textColor
        },
        splitLine: {
          lineStyle: {
            color: colors.splitLineColor
          }
        }
      },
      grid: {
        containLabel: true,
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 60
      }
    };
  }

  // Utility to merge base options with component-specific options
  mergeOptions(componentOptions: Partial<EChartsOption>): EChartsOption {
    const baseOptions = this.getBaseChartOptions();
    return this.deepMerge(baseOptions, componentOptions) as EChartsOption;
  }

  private deepMerge(target: unknown, source: unknown): unknown {
    if (source === null || source === undefined) {
      return target;
    }

    if (typeof source !== 'object' || Array.isArray(source)) {
      return source;
    }

    const output = { ...(target as Record<string, unknown>) };
    const sourceObj = source as Record<string, unknown>;

    for (const key in sourceObj) {
      if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
        if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null && !Array.isArray(sourceObj[key])) {
          output[key] = this.deepMerge(output[key], sourceObj[key]);
        } else {
          output[key] = sourceObj[key];
        }
      }
    }

    return output;
  }
}
