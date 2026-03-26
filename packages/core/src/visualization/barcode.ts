// ═══════════════════════════════════════════════════════════════
// QR Code + Barcode generators
// QR: uses qrcode-generator (proven, scannable, 2KB)
// Barcode: Code 128 (native implementation)
// ═══════════════════════════════════════════════════════════════

import qrGenerator from 'qrcode-generator';

/**
 * Generate a scannable QR code as inline SVG string.
 * Uses qrcode-generator library for correct ISO 18004 encoding.
 */
export function generateQrSvg(data: string, size = 60): string {
  if (!data) return '';
  try {
    const qr = qrGenerator(0, 'L'); // Auto version, Error Correction Level L
    qr.addData(data);
    qr.make();

    const modules = qr.getModuleCount();
    const quiet = 4;
    const total = modules + quiet * 2;
    const cs = size / total;

    let rects = `<rect width="${size}" height="${size}" fill="#fff"/>`;
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (qr.isDark(y, x)) {
          rects += `<rect x="${((x + quiet) * cs).toFixed(2)}" y="${((y + quiet) * cs).toFixed(2)}" width="${(cs + 0.4).toFixed(2)}" height="${(cs + 0.4).toFixed(2)}" fill="#000"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects}</svg>`;
  } catch {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><text x="4" y="${size / 2}" font-size="8" fill="#999">QR Error</text></svg>`;
  }
}

// ═══════════════════════════════════════════════════════════════
// Code 128 barcode generator (scannable)
// ═══════════════════════════════════════════════════════════════

const C128: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],
];

function enc128B(text: string): number[] {
  const v: number[] = [104];
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); v.push(c < 32 || c > 127 ? 0 : c - 32); }
  let cs = 104; for (let i = 1; i < v.length; i++) cs += i * v[i];
  v.push(cs % 103); v.push(106); return v;
}

export function generateBarcodeSvg(data: string, type: 'code128' | 'ean13' | 'code39', width = 120, height = 32): string {
  if (!data) return '';
  const vals = enc128B(data);
  let tm = 20;
  for (const v of vals) { const p = C128[v]; if (p) for (const w of p) tm += w; }
  const mw = width / tm;
  let bars = '', x = 10 * mw;
  for (const v of vals) { const p = C128[v]; if (!p) continue;
    for (let i = 0; i < p.length; i++) { const w = p[i] * mw; if (i % 2 === 0) bars += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="#000"/>`; x += w; }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${bars}</svg>`;
}
