// ═══════════════════════════════════════════════════════════════
// QR Code generator — real, scannable QR codes (ISO 18004)
// Supports byte mode, versions 1-6, error correction L
// ═══════════════════════════════════════════════════════════════

// GF(256) with polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = v;
    GF_LOG[v] = i;
    v = (v << 1) ^ (v >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenPoly(nsym: number): Uint8Array {
  let g = new Uint8Array([1]);
  for (let i = 0; i < nsym; i++) {
    const ng = new Uint8Array(g.length + 1);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= g[j];
      ng[j + 1] ^= gfMul(g[j], GF_EXP[i]);
    }
    g = ng;
  }
  return g;
}

function rsEncode(data: Uint8Array, nsym: number): Uint8Array {
  const gen = rsGenPoly(nsym);
  const out = new Uint8Array(data.length + nsym);
  out.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = out[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        out[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return out.slice(data.length);
}

// QR Version parameters [version] = { size, dataCW (byte mode capacity for L), ecCWperBlock, numBlocks }
// Values from QR standard tables for Error Correction Level L
interface VersionInfo { size: number; dataCW: number; ecCW: number; blocks: number; maxBytes: number; }
const VERSIONS: VersionInfo[] = [
  { size: 0, dataCW: 0, ecCW: 0, blocks: 0, maxBytes: 0 },
  { size: 21, dataCW: 19, ecCW: 7, blocks: 1, maxBytes: 17 },   // v1
  { size: 25, dataCW: 34, ecCW: 10, blocks: 1, maxBytes: 32 },  // v2
  { size: 29, dataCW: 55, ecCW: 15, blocks: 1, maxBytes: 53 },  // v3
  { size: 33, dataCW: 80, ecCW: 20, blocks: 1, maxBytes: 78 },  // v4
  { size: 37, dataCW: 108, ecCW: 26, blocks: 1, maxBytes: 106 }, // v5
  { size: 41, dataCW: 136, ecCW: 18, blocks: 2, maxBytes: 134 }, // v6
];

function chooseVersion(dataLen: number): number {
  for (let v = 1; v <= 6; v++) {
    if (dataLen <= VERSIONS[v].maxBytes) return v;
  }
  return 6;
}

// Bitstream helper for encoding data
class BitStream {
  private bits: number[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i--) this.bits.push((value >> i) & 1);
  }
  getBytes(totalBytes: number): Uint8Array {
    const result = new Uint8Array(totalBytes);
    for (let i = 0; i < totalBytes * 8 && i < this.bits.length; i++) {
      if (this.bits[i]) result[i >> 3] |= (0x80 >> (i & 7));
    }
    return result;
  }
  get length() { return this.bits.length; }
}

function encodeData(data: string, version: number): Uint8Array {
  const vi = VERSIONS[version];
  const bytes = new TextEncoder().encode(data);
  const len = Math.min(bytes.length, vi.maxBytes);
  const bs = new BitStream();

  // Mode indicator: 0100 (byte mode)
  bs.put(0b0100, 4);
  // Character count (8 bits for v1-9)
  bs.put(len, 8);
  // Data bytes
  for (let i = 0; i < len; i++) bs.put(bytes[i], 8);
  // Terminator (up to 4 zeros)
  const terminatorLen = Math.min(4, vi.dataCW * 8 - bs.length);
  bs.put(0, terminatorLen);
  // Pad to byte boundary
  while (bs.length % 8 !== 0) bs.put(0, 1);

  const buf = bs.getBytes(vi.dataCW);

  // Fill remaining with 0xEC, 0x11 padding
  let pi = Math.ceil(bs.length / 8);
  let pad = 0xEC;
  while (pi < vi.dataCW) { buf[pi++] = pad; pad = pad === 0xEC ? 0x11 : 0xEC; }

  return buf;
}

function addECC(dataCW: Uint8Array, version: number): Uint8Array {
  const vi = VERSIONS[version];
  const ecCW = vi.ecCW;
  const nBlocks = vi.blocks;
  const blockSize = Math.floor(dataCW.length / nBlocks);

  const allData: Uint8Array[] = [];
  const allEC: Uint8Array[] = [];

  for (let b = 0; b < nBlocks; b++) {
    const start = b * blockSize;
    const end = b === nBlocks - 1 ? dataCW.length : start + blockSize;
    const block = dataCW.slice(start, end);
    allData.push(block);
    allEC.push(rsEncode(block, ecCW));
  }

  // Interleave data blocks then EC blocks
  const result: number[] = [];
  const maxDataLen = Math.max(...allData.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of allData) {
      if (i < block.length) result.push(block[i]);
    }
  }
  for (let i = 0; i < ecCW; i++) {
    for (const block of allEC) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return new Uint8Array(result);
}

// Alignment pattern positions per version
const ALIGN: number[][] = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

function createMatrix(version: number): { matrix: number[][]; reserved: boolean[][] } {
  const size = VERSIONS[version].size;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (7x7)
  function finderPattern(r: number, c: number) {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
      const inOuter = dr === -1 || dr === 7 || dc === -1 || dc === 7;
      const inBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      matrix[rr][cc] = (inBorder || inInner) && !inOuter ? 1 : 0;
      reserved[rr][cc] = true;
    }
  }
  finderPattern(0, 0);
  finderPattern(0, size - 7);
  finderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0; reserved[6][i] = true;
    matrix[i][6] = i % 2 === 0 ? 1 : 0; reserved[i][6] = true;
  }

  // Alignment patterns
  if (version >= 2) {
    const pos = ALIGN[version];
    for (const r of pos) for (const c of pos) {
      if ((r < 9 && c < 9) || (r < 9 && c > size - 9) || (r > size - 9 && c < 9)) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        const rr = r + dr, cc = c + dc;
        matrix[rr][cc] = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
        reserved[rr][cc] = true;
      }
    }
  }

  // Dark module
  matrix[size - 8][8] = 1; reserved[size - 8][8] = true;

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (i < size) { reserved[8][i] = true; reserved[i][8] = true; }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 8 + i] = true;
    reserved[size - 8 + i][8] = true;
  }

  return { matrix, reserved };
}

