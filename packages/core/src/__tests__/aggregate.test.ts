import { describe, it, expect } from 'vitest';
import { aggregate, computeTotals } from '../data/aggregate';
import type { GridRow, ColumnDef } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz Premium', precio: 45.00, stock: 150 },
  { id: 2, nombre: 'Aceite de Oliva', precio: 120.00, stock: 5 },
  { id: 3, nombre: 'Detergente', precio: 75.00, stock: 0 },
  { id: 4, nombre: 'Papel Higienico', precio: 30.00, stock: 200 },
  { id: 5, nombre: 'Cafe Molido', precio: 95.00, stock: 80 },
];

describe('aggregate', () => {
  it('sum — suma correcta', () => {
    expect(aggregate(SAMPLE_ROWS, 'precio', 'sum')).toBe(365);
  });

  it('avg — promedio correcto', () => {
    expect(aggregate(SAMPLE_ROWS, 'precio', 'avg')).toBe(73);
  });

  it('count — cuenta valores no-zero', () => {
    expect(aggregate(SAMPLE_ROWS, 'stock', 'count')).toBe(4);
  });

  it('min — valor minimo', () => {
    expect(aggregate(SAMPLE_ROWS, 'precio', 'min')).toBe(30);
  });

  it('max — valor maximo', () => {
    expect(aggregate(SAMPLE_ROWS, 'precio', 'max')).toBe(120);
  });

  it('retorna 0 para array vacio', () => {
    expect(aggregate([], 'precio', 'sum')).toBe(0);
    expect(aggregate([], 'precio', 'avg')).toBe(0);
    expect(aggregate([], 'precio', 'count')).toBe(0);
    expect(aggregate([], 'precio', 'min')).toBe(0);
    expect(aggregate([], 'precio', 'max')).toBe(0);
  });

  it('convierte valores no-numericos a 0', () => {
    const rows: GridRow[] = [
      { id: 1, valor: 'abc' },
      { id: 2, valor: 10 },
    ];
    expect(aggregate(rows, 'valor', 'sum')).toBe(10);
  });

  it('retorna 0 para operador desconocido', () => {
    expect(aggregate(SAMPLE_ROWS, 'precio', 'unknown' as any)).toBe(0);
  });

  it('maneja null values como 0', () => {
    const rows: GridRow[] = [
      { id: 1, valor: null },
      { id: 2, valor: 50 },
    ];
    expect(aggregate(rows, 'valor', 'sum')).toBe(50);
  });
});

describe('computeTotals', () => {
  const columns: ColumnDef[] = [
    { field: 'nombre', header: 'Nombre' },
    { field: 'precio', header: 'Precio', type: 'number', aggregation: 'sum' },
    { field: 'stock', header: 'Stock', type: 'number', aggregation: 'sum' },
  ];

  it('calcula totales para columnas con aggregation', () => {
    const totals = computeTotals(SAMPLE_ROWS, columns);
    expect(totals.precio).toBe(365);
    expect(totals.stock).toBe(435);
  });

  it('incluye label en la primera columna string', () => {
    const totals = computeTotals(SAMPLE_ROWS, columns);
    expect(totals.nombre).toBe('Totales');
  });

  it('permite label personalizado', () => {
    const totals = computeTotals(SAMPLE_ROWS, columns, 'Gran Total');
    expect(totals.nombre).toBe('Gran Total');
  });

  it('marca row como totals', () => {
    const totals = computeTotals(SAMPLE_ROWS, columns);
    expect(totals.__zentto_totals__).toBe(true);
    expect(totals.id).toBe('__totals__');
  });

  it('maneja columnas sin aggregation — no agrega valor al campo', () => {
    const cols: ColumnDef[] = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'stock', header: 'Stock', type: 'number' },
    ];
    const totals = computeTotals(SAMPLE_ROWS, cols);
    expect(totals.stock).toBeUndefined();
    expect(totals.id).toBe('__totals__');
  });

  it('maneja array vacio', () => {
    const totals = computeTotals([], columns);
    expect(totals.precio).toBe(0);
    expect(totals.stock).toBe(0);
  });
});
