import type { GridRow, ColumnDef } from '../types';

/**
 * Export rows to CSV string.
 */
export function toCsv(rows: GridRow[], columns: ColumnDef[]): string {
  const visibleCols = columns.filter((c) => !c.field.startsWith('__'));
  const header = visibleCols.map((c) => escCsv(c.header || c.field)).join(',');
  const lines = rows.map((row) =>
    visibleCols.map((c) => escCsv(String(row[c.field] ?? ''))).join(',')
  );
  return [header, ...lines].join('\n');
}

function escCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Download CSV as a file.
 */
export function downloadCsv(rows: GridRow[], columns: ColumnDef[], filename = 'export'): void {
  const csv = toCsv(rows, columns);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
