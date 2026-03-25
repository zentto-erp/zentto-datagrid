import type { GridRow, SortEntry } from '../types';

/**
 * Sort rows by multiple fields. Stable sort (preserves insertion order for equal values).
 */
export function sortRows(rows: GridRow[], sorts: SortEntry[]): GridRow[] {
  if (!sorts.length) return rows;

  return [...rows].sort((a, b) => {
    for (const { field, direction } of sorts) {
      const av = a[field];
      const bv = b[field];
      const dir = direction === 'desc' ? -1 : 1;

      if (av == null && bv == null) continue;
      if (av == null) return 1 * dir;
      if (bv == null) return -1 * dir;

      // Number comparison
      if (typeof av === 'number' && typeof bv === 'number') {
        if (av !== bv) return (av - bv) * dir;
        continue;
      }

      // Date comparison
      if (av instanceof Date && bv instanceof Date) {
        const diff = av.getTime() - bv.getTime();
        if (diff !== 0) return diff * dir;
        continue;
      }

      // String comparison (locale-aware)
      const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
      if (cmp !== 0) return cmp * dir;
    }
    return 0;
  });
}
