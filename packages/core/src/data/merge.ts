// ─── Cell Merge — Auto-merge consecutive cells with same value ────────────────
import type { GridRow, ColumnDef } from '../types';

/**
 * Merge info for a single cell.
 * - rowspan > 1: this cell is the anchor of a merged group
 * - hidden: this cell is part of a merged group but not the anchor (skip rendering)
 */
export interface CellMergeInfo {
  rowspan: number;
  hidden: boolean;
}

/**
 * Map of merge info indexed by [rowIndex][field].
 */
export interface MergeMap {
  [rowIndex: number]: { [field: string]: CellMergeInfo };
}

/**
 * Compute a merge map for columns that have `merge: true`.
 *
 * For each merge-enabled column, scans rows top-to-bottom.
 * Consecutive rows with the same value get merged into one cell
 * (the first occurrence gets rowspan = N, the rest are hidden).
 *
 * @param rows    The display rows (already sorted/filtered)
 * @param columns Column definitions (only those with merge: true are processed)
 * @returns MergeMap with rowspan and hidden info
 */
export function computeMergeMap(rows: GridRow[], columns: ColumnDef[]): MergeMap {
  const mergeColumns = columns.filter(c => c.merge);
  if (mergeColumns.length === 0) return {};

  const map: MergeMap = {};

  for (const col of mergeColumns) {
    const field = col.field;
    let anchorIdx = 0;

    for (let i = 0; i < rows.length; i++) {
      // Initialize entry
      if (!map[i]) map[i] = {};

      if (i === 0) {
        // First row is always an anchor
        map[i][field] = { rowspan: 1, hidden: false };
        anchorIdx = 0;
        continue;
      }

      // Skip internal rows (group headers, subtotals, totals)
      const row = rows[i];
      const prevRow = rows[i - 1];
      if (
        row['__zentto_group__'] || row['__zentto_subtotal__'] || row['__zentto_totals__'] ||
        prevRow['__zentto_group__'] || prevRow['__zentto_subtotal__'] || prevRow['__zentto_totals__']
      ) {
        map[i][field] = { rowspan: 1, hidden: false };
        anchorIdx = i;
        continue;
      }

      const currentVal = row[field];
      const anchorVal = rows[anchorIdx][field];

      // Compare values (stringify for consistent comparison)
      if (stringify(currentVal) === stringify(anchorVal)) {
        // Same value — hide this cell and increase anchor's rowspan
        map[i][field] = { rowspan: 1, hidden: true };
        map[anchorIdx][field].rowspan++;
      } else {
        // Different value — start new anchor
        map[i][field] = { rowspan: 1, hidden: false };
        anchorIdx = i;
      }
    }
  }

  return map;
}

/** Stringify a value for comparison purposes */
function stringify(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
