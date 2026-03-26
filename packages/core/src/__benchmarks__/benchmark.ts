/**
 * Performance benchmarks for @zentto/datagrid-core
 *
 * Run: npm run bench (from packages/core)
 */

import { sortRows } from '../data/sort';
import { filterRows, quickSearch } from '../data/filter';
import { groupRows } from '../data/group';
import { pivotRows } from '../data/pivot';
import { computeTotals } from '../data/aggregate';
import { paginateRows } from '../data/paginate';
import { applyFormulas } from '../data/formula';
import type { GridRow, ColumnDef, SortEntry, FilterRule, FormulaDefinition } from '../types';

// ─── Helpers ───────────────────────────────────────────────────
function generateRows(count: number): GridRow[] {
  const categorias = ['Alimentos', 'Limpieza', 'Tecnologia', 'Hogar', 'Ropa'];
  const estados = ['Activo', 'Inactivo', 'Pendiente'];
  const regiones = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    nombre: `Producto ${i + 1}`,
    precio: Math.round(Math.random() * 10000) / 100,
    stock: Math.floor(Math.random() * 500),
    cantidad: Math.floor(Math.random() * 100),
    categoria: categorias[i % categorias.length],
    estado: estados[i % estados.length],
    region: regiones[i % regiones.length],
    fecha: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  }));
}

function bench(name: string, fn: () => void, iterations = 5): number {
  // Warmup
  fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return avg;
}

// ─── Run Benchmarks ────────────────────────────────────────────
const SIZES = [1_000, 10_000, 100_000];

const COLUMNS: ColumnDef[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'precio', header: 'Precio', type: 'number', aggregation: 'sum' },
  { field: 'stock', header: 'Stock', type: 'number', aggregation: 'sum' },
  { field: 'cantidad', header: 'Cantidad', type: 'number', aggregation: 'avg' },
  { field: 'categoria', header: 'Categoria', groupable: true },
  { field: 'estado', header: 'Estado' },
  { field: 'region', header: 'Region' },
];

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║           @zentto/datagrid-core — Performance Benchmark         ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

const results: { operation: string; rows: number; ms: string }[] = [];

for (const size of SIZES) {
  const rows = generateRows(size);
  console.log(`\n─── ${size.toLocaleString()} rows ──────────────────────────`);

  // Sort
  const sortSorts: SortEntry[] = [
    { field: 'precio', direction: 'desc' },
    { field: 'nombre', direction: 'asc' },
  ];
  const sortMs = bench(`Sort (2 cols)`, () => sortRows(rows, sortSorts));
  results.push({ operation: 'Sort (2 cols)', rows: size, ms: sortMs.toFixed(2) });

  // Filter
  const filterRules: FilterRule[] = [
    { field: 'categoria', operator: 'equals', value: 'Alimentos' },
    { field: 'precio', operator: 'gt', value: 50 },
  ];
  const filterMs = bench(`Filter (2 rules)`, () => filterRows(rows, filterRules));
  results.push({ operation: 'Filter (2 rules)', rows: size, ms: filterMs.toFixed(2) });

  // Quick Search
  const qsMs = bench(`Quick Search`, () => quickSearch(rows, 'Producto 5'));
  results.push({ operation: 'Quick Search', rows: size, ms: qsMs.toFixed(2) });

  // Group
  const groupMs = bench(`Group + subtotals`, () =>
    groupRows(rows, { field: 'categoria', showSubtotals: true, sortGroups: 'asc' }, COLUMNS)
  );
  results.push({ operation: 'Group + subtotals', rows: size, ms: groupMs.toFixed(2) });

  // Pivot
  const pivotMs = bench(`Pivot (5x5)`, () =>
    pivotRows(rows, { rowField: 'categoria', columnField: 'region', valueField: 'precio', showGrandTotals: true })
  );
  results.push({ operation: 'Pivot (5x5)', rows: size, ms: pivotMs.toFixed(2) });

  // Aggregate (computeTotals)
  const aggMs = bench(`Compute Totals`, () => computeTotals(rows, COLUMNS));
  results.push({ operation: 'Compute Totals', rows: size, ms: aggMs.toFixed(2) });

  // Paginate
  const pagMs = bench(`Paginate (p0, 50/page)`, () => paginateRows(rows, { page: 0, pageSize: 50 }));
  results.push({ operation: 'Paginate', rows: size, ms: pagMs.toFixed(2) });

  // Formulas
  const formulas: FormulaDefinition[] = [
    { field: 'total', formula: '={precio} * {cantidad}' },
  ];
  const fmMs = bench(`Formula (1 col)`, () => applyFormulas(rows, formulas));
  results.push({ operation: 'Formula (1 col)', rows: size, ms: fmMs.toFixed(2) });
}

// ─── Summary Table ─────────────────────────────────────────────
console.log('\n\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║                         Summary (ms)                            ║');
console.log('╠══════════════════════╦══════════╦══════════╦══════════╦══════════╣');
console.log('║ Operation            ║   1,000  ║  10,000  ║ 100,000  ║  Status  ║');
console.log('╠══════════════════════╬══════════╬══════════╬══════════╬══════════╣');

const operations = [...new Set(results.map(r => r.operation))];
for (const op of operations) {
  const bySize = SIZES.map(s => {
    const entry = results.find(r => r.operation === op && r.rows === s);
    return entry ? entry.ms.padStart(7) : '    N/A';
  });
  const ms100k = parseFloat(results.find(r => r.operation === op && r.rows === 100_000)?.ms ?? '0');
  const status = ms100k < 100 ? '  OK  ' : ms100k < 500 ? ' WARN ' : ' SLOW ';
  const opPad = op.padEnd(20);
  console.log(`║ ${opPad} ║ ${bySize[0]} ║ ${bySize[1]} ║ ${bySize[2]} ║ ${status} ║`);
}

console.log('╚══════════════════════╩══════════╩══════════╩══════════╩══════════╝');
console.log('\nStatus: OK = <100ms | WARN = <500ms | SLOW = >500ms (at 100K rows)\n');
