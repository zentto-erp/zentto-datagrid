import type { GridRow, ColumnDef } from '../types';

export interface FindMatch {
  rowIndex: number;
  field: string;
}

/**
 * Find all cells matching a query string.
 */
export function findInGrid(
  rows: GridRow[],
  columns: ColumnDef[],
  query: string
): FindMatch[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const matches: FindMatch[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const col of columns) {
      if (col.field.startsWith('__')) continue;
      const val = row[col.field];
      if (val != null && String(val).toLowerCase().includes(q)) {
        matches.push({ rowIndex: i, field: col.field });
      }
    }
  }

  return matches;
}
