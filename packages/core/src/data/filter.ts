import type { GridRow, FilterRule } from '../types';

/**
 * Apply filter rules to rows. All rules are AND-combined.
 */
export function filterRows(rows: GridRow[], rules: FilterRule[]): GridRow[] {
  if (!rules.length) return rows;
  return rows.filter((row) => rules.every((rule) => matchesRule(row, rule)));
}

function matchesRule(row: GridRow, rule: FilterRule): boolean {
  const val = row[rule.field];
  const target = rule.value;

  switch (rule.operator) {
    case 'contains':
      return val != null && String(val).toLowerCase().includes(String(target).toLowerCase());

    case 'notContains':
      return val == null || !String(val).toLowerCase().includes(String(target).toLowerCase());

    case 'equals':
      if (val == null && target == null) return true;
      return String(val).toLowerCase() === String(target).toLowerCase();

    case 'notEquals':
      return String(val).toLowerCase() !== String(target).toLowerCase();

    case 'startsWith':
      return val != null && String(val).toLowerCase().startsWith(String(target).toLowerCase());

    case 'endsWith':
      return val != null && String(val).toLowerCase().endsWith(String(target).toLowerCase());

    case 'gt':
      return Number(val) > Number(target);

    case 'gte':
      return Number(val) >= Number(target);

    case 'lt':
      return Number(val) < Number(target);

    case 'lte':
      return Number(val) <= Number(target);

    case 'isEmpty':
      return val == null || val === '';

    case 'isNotEmpty':
      return val != null && val !== '';

    case 'between': {
      const [lo, hi] = Array.isArray(target) ? target : [0, 0];
      const n = Number(val);
      return n >= Number(lo) && n <= Number(hi);
    }

    case 'inList': {
      const list = Array.isArray(target) ? target : [];
      return list.some((t) => String(val).toLowerCase() === String(t).toLowerCase());
    }

    default:
      return true;
  }
}

/**
 * Quick search across all fields (like Ctrl+F / toolbar search).
 */
export function quickSearch(rows: GridRow[], query: string, fields?: string[]): GridRow[] {
  if (!query || query.length < 2) return rows;
  const q = query.toLowerCase();

  return rows.filter((row) => {
    const searchFields = fields ?? Object.keys(row);
    return searchFields.some((f) => {
      const v = row[f];
      return v != null && String(v).toLowerCase().includes(q);
    });
  });
}
