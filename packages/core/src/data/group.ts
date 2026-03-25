import type { GridRow, ColumnDef, RowGroupingConfig, SortDirection } from '../types';
import { aggregate } from './aggregate';

export interface GroupedResult {
  rows: GridRow[];
  groups: Map<string, GridRow[]>;
}

/**
 * Group rows by a field. Returns flat array with group header rows injected.
 */
export function groupRows(
  rows: GridRow[],
  config: RowGroupingConfig,
  columns: ColumnDef[]
): GridRow[] {
  const { field, showSubtotals = false, sortGroups = null } = config;

  // Group by field value
  const groups = new Map<string, GridRow[]>();
  for (const row of rows) {
    const key = String(row[field] ?? '(vacio)');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  // Sort group keys
  let keys = Array.from(groups.keys());
  if (sortGroups) {
    keys.sort((a, b) => {
      const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' });
      return sortGroups === 'desc' ? -cmp : cmp;
    });
  }

  // Build flat array with group headers
  const result: GridRow[] = [];
  for (const key of keys) {
    const groupRows = groups.get(key)!;

    // Group header row
    const header: GridRow = {
      __zentto_group__: true,
      __zentto_group_field__: field,
      __zentto_group_value__: key,
      __zentto_group_count__: groupRows.length,
      id: `__group_${key}`,
      [field]: `${key} (${groupRows.length})`,
    };
    result.push(header);
    result.push(...groupRows);

    // Subtotals
    if (showSubtotals) {
      const subtotal: GridRow = {
        __zentto_subtotal__: true,
        id: `__subtotal_${key}`,
      };
      for (const col of columns) {
        if (col.aggregation) {
          subtotal[col.field] = aggregate(groupRows, col.field, col.aggregation);
        }
      }
      subtotal[field] = `Subtotal ${key}`;
      result.push(subtotal);
    }
  }

  return result;
}
