// ═══════════════════════════════════════════════════════════════
// QR Code generator — real, scannable QR codes (ISO 18004)
// Byte mode, Versions 1-6, Error Correction Level L
// ═══════════════════════════════════════════════════════════════

// ── Galois Field GF(256) arithmetic ──────────────────────────
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = v; GF_LOG[v] = i;
    v = (v << 1) ^ (v & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
  // Build generator polynomial
  let gen = new Uint8Array([1]);
  for (let i = 0; i < ecLen; i++) {
    const ng = new Uint8Array(gen.length + 1);
    for (let j = 0; j < gen.length; j++) {
      ng[j] ^= gen[j];
      ng[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = ng;
  }
  // Divide
  const msg = new Uint8Array(data.length + ecLen);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) for (let j = 0; j < gen.length; j++) msg[i + j] ^= gfMul(gen[j], coef);
  }
  return msg.slice(data.length);
}

// ── QR Version table (ECC Level L) ──────────────────────────
//    dataCW = total data codewords, ecCW = EC codewords per block
interface QRVer { sz: number; dataCW: number; ecCW: number; blocks: number; cap: number; }
const V: QRVer[] = [
  { sz: 0,  dataCW: 0,   ecCW: 0,  blocks: 0, cap: 0 },
  { sz: 21, dataCW: 19,  ecCW: 7,  blocks: 1, cap: 17 },  // v1
  { sz: 25, dataCW: 34,  ecCW: 10, blocks: 1, cap: 32 },  // v2
  { sz: 29, dataCW: 55,  ecCW: 15, blocks: 1, cap: 53 },  // v3
  { sz: 33, dataCW: 80,  ecCW: 20, blocks: 1, cap: 78 },  // v4
  { sz: 37, dataCW: 108, ecCW: 26, blocks: 1, cap: 106 }, // v5
  { sz: 41, dataCW: 136, ecCW: 18, blocks: 2, cap: 134 }, // v6
];

function pickVersion(len: number): number {
  for (let v = 1; v <= 6; v++) if (len <= V[v].cap) return v;
  return 6;
}

// ── Bit stream helper ────────────────────────────────────────
function encodeBits(data: string, ver: number): Uint8Array {
  const vi = V[ver];
  const raw = new TextEncoder().encode(data);
  const len = Math.min(raw.length, vi.cap);
  const totalBits = vi.dataCW * 8;
  const bits: number[] = [];

  // Mode 0100 (byte)
  bits.push(0, 1, 0, 0);
  // Length (8 bits for v1-9)
  for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
  // Data bytes
  for (let b = 0; b < len; b++) for (let i = 7; i >= 0; i--) bits.push((raw[b] >> i) & 1);
  // Terminator (up to 4 zero bits)
  for (let i = 0; i < 4 && bits.length < totalBits; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < totalBits) bits.push(0);

  // Convert to bytes
  const buf = new Uint8Array(vi.dataCW);
  for (let i = 0; i < bits.length; i++) if (bits[i]) buf[i >> 3] |= 0x80 >> (i & 7);
  // Pad codewords
  let idx = Math.ceil(bits.length / 8);
  let p = 0xEC;
  while (idx < vi.dataCW) { buf[idx++] = p; p = p === 0xEC ? 0x11 : 0xEC; }

  return buf;
}

// ── Error correction ─────────────────────────────────────────
function addEC(data: Uint8Array, ver: number): Uint8Array {
  const vi = V[ver];
  const blockSz = Math.floor(vi.dataCW / vi.blocks);
  const dBlocks: Uint8Array[] = [];
  const eBlocks: Uint8Array[] = [];

  for (let b = 0; b < vi.blocks; b++) {
    const s = b * blockSz, e = b === vi.blocks - 1 ? vi.dataCW : s + blockSz;
    const block = data.slice(s, e);
    dBlocks.push(block);
    eBlocks.push(rsEncode(block, vi.ecCW));
  }

  // Interleave: all data then all EC
  const out: number[] = [];
  const maxD = Math.max(...dBlocks.map(b => b.length));
  for (let i = 0; i < maxD; i++) for (const b of dBlocks) if (i < b.length) out.push(b[i]);
  for (let i = 0; i < vi.ecCW; i++) for (const b of eBlocks) if (i < b.length) out.push(b[i]);
  return new Uint8Array(out);
}

