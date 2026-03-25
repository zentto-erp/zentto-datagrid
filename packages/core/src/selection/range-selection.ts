/**
 * Excel-like range selection model.
 * Tracks anchor cell, current cell, and computed selection rectangle.
 */

export interface CellAddress {
  rowIndex: number;
  colIndex: number;
}

export interface SelectionRange {
  start: CellAddress;
  end: CellAddress;
}

export interface NormalizedRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export function normalizeRange(range: SelectionRange): NormalizedRange {
  return {
    startRow: Math.min(range.start.rowIndex, range.end.rowIndex),
    endRow: Math.max(range.start.rowIndex, range.end.rowIndex),
    startCol: Math.min(range.start.colIndex, range.end.colIndex),
    endCol: Math.max(range.start.colIndex, range.end.colIndex),
  };
}

export function isCellInRange(rowIndex: number, colIndex: number, range: NormalizedRange): boolean {
  return (
    rowIndex >= range.startRow &&
    rowIndex <= range.endRow &&
    colIndex >= range.startCol &&
    colIndex <= range.endCol
  );
}

export function getRangeSize(range: NormalizedRange): { rows: number; cols: number } {
  return {
    rows: range.endRow - range.startRow + 1,
    cols: range.endCol - range.startCol + 1,
  };
}

/**
 * Extract cell values from a range.
 */
export function extractRangeData(
  rows: Record<string, unknown>[],
  columns: { field: string }[],
  range: NormalizedRange
): unknown[][] {
  const result: unknown[][] = [];
  for (let r = range.startRow; r <= range.endRow; r++) {
    const row = rows[r];
    if (!row) continue;
    const rowData: unknown[] = [];
    for (let c = range.startCol; c <= range.endCol; c++) {
      const col = columns[c];
      rowData.push(col ? row[col.field] ?? '' : '');
    }
    result.push(rowData);
  }
  return result;
}

/**
 * Copy range to clipboard as tab-separated text (Excel-compatible).
 */
export async function copyRangeToClipboard(
  rows: Record<string, unknown>[],
  columns: { field: string; header?: string }[],
  range: NormalizedRange
): Promise<boolean> {
  const data = extractRangeData(rows, columns, range);
  const text = data.map(row => row.map(v => String(v ?? '')).join('\t')).join('\n');
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
