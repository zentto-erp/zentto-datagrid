import type { GridRow, ColumnDef } from '../types';

/**
 * Export rows to a Markdown table string.
 */
export function toMarkdown(rows: GridRow[], columns: ColumnDef[]): string {
  const visibleCols = columns.filter((c) => !c.field.startsWith('__'));
  const header = `| ${visibleCols.map((c) => c.header || c.field).join(' | ')} |`;
  const separator = `| ${visibleCols.map((c) => c.type === 'number' || c.currency ? '---:' : ':---').join(' | ')} |`;
  const body = rows.map((row) =>
    `| ${visibleCols.map((c) => String(row[c.field] ?? '')).join(' | ')} |`
  ).join('\n');
  return `${header}\n${separator}\n${body}`;
}

/**
 * Download Markdown as a file.
 */
export function downloadMarkdown(rows: GridRow[], columns: ColumnDef[], filename = 'export'): void {
  const md = toMarkdown(rows, columns);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
