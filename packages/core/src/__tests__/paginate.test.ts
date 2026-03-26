import { describe, it, expect } from 'vitest';
import { paginateRows } from '../data/paginate';
import type { GridRow } from '../types';

function makeRows(count: number): GridRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    nombre: `Producto ${i + 1}`,
    precio: (i + 1) * 10,
  }));
}

describe('paginateRows', () => {
  const rows = makeRows(55);

  it('devuelve la primera pagina', () => {
    const result = paginateRows(rows, { page: 0, pageSize: 10 });
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0].id).toBe(1);
    expect(result.rows[9].id).toBe(10);
    expect(result.page).toBe(0);
    expect(result.pageSize).toBe(10);
  });

  it('calcula totalRows y totalPages', () => {
    const result = paginateRows(rows, { page: 0, pageSize: 10 });
    expect(result.totalRows).toBe(55);
    expect(result.totalPages).toBe(6);
  });

  it('devuelve la ultima pagina parcial', () => {
    const result = paginateRows(rows, { page: 5, pageSize: 10 });
    expect(result.rows).toHaveLength(5);
    expect(result.rows[0].id).toBe(51);
  });

  it('devuelve pagina intermedia', () => {
    const result = paginateRows(rows, { page: 2, pageSize: 10 });
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0].id).toBe(21);
  });

  it('pagina fuera de rango devuelve array vacio', () => {
    const result = paginateRows(rows, { page: 100, pageSize: 10 });
    expect(result.rows).toHaveLength(0);
  });

  it('maneja array vacio', () => {
    const result = paginateRows([], { page: 0, pageSize: 10 });
    expect(result.rows).toHaveLength(0);
    expect(result.totalRows).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('pageSize mayor que total rows', () => {
    const small = makeRows(3);
    const result = paginateRows(small, { page: 0, pageSize: 100 });
    expect(result.rows).toHaveLength(3);
    expect(result.totalPages).toBe(1);
  });

  it('pageSize = 1', () => {
    const result = paginateRows(rows, { page: 0, pageSize: 1 });
    expect(result.rows).toHaveLength(1);
    expect(result.totalPages).toBe(55);
  });

  it('pageSize 25', () => {
    const result = paginateRows(rows, { page: 0, pageSize: 25 });
    expect(result.rows).toHaveLength(25);
    expect(result.totalPages).toBe(3);
  });

  it('no muta el array original', () => {
    const original = makeRows(5);
    const copy = [...original];
    paginateRows(original, { page: 0, pageSize: 2 });
    expect(original).toEqual(copy);
  });
});
