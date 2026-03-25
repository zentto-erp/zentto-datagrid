import type { GridRow, ColumnDef } from '../types';

/**
 * Export rows to an HTML table string that Excel can open.
 */
export function toExcelHtml(rows: GridRow[], columns: ColumnDef[]): string {
  const visibleCols = columns.filter((c) => !c.field.startsWith('__'));
  const header = visibleCols.map((c) => `<th style="background:#f0f0f0;font-weight:bold;border:1px solid #ccc;padding:4px 8px">${c.header || c.field}</th>`).join('');
  const body = rows.map((row) =>
    `<tr>${visibleCols.map((c) => {
      const val = row[c.field] ?? '';
      const align = c.type === 'number' || c.currency ? 'right' : 'left';
      return `<td style="border:1px solid #ccc;padding:4px 8px;text-align:${align}">${val}</td>`;
    }).join('')}</tr>`
  ).join('');
  return `<html><head><meta charset="utf-8"></head><body><table>${header}${body}</table></body></html>`;
}

/**
 * Download Excel (.xls) as a file.
 */
export function downloadExcel(rows: GridRow[], columns: ColumnDef[], filename = 'export'): void {
  const html = toExcelHtml(rows, columns);
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
