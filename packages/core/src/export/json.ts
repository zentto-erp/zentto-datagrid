import type { GridRow, ColumnDef } from '../types';

/**
 * Export rows to JSON string (pretty-printed).
 */
export function toJson(rows: GridRow[], columns: ColumnDef[]): string {
  const visibleCols = columns.filter((c) => !c.field.startsWith('__'));
  const clean = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const c of visibleCols) {
      obj[c.header || c.field] = row[c.field] ?? null;
    }
    return obj;
  });
  return JSON.stringify(clean, null, 2);
}

/**
 * Download JSON as a file.
 */
export function downloadJson(rows: GridRow[], columns: ColumnDef[], filename = 'export'): void {
  const json = toJson(rows, columns);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
