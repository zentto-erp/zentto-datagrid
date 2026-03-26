import type { GridRow, ColumnDef, PrintOptions } from '../types';
import { computeTotals } from '../data/aggregate';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generatePrintHtml(rows: GridRow[], columns: ColumnDef[], options: PrintOptions = {}): string {
  const { title = '', orientation = columns.length > 5 ? 'landscape' : 'portrait', showTotals = false, headerRepeat = true, fontSize = 11, pageSize = 'A4' } = options;
  const visibleCols = columns.filter(c => !c.field.startsWith('__') && c.type !== 'actions');
  const fmt = (val: unknown, col: ColumnDef): string => {
    if (val == null || val === '') return '';
    if (col.type === 'boolean') return val ? '\u2713' : '\u2717';
    if (col.type === 'number' || col.currency) { const n = Number(val); return isNaN(n) ? String(val) : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    return String(val);
  };
  let totalsRow: GridRow | null = null;
  if (showTotals) totalsRow = computeTotals(rows, columns);
  const pageW = pageSize === 'A4' ? '210mm' : '8.5in', pageH = pageSize === 'A4' ? '297mm' : '11in';
  const sizeDecl = orientation === 'landscape' ? `${pageH} ${pageW}` : `${pageW} ${pageH}`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><title>${escapeHtml(title || 'Zentto Grid')}</title>
<style>@page{size:${sizeDecl};margin:12mm 10mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:${fontSize}px;color:#1c1e21;-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;border-bottom:2px solid #e67e22;padding-bottom:8px}.print-title{font-size:${fontSize + 4}px;font-weight:700}.print-meta{font-size:${fontSize - 2}px;color:#6b7280}table{width:100%;border-collapse:collapse;page-break-inside:auto}thead{${headerRepeat ? 'display:table-header-group' : ''}}tr{page-break-inside:avoid}th{background:#f7f8fa;font-weight:600;font-size:${fontSize - 1}px;text-transform:uppercase;letter-spacing:.03em;padding:6px 8px;border:1px solid #d1d5db;text-align:left;white-space:nowrap}th.right{text-align:right}td{padding:5px 8px;border:1px solid #e5e7eb;vertical-align:top;word-break:break-word}td.right{text-align:right;font-variant-numeric:tabular-nums}tr:nth-child(even) td{background:#fafbfc}.totals-row td{background:#f7f8fa!important;font-weight:700;border-top:2px solid #d1d5db}.row-num{width:32px;text-align:center;color:#9ca3af;font-size:${fontSize - 2}px}@media print{body{margin:0}.no-print{display:none}}@media screen{body{max-width:960px;margin:20px auto;padding:0 16px}.print-btn{position:fixed;top:16px;right:16px;background:#e67e22;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;z-index:100;box-shadow:0 4px 14px rgba(0,0,0,.15)}.print-btn:hover{opacity:.9}}</style>
</head><body><button class="print-btn no-print" onclick="window.print()">Imprimir / Print</button>
<div class="print-header"><div class="print-title">${escapeHtml(title || 'Zentto Grid')}</div><div class="print-meta">${rows.length} registros &middot; ${new Date().toLocaleDateString()}</div></div>
<table><thead><tr><th class="row-num">#</th>${visibleCols.map(col => `<th class="${col.type === 'number' || col.currency ? 'right' : ''}">${escapeHtml(col.header || col.field)}</th>`).join('')}</tr></thead>
<tbody>${rows.map((row, idx) => `<tr><td class="row-num">${idx + 1}</td>${visibleCols.map(col => `<td class="${col.type === 'number' || col.currency ? 'right' : ''}">${escapeHtml(fmt(row[col.field], col))}</td>`).join('')}</tr>`).join('')}${totalsRow ? `<tr class="totals-row"><td class="row-num"></td>${visibleCols.map(col => `<td class="${col.type === 'number' || col.currency ? 'right' : ''}">${escapeHtml(fmt(totalsRow![col.field], col))}</td>`).join('')}</tr>` : ''}</tbody></table>
<script>if(window.opener||window!==window.top){window.addEventListener('load',()=>setTimeout(()=>window.print(),300));}</script></body></html>`;
}
