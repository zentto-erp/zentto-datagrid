import type { GridRow, ColumnDef } from '../types';

/**
 * Copy rows to clipboard as tab-separated text.
 */
export async function copyToClipboard(rows: GridRow[], columns: ColumnDef[]): Promise<boolean> {
  const visibleCols = columns.filter((c) => !c.field.startsWith('__'));
  const header = visibleCols.map((c) => c.header || c.field).join('\t');
  const lines = rows.map((row) =>
    visibleCols.map((c) => String(row[c.field] ?? '')).join('\t')
  );
  const text = [header, ...lines].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}

/**
 * Copy a single cell value to clipboard.
 */
export async function copyCellValue(value: unknown): Promise<boolean> {
  const text = value != null ? String(value) : '';
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
