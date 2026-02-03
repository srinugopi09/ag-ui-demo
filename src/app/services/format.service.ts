import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  /**
   * Format a number based on the specified format type
   */
  formatValue(
    value: number,
    format: 'number' | 'currency' | 'percentage' = 'number',
    options: {
      decimals?: number;
      prefix?: string;
      suffix?: string;
      locale?: string;
      currency?: string;
    } = {}
  ): string {
    const {
      decimals = 2,
      prefix = '',
      suffix = '',
      locale = 'en-US',
      currency = 'USD'
    } = options;

    let formatted: string;

    switch (format) {
      case 'currency':
        formatted = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value);
        break;

      case 'percentage':
        formatted = new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value / 100);
        break;

      default:
        formatted = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value);
    }

    return `${prefix}${formatted}${suffix}`;
  }

  /**
   * Format large numbers with abbreviations (K, M, B, T)
   */
  formatCompact(value: number, decimals: number = 1): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1e12) {
      return `${sign}${(absValue / 1e12).toFixed(decimals)}T`;
    }
    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
    }
    if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
    }
    if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
    }
    return `${sign}${absValue.toFixed(decimals)}`;
  }

  /**
   * Calculate percentage change between two values
   */
  calculateChange(current: number, previous: number): {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  } {
    if (previous === 0) {
      return {
        value: current,
        percentage: current === 0 ? 0 : 100,
        direction: current > 0 ? 'up' : current < 0 ? 'down' : 'neutral'
      };
    }

    const value = current - previous;
    const percentage = ((current - previous) / Math.abs(previous)) * 100;
    const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

    return { value, percentage, direction };
  }

  /**
   * Format date for display
   */
  formatDate(
    date: string | Date,
    format: 'short' | 'medium' | 'long' | 'full' = 'medium',
    locale: string = 'en-US'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'numeric', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };

    return new Intl.DateTimeFormat(locale, optionsMap[format]).format(dateObj);
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(days: number): string {
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  /**
   * Get color based on value thresholds
   */
  getThresholdColor(
    value: number,
    thresholds: { warning?: number; critical?: number },
    colors: { success: string; warning: string; critical: string }
  ): string {
    if (thresholds.critical !== undefined && value <= thresholds.critical) {
      return colors.critical;
    }
    if (thresholds.warning !== undefined && value <= thresholds.warning) {
      return colors.warning;
    }
    return colors.success;
  }
}
