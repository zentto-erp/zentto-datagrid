import { describe, it, expect } from 'vitest';
import { sortRows } from '../data/sort';
import type { GridRow, SortEntry } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz Premium', precio: 45.00, stock: 150, categoria: 'Alimentos' },
  { id: 2, nombre: 'Aceite de Oliva', precio: 120.00, stock: 5, categoria: 'Alimentos' },
  { id: 3, nombre: 'Detergente', precio: 75.00, stock: 0, categoria: 'Limpieza' },
  { id: 4, nombre: 'Papel Higienico', precio: 30.00, stock: 200, categoria: 'Limpieza' },
  { id: 5, nombre: 'Cafe Molido', precio: 95.00, stock: 80, categoria: 'Alimentos' },
  { id: 6, nombre: 'Jabon Liquido', precio: 55.00, stock: null, categoria: 'Limpieza' },
  { id: 7, nombre: 'Azucar', precio: 40.00, stock: 300, categoria: 'Alimentos' },
];

describe('sortRows', () => {
  it('devuelve los mismos rows cuando no hay sorts', () => {
    const result = sortRows(SAMPLE_ROWS, []);
    expect(result).toBe(SAMPLE_ROWS);
  });

  it('ordena numeros ascendente', () => {
    const sorts: SortEntry[] = [{ field: 'precio', direction: 'asc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    expect(result[0].precio).toBe(30);
    expect(result[result.length - 1].precio).toBe(120);
  });

  it('ordena numeros descendente', () => {
    const sorts: SortEntry[] = [{ field: 'precio', direction: 'desc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    expect(result[0].precio).toBe(120);
    expect(result[result.length - 1].precio).toBe(30);
  });

  it('ordena strings ascendente (locale-aware)', () => {
    const sorts: SortEntry[] = [{ field: 'nombre', direction: 'asc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    expect(result[0].nombre).toBe('Aceite de Oliva');
    expect(result[result.length - 1].nombre).toBe('Papel Higienico');
  });

  it('ordena strings descendente', () => {
    const sorts: SortEntry[] = [{ field: 'nombre', direction: 'desc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    expect(result[0].nombre).toBe('Papel Higienico');
    expect(result[result.length - 1].nombre).toBe('Aceite de Oliva');
  });

  it('multi-sort: categoria asc, luego precio desc', () => {
    const sorts: SortEntry[] = [
      { field: 'categoria', direction: 'asc' },
      { field: 'precio', direction: 'desc' },
    ];
    const result = sortRows(SAMPLE_ROWS, sorts);
    const alimentos = result.filter(r => r.categoria === 'Alimentos');
    expect(alimentos[0].precio).toBe(120);
    expect(alimentos[1].precio).toBe(95);
    expect(alimentos[2].precio).toBe(45);
    expect(alimentos[3].precio).toBe(40);
  });

  it('maneja null values — nulls van al final en asc', () => {
    const sorts: SortEntry[] = [{ field: 'stock', direction: 'asc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    expect(result[result.length - 1].stock).toBeNull();
    expect(result[0].stock).toBe(0);
  });

  it('maneja null values — nulls van al inicio en desc', () => {
    const sorts: SortEntry[] = [{ field: 'stock', direction: 'desc' }];
    const result = sortRows(SAMPLE_ROWS, sorts);
    // null: return 1 * dir(-1) = -1 => null before non-null
    expect(result[0].stock).toBeNull();
    expect(result[1].stock).toBe(300);
  });

  it('no muta el array original', () => {
    const original = [...SAMPLE_ROWS];
    const sorts: SortEntry[] = [{ field: 'precio', direction: 'asc' }];
    sortRows(SAMPLE_ROWS, sorts);
    expect(SAMPLE_ROWS).toEqual(original);
  });

  it('ordena por fechas', () => {
    const d1 = new Date(2026, 2, 15); // Mar
    const d2 = new Date(2026, 0, 1);  // Jan
    const d3 = new Date(2026, 5, 20); // Jun
    const rows: GridRow[] = [
      { id: 1, fecha: d1 },
      { id: 2, fecha: d2 },
      { id: 3, fecha: d3 },
    ];
    const sorts: SortEntry[] = [{ field: 'fecha', direction: 'asc' }];
    const result = sortRows(rows, sorts);
    expect(result[0].fecha).toBe(d2);
    expect(result[1].fecha).toBe(d1);
    expect(result[2].fecha).toBe(d3);
  });

  it('maneja array vacio', () => {
    const result = sortRows([], [{ field: 'precio', direction: 'asc' }]);
    expect(result).toEqual([]);
  });

  it('maneja ambos valores null — continua al siguiente sort', () => {
    const rows: GridRow[] = [
      { id: 1, a: null, b: 2 },
      { id: 2, a: null, b: 1 },
    ];
    const sorts: SortEntry[] = [
      { field: 'a', direction: 'asc' },
      { field: 'b', direction: 'asc' },
    ];
    const result = sortRows(rows, sorts);
    expect(result[0].b).toBe(1);
    expect(result[1].b).toBe(2);
  });

  it('un solo elemento — retorna copia', () => {
    const rows: GridRow[] = [{ id: 1, precio: 10 }];
    const result = sortRows(rows, [{ field: 'precio', direction: 'asc' }]);
    expect(result).toHaveLength(1);
    expect(result[0].precio).toBe(10);
  });
});
