// ─── Batch Edit — Apply changes to multiple cells at once ─────────────────────

import type { GridRow } from '../types';

/** A single cell change in a batch operation */
export interface BatchChange {
  rowKey: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Apply batch edits to rows. Returns a new array with changes applied.
 * @param rows - Source row data
 * @param changes - Array of cell changes
 * @param keyFn - Function to extract a unique key from a row
 */
export function applyBatchEdit(
  rows: GridRow[],
  changes: BatchChange[],
  keyFn: (row: GridRow) => string,
): GridRow[] {
  // Index changes by rowKey → field → newValue for O(1) lookup
  const changeMap = new Map<string, Map<string, unknown>>();
  for (const c of changes) {
    let fieldMap = changeMap.get(c.rowKey);
    if (!fieldMap) {
      fieldMap = new Map();
      changeMap.set(c.rowKey, fieldMap);
    }
    fieldMap.set(c.field, c.newValue);
  }

  return rows.map(row => {
    const key = keyFn(row);
    const fieldMap = changeMap.get(key);
    if (!fieldMap) return row;
    const updated = { ...row };
    for (const [field, value] of fieldMap) {
      updated[field] = value;
    }
    return updated;
  });
}
