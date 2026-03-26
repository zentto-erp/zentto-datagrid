import type { GridRow, AggregationType, ColumnDef } from '../types';

/**
 * Compute a single aggregation over a numeric field.
 */
export function aggregate(rows: GridRow[], field: string, fn: AggregationType): number {
  const values = rows.map((r) => Number(r[field]) || 0);
  if (values.length === 0) return 0;

  switch (fn) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.filter((v) => v !== 0).length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

/**
 * Compute totals row for all columns that have an `aggregation` defined.
 */
const AGG_LABELS: Record<AggregationType, string> = { sum: '\u03a3', avg: '\u00d8', count: '#', min: 'Min', max: 'Max' };

export function computeTotals(
  rows: GridRow[],
  columns: ColumnDef[],
  label = 'Totales'
): GridRow {
  const totals: GridRow = { __zentto_totals__: true, id: '__totals__' };
  const labels: Record<string, string> = {};
  const labelCol = columns.find((c) => c.type !== 'number' && !c.aggregation);
  if (labelCol) totals[labelCol.field] = label;
  for (const col of columns) {
    if (col.aggregation) {
      totals[col.field] = aggregate(rows, col.field, col.aggregation);
      labels[col.field] = col.aggregationLabel ?? AGG_LABELS[col.aggregation] ?? '';
    }
  }
  totals['__zentto_agg_labels__'] = labels;
  return totals;
}