// ── Matrix construction ──────────────────────────────────────
const ALIGN_POS: number[][] = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

function makeMatrix(ver: number) {
  const sz = V[ver].sz;
  const m = Array.from({ length: sz }, () => new Uint8Array(sz));
  const r = Array.from({ length: sz }, () => new Uint8Array(sz)); // reserved

  // Finder pattern (7x7) + separator (white border)
  function finder(row: number, col: number) {
    for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
      const y = row + dy, x = col + dx;
      if (y < 0 || y >= sz || x < 0 || x >= sz) continue;
      const border = dy === 0 || dy === 6 || dx === 0 || dx === 6;
      const inner = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
      const sep = dy === -1 || dy === 7 || dx === -1 || dx === 7;
      m[y][x] = (!sep && (border || inner)) ? 1 : 0;
      r[y][x] = 1;
    }
  }
  finder(0, 0);
  finder(0, sz - 7);
  finder(sz - 7, 0);

  // Timing patterns
  for (let i = 8; i < sz - 8; i++) {
    m[6][i] = (i & 1) ^ 1; r[6][i] = 1;
    m[i][6] = (i & 1) ^ 1; r[i][6] = 1;
  }

  // Alignment patterns (version >= 2)
  if (ver >= 2) {
    const pos = ALIGN_POS[ver];
    for (const ay of pos) for (const ax of pos) {
      // Skip if overlapping finder
      if (ay <= 8 && ax <= 8) continue;
      if (ay <= 8 && ax >= sz - 8) continue;
      if (ay >= sz - 8 && ax <= 8) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const y = ay + dy, x = ax + dx;
        m[y][x] = (Math.abs(dy) === 2 || Math.abs(dx) === 2 || (dy === 0 && dx === 0)) ? 1 : 0;
        r[y][x] = 1;
      }
    }
  }

  // Dark module
  m[4 * ver + 9][8] = 1;
  r[4 * ver + 9][8] = 1;

  // Reserve format info areas (will be filled later)
  for (let i = 0; i <= 8; i++) {
    if (i < sz) { r[i][8] = 1; r[8][i] = 1; }
  }
  for (let i = 0; i < 8; i++) {
    r[8][sz - 1 - i] = 1;
    r[sz - 1 - i][8] = 1;
  }

  return { m, r };
}

// ── Place data bits in zigzag ────────────────────────────────
function placeData(m: Uint8Array[], r: Uint8Array[], cw: Uint8Array) {
  const sz = m.length;
  let bi = 0;
  const total = cw.length * 8;

  // Traverse from bottom-right, two columns at a time, alternating up/down
  for (let right = sz - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    for (let vert = 0; vert < sz; vert++) {
      for (let dx = 0; dx <= 1; dx++) {
        const x = right - dx;
        // Determine row: even passes go up, odd go down
        const pass = Math.floor((sz - 1 - right) / 2);
        const y = (pass & 1) === 0 ? sz - 1 - vert : vert;
        if (x < 0 || x >= sz || r[y][x]) continue;
        if (bi < total) {
          m[y][x] = (cw[bi >> 3] >> (7 - (bi & 7))) & 1;
          bi++;
        }
      }
    }
  }
}

// ── Masking ──────────────────────────────────────────────────
type MaskFn = (r: number, c: number) => boolean;
const MASKS: MaskFn[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
];

