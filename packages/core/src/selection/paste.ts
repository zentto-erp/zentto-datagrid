/**
 * Parse tab-separated clipboard data (from Excel, Google Sheets, etc.)
 * into a 2D array of cell values.
 */

export interface PasteData {
  values: string[][];
  rows: number;
  cols: number;
}

/**
 * Parse clipboard text into structured paste data.
 * Handles tab-separated (Excel) and comma-separated (CSV) formats.
 */
export function parseClipboardData(text: string): PasteData {
  if (!text || !text.trim()) {
    return { values: [], rows: 0, cols: 0 };
  }

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into lines, remove trailing empty line
  let lines = normalized.split('\n');
  if (lines[lines.length - 1]?.trim() === '') lines.pop();

  // Detect delimiter: tabs (Excel) vs commas (CSV)
  const hasTab = lines[0]?.includes('\t');
  const delimiter = hasTab ? '\t' : ',';

  const values: string[][] = [];
  for (const line of lines) {
    if (delimiter === ',') {
      // CSV-aware parsing (handles quoted fields)
      values.push(parseCsvLine(line));
    } else {
      values.push(line.split('\t'));
    }
  }

  const rows = values.length;
  const cols = Math.max(0, ...values.map(r => r.length));

  // Pad shorter rows
  for (const row of values) {
    while (row.length < cols) row.push('');
  }

  return { values, rows, cols };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

/**
 * Apply paste data to grid rows starting at anchor position.
 * Returns the list of changes for undo support.
 */
export function applyPasteData(
  rows: Record<string, unknown>[],
  columns: { field: string; type?: string }[],
  pasteData: PasteData,
  anchorRow: number,
  anchorCol: number
): Array<{ rowKey: string; rowIndex: number; field: string; oldValue: unknown; newValue: unknown }> {
  const changes: Array<{ rowKey: string; rowIndex: number; field: string; oldValue: unknown; newValue: unknown }> = [];

  for (let r = 0; r < pasteData.rows; r++) {
    const rowIdx = anchorRow + r;
    if (rowIdx >= rows.length) break;
    const row = rows[rowIdx];

    for (let c = 0; c < pasteData.cols; c++) {
      const colIdx = anchorCol + c;
      if (colIdx >= columns.length) break;
      const col = columns[colIdx];
      const rawValue = pasteData.values[r][c];

      // Auto-convert based on column type
      let newValue: unknown = rawValue;
      if (col.type === 'number' && rawValue !== '') {
        const num = Number(rawValue.replace(/[,$]/g, ''));
        if (!isNaN(num)) newValue = num;
      } else if (col.type === 'boolean') {
        newValue = ['true', '1', 'yes', 'si', 'sí'].includes(rawValue.toLowerCase());
      }

      const oldValue = row[col.field];
      row[col.field] = newValue;

      changes.push({
        rowKey: String(row['id'] ?? rowIdx),
        rowIndex: rowIdx,
        field: col.field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}
