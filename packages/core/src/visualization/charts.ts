import type { GridRow, ChartConfig } from '../types';

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface DataPoint { label: string; values: number[]; }

function extractData(rows: GridRow[], config: ChartConfig): DataPoint[] {
  return rows.map(row => ({ label: String(row[config.labelField] ?? ''), values: config.valueFields.map(f => Number(row[f]) || 0) }));
}

function escapeXml(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function truncateLabel(label: string, maxLen = 12): string { return label.length > maxLen ? label.slice(0, maxLen - 1) + '\u2026' : label; }

function generateLegend(labels: string[], colors: string[], svgWidth: number, y: number): string {
  let svg = ''; let x = svgWidth / 2 - (labels.length * 60) / 2;
  labels.forEach((label, i) => { const color = colors[i % colors.length]; svg += `<rect x="${x}" y="${y - 8}" width="10" height="10" rx="2" fill="${color}"/><text x="${x + 14}" y="${y}" font-size="10" fill="#6b7280">${escapeXml(label)}</text>`; x += Math.max(label.length * 7 + 24, 60); });
  return svg;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return points.length === 1 ? `M${points[0].x},${points[0].y}` : '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const t = 0.3;
    d += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
  }
  return d;
}

function generateBarChart(data: DataPoint[], config: ChartConfig, colors: string[]): string {
  const w = config.width ?? 600, h = config.height ?? 350;
  const pad = { top: 40, right: 20, bottom: 60, left: 60 };
  const cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
  const maxVal = Math.max(...data.flatMap(d => d.values), 1);
  const sc = config.valueFields.length, gW = cW / Math.max(data.length, 1), bGap = 4;
  const bW = Math.max(4, (gW - bGap * (sc + 1)) / sc);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family:Inter,sans-serif">`;
  if (config.title) svg += `<text x="${w / 2}" y="22" text-anchor="middle" font-size="14" font-weight="600" fill="#1c1e21">${escapeXml(config.title)}</text>`;
  for (let i = 0; i <= 5; i++) { const y = pad.top + cH - (i / 5) * cH; const v = (i / 5) * maxVal; const l = v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v % 1 === 0 ? String(v) : v.toFixed(1); svg += `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/><text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${l}</text>`; }
  data.forEach((dp, i) => { const gX = pad.left + i * gW; dp.values.forEach((val, si) => { const bH = (val / maxVal) * cH; const x = gX + bGap + si * (bW + bGap); svg += `<rect x="${x}" y="${pad.top + cH - bH}" width="${bW}" height="${bH}" rx="3" ry="3" fill="${colors[si % colors.length]}"><title>${escapeXml(dp.label)}: ${val}</title></rect>`; }); const lX = gX + gW / 2, lY = pad.top + cH + 16; if (data.length > 8) svg += `<text x="${lX}" y="${lY}" text-anchor="end" font-size="10" fill="#6b7280" transform="rotate(-45 ${lX} ${lY})">${escapeXml(truncateLabel(dp.label))}</text>`; else svg += `<text x="${lX}" y="${lY}" text-anchor="middle" font-size="10" fill="#6b7280">${escapeXml(truncateLabel(dp.label))}</text>`; });
  svg += `<line x1="${pad.left}" y1="${pad.top + cH}" x2="${w - pad.right}" y2="${pad.top + cH}" stroke="#d1d5db" stroke-width="1"/>`;
  if (sc > 1) svg += generateLegend(config.valueFields, colors, w, h - 10);
  return svg + '</svg>';
}