function placeData(matrix: number[][], reserved: boolean[][], codewords: Uint8Array) {
  const size = matrix.length;
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // Skip timing pattern column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0 || reserved[row][c]) continue;
        if (bitIdx < totalBits) {
          const byteIdx = bitIdx >> 3;
          const bitPos = 7 - (bitIdx & 7);
          matrix[row][c] = (codewords[byteIdx] >> bitPos) & 1;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }
}

function applyMask(matrix: number[][], reserved: boolean[][], maskId: number): number[][] {
  const size = matrix.length;
  const result = matrix.map(r => [...r]);
  const maskFn = (r: number, c: number): boolean => {
    switch (maskId) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2 + (r * c) % 3) === 0;
      case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
      case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
      default: return false;
    }
  };
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!reserved[r][c] && maskFn(r, c)) result[r][c] ^= 1;
  }
  return result;
}

// Format info bits for ECC Level L and mask patterns 0-7
const FORMAT_BITS = [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976];

function placeFormatInfo(matrix: number[][], maskId: number) {
  const size = matrix.length;
  const bits = FORMAT_BITS[maskId];
  // Around top-left finder
  const positions1 = [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]];
  for (let i = 0; i < 15; i++) {
    const [r, c] = positions1[i];
    matrix[r][c] = (bits >> (14 - i)) & 1;
  }
  // Along top-right and bottom-left finders
  for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = (bits >> (14 - i)) & 1;
  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = (bits >> (6 - i)) & 1;
}

function scoreMask(matrix: number[][]): number {
  const size = matrix.length;
  let score = 0;
  // Penalty 1: consecutive same-color modules in rows/cols
  for (let r = 0; r < size; r++) {
    let cnt = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) { cnt++; } else { if (cnt >= 5) score += cnt - 2; cnt = 1; }
    }
    if (cnt >= 5) score += cnt - 2;
  }
  for (let c = 0; c < size; c++) {
    let cnt = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) { cnt++; } else { if (cnt >= 5) score += cnt - 2; cnt = 1; }
    }
    if (cnt >= 5) score += cnt - 2;
  }
  return score;
}

export function generateQrSvg(data: string, size = 60): string {
  if (!data) return '';
  const version = chooseVersion(data.length);
  const dataCW = encodeData(data, version);
  const allCW = addECC(dataCW, version);

  const { matrix, reserved } = createMatrix(version);
  placeData(matrix, reserved, allCW);

  // Try all 8 masks and pick best
  let bestMask = 0, bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    const masked = applyMask(matrix, reserved, m);
    const s = scoreMask(masked);
    if (s < bestScore) { bestScore = s; bestMask = m; }
  }

  const final = applyMask(matrix, reserved, bestMask);
  placeFormatInfo(final, bestMask);

  const n = final.length;
  const quiet = 2; // quiet zone modules
  const total = n + quiet * 2;
  const cellSize = size / total;

  let rects = `<rect width="${size}" height="${size}" fill="#fff"/>`;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (final[r][c]) {
      rects += `<rect x="${((c + quiet) * cellSize).toFixed(2)}" y="${((r + quiet) * cellSize).toFixed(2)}" width="${(cellSize + 0.5).toFixed(2)}" height="${(cellSize + 0.5).toFixed(2)}" fill="#000"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rects}</svg>`;
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