function applyMask(m: Uint8Array[], r: Uint8Array[], mask: number): Uint8Array[] {
  const sz = m.length;
  const out = m.map(row => new Uint8Array(row));
  const fn = MASKS[mask];
  for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) {
    if (!r[y][x] && fn(y, x)) out[y][x] ^= 1;
  }
  return out;
}

// ── Format info (ECC L, masks 0-7) ──────────────────────────
// Pre-computed: (ecl=01 << 3 | mask) BCH encoded, XOR masked with 0x5412
const FMT = [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976];

function writeFormat(m: Uint8Array[], mask: number) {
  const sz = m.length;
  const bits = FMT[mask];

  // First copy: around top-left finder
  // Bits 0..5 → row 8, columns 0..5
  // Bit 6 → row 8, column 7 (skip col 6 = timing)
  // Bit 7 → row 8, column 8
  // Bit 8 → row 7, column 8 (skip row 6 = timing)
  // Bits 9..14 → rows 5..0, column 8
  const pos1: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [y, x] = pos1[i];
    m[y][x] = (bits >> i) & 1;  // bit 0 = LSB first
  }

  // Second copy: along edges near top-right and bottom-left finders
  // Bits 0..6 → column 8, rows (sz-1)..(sz-7)
  // Bits 7..14 → row 8, columns (sz-8)..(sz-1)
  for (let i = 0; i < 7; i++) m[sz - 1 - i][8] = (bits >> i) & 1;
  for (let i = 0; i < 8; i++) m[8][sz - 8 + i] = (bits >> (7 + i)) & 1;
}

// ── Penalty scoring (simplified) ────────────────────────────
function penalty(m: Uint8Array[]): number {
  const sz = m.length;
  let s = 0;
  // Rule 1: runs of same color ≥ 5
  for (let y = 0; y < sz; y++) {
    let n = 1;
    for (let x = 1; x < sz; x++) {
      if (m[y][x] === m[y][x - 1]) n++; else { if (n >= 5) s += n - 2; n = 1; }
    }
    if (n >= 5) s += n - 2;
  }
  for (let x = 0; x < sz; x++) {
    let n = 1;
    for (let y = 1; y < sz; y++) {
      if (m[y][x] === m[y - 1][x]) n++; else { if (n >= 5) s += n - 2; n = 1; }
    }
    if (n >= 5) s += n - 2;
  }
  // Rule 2: 2x2 blocks
  for (let y = 0; y < sz - 1; y++) for (let x = 0; x < sz - 1; x++) {
    const v = m[y][x];
    if (m[y][x + 1] === v && m[y + 1][x] === v && m[y + 1][x + 1] === v) s += 3;
  }
  return s;
}

// ── Main QR generator ────────────────────────────────────────
export function generateQrSvg(data: string, size = 60): string {
  if (!data) return '';
  const ver = pickVersion(data.length);
  const dataCW = encodeBits(data, ver);
  const allCW = addEC(dataCW, ver);
  const { m, r } = makeMatrix(ver);
  placeData(m, r, allCW);

  // Evaluate all 8 masks, pick lowest penalty
  let bestMask = 0, bestPen = Infinity;
  for (let k = 0; k < 8; k++) {
    const masked = applyMask(m, r, k);
    writeFormat(masked, k);
    const p = penalty(masked);
    if (p < bestPen) { bestPen = p; bestMask = k; }
  }
  const final = applyMask(m, r, bestMask);
  writeFormat(final, bestMask);

  // Render SVG
  const n = final.length;
  const quiet = 4; // quiet zone (spec says 4 modules)
  const total = n + quiet * 2;
  const cs = size / total;
  let svg = `<rect width="${size}" height="${size}" fill="#fff"/>`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (final[y][x]) {
      svg += `<rect x="${((x + quiet) * cs).toFixed(2)}" y="${((y + quiet) * cs).toFixed(2)}" width="${(cs + 0.4).toFixed(2)}" height="${(cs + 0.4).toFixed(2)}" fill="#000"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${svg}</svg>`;
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
