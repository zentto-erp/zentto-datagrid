import { describe, it, expect } from 'vitest';
import { findInGrid } from '../search/find';
import type { GridRow, ColumnDef } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz Premium', precio: 45.00, categoria: 'Alimentos' },
  { id: 2, nombre: 'Aceite de Oliva', precio: 120.00, categoria: 'Alimentos' },
  { id: 3, nombre: 'Detergente Liquido', precio: 75.00, categoria: 'Limpieza' },
  { id: 4, nombre: 'Papel Higienico', precio: 30.00, categoria: 'Limpieza' },
  { id: 5, nombre: 'Cafe Molido', precio: 95.00, categoria: 'Alimentos' },
];

const COLUMNS: ColumnDef[] = [
  { field: 'id', header: 'ID', type: 'number' },
  { field: 'nombre', header: 'Nombre' },
  { field: 'precio', header: 'Precio', type: 'number' },
  { field: 'categoria', header: 'Categoria' },
];

describe('findInGrid', () => {
  it('encuentra matches en campos string', () => {
    const matches = findInGrid(SAMPLE_ROWS, COLUMNS, 'arroz');
    expect(matches).toHaveLength(1);
    expect(matches[0].rowIndex).toBe(0);
    expect(matches[0].field).toBe('nombre');
  });

  it('busqueda case-insensitive', () => {
    const matches = findInGrid(SAMPLE_ROWS, COLUMNS, 'ACEITE');
    expect(matches).toHaveLength(1);
    expect(matches[0].field).toBe('nombre');
  });

  it('encuentra multiples matches en distintos campos', () => {
    const matches = findInGrid(SAMPLE_ROWS, COLUMNS, 'Alimentos');
    expect(matches).toHaveLength(3);
    expect(matches.every(m => m.field === 'categoria')).toBe(true);
  });

  it('encuentra en campos numericos', () => {
    const matches = findInGrid(SAMPLE_ROWS, COLUMNS, '120');
    expect(matches).toHaveLength(1);
    expect(matches[0].field).toBe('precio');
  });

  it('retorna vacio si query < 2 chars', () => {
    expect(findInGrid(SAMPLE_ROWS, COLUMNS, 'a')).toHaveLength(0);
    expect(findInGrid(SAMPLE_ROWS, COLUMNS, '')).toHaveLength(0);
  });

  it('retorna vacio si no hay matches', () => {
    expect(findInGrid(SAMPLE_ROWS, COLUMNS, 'xyz123')).toHaveLength(0);
  });

  it('ignora columnas con field que empieza con __', () => {
    const cols: ColumnDef[] = [
      ...COLUMNS,
      { field: '__zentto_internal__', header: 'Internal' },
    ];
    const rows: GridRow[] = [
      { id: 1, nombre: 'Test', __zentto_internal__: 'test match' },
    ];
    const matches = findInGrid(rows, cols, 'match');
    expect(matches).toHaveLength(0);
  });

  it('maneja filas con valores null', () => {
    const rows: GridRow[] = [
      { id: 1, nombre: null, categoria: 'Alimentos' },
    ];
    const matches = findInGrid(rows, COLUMNS, 'Alimentos');
    expect(matches).toHaveLength(1);
    expect(matches[0].field).toBe('categoria');
  });

  it('busca substring parcial (Liqu matches Liquido)', () => {
    const matches = findInGrid(SAMPLE_ROWS, COLUMNS, 'Liqu');
    expect(matches).toHaveLength(1);
    expect(matches[0].rowIndex).toBe(2);
    expect(matches[0].field).toBe('nombre');
  });

  it('match en multiples columnas de la misma fila', () => {
    const rows: GridRow[] = [
      { id: 1, nombre: 'Alimentos Premium', categoria: 'Alimentos' },
    ];
    const matches = findInGrid(rows, COLUMNS, 'Alimentos');
    expect(matches).toHaveLength(2);
  });

  it('maneja grid vacio', () => {
    expect(findInGrid([], COLUMNS, 'test')).toHaveLength(0);
  });
});
