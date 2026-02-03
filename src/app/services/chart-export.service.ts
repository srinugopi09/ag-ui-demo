import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { ExportOptions } from '../models/ag-ui.models';

// Chart instance interface for export functionality - uses 'any' for ECharts compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartInstance = any;

@Injectable({
  providedIn: 'root'
})
export class ChartExportService {

  /**
   * Export chart as image (PNG, JPEG, or SVG)
   */
  exportAsImage(
    chart: ChartInstance,
    options: ExportOptions = { format: 'png' }
  ): void {
    const { format, filename, quality, backgroundColor } = options;
    const name = filename || `chart-${Date.now()}`;

    if (format === 'svg') {
      // SVG export
      const svgDataUrl = chart.getDataURL({
        type: 'svg',
        backgroundColor: backgroundColor || '#ffffff'
      });
      const svgContent = atob(svgDataUrl.split(',')[1]);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `${name}.svg`);
    } else {
      // PNG/JPEG export
      const dataUrl = chart.getDataURL({
        type: format === 'jpeg' ? 'jpeg' : 'png',
        pixelRatio: 2,
        backgroundColor: backgroundColor || '#ffffff',
        ...(format === 'jpeg' && quality ? { quality } : {})
      });

      // Convert data URL to blob
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeType });
      saveAs(blob, `${name}.${format}`);
    }
  }

  /**
   * Export chart data as CSV
   */
  exportAsCsv(
    data: { headers: string[]; rows: (string | number)[][] },
    filename?: string
  ): void {
    const name = filename || `chart-data-${Date.now()}`;

    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row =>
        row.map(cell =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell}"`
            : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${name}.csv`);
  }

  /**
   * Export chart data as JSON
   */
  exportAsJson(data: unknown, filename?: string): void {
    const name = filename || `chart-data-${Date.now()}`;
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    saveAs(blob, `${name}.json`);
  }

  /**
   * Export chart as PDF (requires html2canvas)
   */
  async exportAsPdf(
    chartElement: HTMLElement,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<void> {
    const { filename, backgroundColor } = options;
    const name = filename || `chart-${Date.now()}`;

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(chartElement, {
        backgroundColor: backgroundColor || '#ffffff',
        scale: 2,
        logging: false
      });

      // For PDF, we'll export as PNG and user can convert
      // Full PDF support would require jsPDF library
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${name}.png`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('PDF export requires html2canvas library');
    }
  }

  /**
   * Helper to convert chart series data to exportable format
   */
  seriesDataToCsv(
    xAxisData: string[],
    series: { name: string; data: number[] }[]
  ): { headers: string[]; rows: (string | number)[][] } {
    const headers = ['Category', ...series.map(s => s.name)];
    const rows = xAxisData.map((category, index) => [
      category,
      ...series.map(s => s.data[index] ?? '')
    ]);

    return { headers, rows };
  }

  /**
   * Helper to convert pie/donut data to exportable format
   */
  pieDataToCsv(
    data: { name: string; value: number }[]
  ): { headers: string[]; rows: (string | number)[][] } {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const headers = ['Name', 'Value', 'Percentage'];
    const rows = data.map(item => [
      item.name,
      item.value,
      `${((item.value / total) * 100).toFixed(2)}%`
    ]);

    return { headers, rows };
  }
}