function generateLineChart(data: DataPoint[], config: ChartConfig, colors: string[], filled = false): string {
  const w = config.width ?? 600, h = config.height ?? 350;
  const pad = { top: 40, right: 20, bottom: 60, left: 60 };
  const cW = w - pad.left - pad.right, cH = h - pad.top - pad.bottom;
  const maxVal = Math.max(...data.flatMap(d => d.values), 1);
  const sc = config.valueFields.length;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family:Inter,sans-serif">`;
  if (config.title) svg += `<text x="${w / 2}" y="22" text-anchor="middle" font-size="14" font-weight="600" fill="#1c1e21">${escapeXml(config.title)}</text>`;
  for (let i = 0; i <= 5; i++) { const y = pad.top + cH - (i / 5) * cH; const v = (i / 5) * maxVal; const l = v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v % 1 === 0 ? String(v) : v.toFixed(1); svg += `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/><text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${l}</text>`; }
  for (let si = 0; si < sc; si++) { const color = colors[si % colors.length]; const pts = data.map((dp, i) => ({ x: pad.left + (i / Math.max(data.length - 1, 1)) * cW, y: pad.top + cH - (dp.values[si] / maxVal) * cH })); if (pts.length < 2) continue; const pathD = buildSmoothPath(pts); if (filled) svg += `<path d="${pathD} L${pts[pts.length - 1].x},${pad.top + cH} L${pts[0].x},${pad.top + cH} Z" fill="${color}" fill-opacity="0.15"/>`; svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`; pts.forEach((p, i) => { svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#fff" stroke-width="2"><title>${escapeXml(data[i].label)}: ${data[i].values[si]}</title></circle>`; }); }
  data.forEach((dp, i) => { const x = pad.left + (i / Math.max(data.length - 1, 1)) * cW, y = pad.top + cH + 16; if (data.length > 8) svg += `<text x="${x}" y="${y}" text-anchor="end" font-size="10" fill="#6b7280" transform="rotate(-45 ${x} ${y})">${escapeXml(truncateLabel(dp.label))}</text>`; else svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#6b7280">${escapeXml(truncateLabel(dp.label))}</text>`; });
  svg += `<line x1="${pad.left}" y1="${pad.top + cH}" x2="${w - pad.right}" y2="${pad.top + cH}" stroke="#d1d5db" stroke-width="1"/>`;
  if (sc > 1) svg += generateLegend(config.valueFields, colors, w, h - 10);
  return svg + '</svg>';
}

function generatePieChart(data: DataPoint[], config: ChartConfig, colors: string[], donut = false): string {
  const w = config.width ?? 400, h = config.height ?? 350, cx = w * 0.4, cy = h / 2;
  const r = Math.min(cx - 20, cy - 40), innerR = donut ? r * 0.55 : 0;
  const values = data.map(d => Math.max(0, d.values[0] ?? 0));
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family:Inter,sans-serif">`;
  if (config.title) svg += `<text x="${w / 2}" y="22" text-anchor="middle" font-size="14" font-weight="600" fill="#1c1e21">${escapeXml(config.title)}</text>`;
  let cum = -Math.PI / 2;
  data.forEach((dp, i) => { const pct = values[i] / total, ang = pct * 2 * Math.PI, sa = cum, ea = cum + ang; cum = ea; const la = ang > Math.PI ? 1 : 0, c = colors[i % colors.length]; const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa), x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea); let d: string; if (donut) { const ix1 = cx + innerR * Math.cos(sa), iy1 = cy + innerR * Math.sin(sa), ix2 = cx + innerR * Math.cos(ea), iy2 = cy + innerR * Math.sin(ea); d = `M${x1},${y1} A${r},${r} 0 ${la} 1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 ${la} 0 ${ix1},${iy1} Z`; } else { d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${la} 1 ${x2},${y2} Z`; } svg += `<path d="${d}" fill="${c}" stroke="#fff" stroke-width="2"><title>${escapeXml(dp.label)}: ${values[i]} (${(pct * 100).toFixed(1)}%)</title></path>`; if (pct > 0.05) { const ma = sa + ang / 2, lr = donut ? (r + innerR) / 2 : r * 0.65; svg += `<text x="${cx + lr * Math.cos(ma)}" y="${cy + lr * Math.sin(ma)}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#fff">${(pct * 100).toFixed(0)}%</text>`; } });
  if (donut) svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="10" fill="#6b7280">Total</text><text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="16" font-weight="700" fill="#1c1e21">${total >= 1000 ? (total / 1000).toFixed(1) + 'K' : String(Math.round(total))}</text>`;
  const lx = w * 0.72, lsy = Math.max(50, cy - (data.length * 22) / 2);
  data.forEach((dp, i) => { const ly = lsy + i * 22, c = colors[i % colors.length]; svg += `<rect x="${lx}" y="${ly - 6}" width="12" height="12" rx="2" fill="${c}"/><text x="${lx + 18}" y="${ly + 4}" font-size="11" fill="#374151">${escapeXml(truncateLabel(dp.label, 16))} (${((values[i] / total) * 100).toFixed(1)}%)</text>`; });
  return svg + '</svg>';
}

export function generateChartSvg(rows: GridRow[], config: ChartConfig): string {
  const colors = config.colors ?? DEFAULT_COLORS;
  const data = extractData(rows, config);
  if (data.length === 0) { const w = config.width ?? 600, h = config.height ?? 350; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="14" fill="#9ca3af">No data</text></svg>`; }
  switch (config.type) { case 'bar': return generateBarChart(data, config, colors); case 'line': return generateLineChart(data, config, colors, false); case 'area': return generateLineChart(data, config, colors, true); case 'pie': return generatePieChart(data, config, colors, false); case 'donut': return generatePieChart(data, config, colors, true); default: return generateBarChart(data, config, colors); }
}

export function detectNumericFields(rows: GridRow[]): string[] {
  if (rows.length === 0) return [];
  const sample = rows.slice(0, 10);
  return Object.keys(rows[0]).filter(key => { if (key.startsWith('__')) return false; return sample.every(r => { const v = r[key]; return v != null && !isNaN(Number(v)); }); });
}
