import type { GridRow, ColumnDef, PivotConfig, AggregationType } from '../types';
import { aggregate } from './aggregate';

export interface PivotResult {
  rows: GridRow[];
  columns: ColumnDef[];
}

/**
 * Transform flat rows into a pivot table.
 * Rows become unique values of rowField, columns become unique values of columnField,
 * cells contain the aggregated valueField.
 */
export function pivotRows(rows: GridRow[], config: PivotConfig): PivotResult {
  const { rowField, columnField, valueField, aggregation = 'sum', showGrandTotals = false, showRowTotals = false } = config;

  // Collect unique column values
  const colValues = new Set<string>();
  for (const row of rows) {
    colValues.add(String(row[columnField] ?? ''));
  }
  const sortedColValues = Array.from(colValues).sort();

  // Group by rowField + columnField
  const buckets = new Map<string, Map<string, GridRow[]>>();
  for (const row of rows) {
    const rk = String(row[rowField] ?? '');
    const ck = String(row[columnField] ?? '');
    if (!buckets.has(rk)) buckets.set(rk, new Map());
    const colMap = buckets.get(rk)!;
    if (!colMap.has(ck)) colMap.set(ck, []);
    colMap.get(ck)!.push(row);
  }

  // Build pivot rows
  const pivotRows: GridRow[] = [];
  const rowKeys = Array.from(buckets.keys()).sort();

  for (const rk of rowKeys) {
    const colMap = buckets.get(rk)!;
    const pivotRow: GridRow = { id: `pivot_${rk}`, [rowField]: rk };

    let rowTotal = 0;
    for (const cv of sortedColValues) {
      const cellRows = colMap.get(cv) ?? [];
      const val = aggregate(cellRows, valueField, aggregation);
      pivotRow[cv] = val;
      rowTotal += val;
    }

    if (showRowTotals) {
      pivotRow['__total__'] = rowTotal;
    }

    pivotRows.push(pivotRow);
  }

  // Grand totals
  if (showGrandTotals) {
    const grandRow: GridRow = { id: '__grand_total__', [rowField]: 'TOTAL', __zentto_totals__: true };
    let grandTotal = 0;
    for (const cv of sortedColValues) {
      const allForCol = rows.filter((r) => String(r[columnField] ?? '') === cv);
      const val = aggregate(allForCol, valueField, aggregation);
      grandRow[cv] = val;
      grandTotal += val;
    }
    if (showRowTotals) grandRow['__total__'] = grandTotal;
    pivotRows.push(grandRow);
  }

  // Build pivot columns
  const pivotColumns: ColumnDef[] = [
    { field: rowField, header: rowField, sortable: true, width: 200 },
    ...sortedColValues.map((cv) => ({
      field: cv,
      header: cv || '(vacio)',
      type: 'number' as const,
      sortable: true,
      width: 130,
    })),
  ];

  if (showRowTotals) {
    pivotColumns.push({
      field: '__total__',
      header: 'Total',
      type: 'number',
      sortable: true,
      width: 130,
    });
  }

  return { rows: pivotRows, columns: pivotColumns };
}
