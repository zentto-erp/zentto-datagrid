import { describe, it, expect } from 'vitest';
import { filterRows, quickSearch } from '../data/filter';
import type { GridRow, FilterRule } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz Premium', precio: 45.00, stock: 150, categoria: 'Alimentos', estado: 'Activo' },
  { id: 2, nombre: 'Aceite de Oliva', precio: 120.00, stock: 5, categoria: 'Alimentos', estado: 'Activo' },
  { id: 3, nombre: 'Detergente', precio: 75.00, stock: 0, categoria: 'Limpieza', estado: 'Inactivo' },
  { id: 4, nombre: 'Papel Higienico', precio: 30.00, stock: 200, categoria: 'Limpieza', estado: 'Activo' },
  { id: 5, nombre: 'Cafe Molido', precio: 95.00, stock: 80, categoria: 'Alimentos', estado: 'Activo' },
  { id: 6, nombre: 'Jabon Liquido', precio: 55.00, stock: null, categoria: 'Limpieza', estado: 'Inactivo' },
  { id: 7, nombre: '', precio: 40.00, stock: 300, categoria: 'Alimentos', estado: 'Activo' },
];

describe('filterRows', () => {
  it('devuelve todos los rows sin reglas', () => {
    expect(filterRows(SAMPLE_ROWS, [])).toBe(SAMPLE_ROWS);
  });

  it('operator contains — filtra por substring', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'contains', value: 'arroz' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Arroz Premium');
  });

  it('operator notContains', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'notContains', value: 'arroz' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(6);
  });

  it('operator equals — case insensitive', () => {
    const rules: FilterRule[] = [{ field: 'estado', operator: 'equals', value: 'activo' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(5);
  });

  it('operator notEquals', () => {
    const rules: FilterRule[] = [{ field: 'estado', operator: 'notEquals', value: 'Activo' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(2);
  });

  it('operator startsWith', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'startsWith', value: 'ace' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Aceite de Oliva');
  });

  it('operator endsWith', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'endsWith', value: 'mium' }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Arroz Premium');
  });

  it('operator gt', () => {
    const rules: FilterRule[] = [{ field: 'precio', operator: 'gt', value: 75 }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result.every(r => Number(r.precio) > 75)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('operator gte', () => {
    const rules: FilterRule[] = [{ field: 'precio', operator: 'gte', value: 75 }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(3);
  });

  it('operator lt', () => {
    const rules: FilterRule[] = [{ field: 'precio', operator: 'lt', value: 50 }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result.every(r => Number(r.precio) < 50)).toBe(true);
  });

  it('operator lte', () => {
    const rules: FilterRule[] = [{ field: 'precio', operator: 'lte', value: 45 }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(3);
  });

  it('operator isEmpty — null and empty string', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'isEmpty', value: null }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(1);
  });

  it('operator isNotEmpty', () => {
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'isNotEmpty', value: null }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(6);
  });

  it('operator between', () => {
    const rules: FilterRule[] = [{ field: 'precio', operator: 'between', value: [40, 80] }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result.every(r => Number(r.precio) >= 40 && Number(r.precio) <= 80)).toBe(true);
    expect(result).toHaveLength(4);
  });

  it('operator inList', () => {
    const rules: FilterRule[] = [{ field: 'categoria', operator: 'inList', value: ['Limpieza'] }];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(3);
  });

  it('combina multiples reglas con AND', () => {
    const rules: FilterRule[] = [
      { field: 'categoria', operator: 'equals', value: 'Alimentos' },
      { field: 'precio', operator: 'gt', value: 50 },
    ];
    const result = filterRows(SAMPLE_ROWS, rules);
    expect(result).toHaveLength(2);
  });

  it('contains retorna false cuando val es null', () => {
    const rows: GridRow[] = [{ id: 1, nombre: null }];
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'contains', value: 'test' }];
    expect(filterRows(rows, rules)).toHaveLength(0);
  });

  it('notContains retorna true cuando val es null', () => {
    const rows: GridRow[] = [{ id: 1, nombre: null }];
    const rules: FilterRule[] = [{ field: 'nombre', operator: 'notContains', value: 'test' }];
    expect(filterRows(rows, rules)).toHaveLength(1);
  });

  it('equals maneja null == null', () => {
    const rows: GridRow[] = [{ id: 1, x: null }];
    const rules: FilterRule[] = [{ field: 'x', operator: 'equals', value: null }];
    expect(filterRows(rows, rules)).toHaveLength(1);
  });
});

describe('quickSearch', () => {
  it('devuelve todo si query es menor a 2 chars', () => {
    expect(quickSearch(SAMPLE_ROWS, 'a')).toBe(SAMPLE_ROWS);
  });

  it('devuelve todo si query esta vacio', () => {
    expect(quickSearch(SAMPLE_ROWS, '')).toBe(SAMPLE_ROWS);
  });

  it('busca en todos los campos', () => {
    const result = quickSearch(SAMPLE_ROWS, 'arroz');
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Arroz Premium');
  });

  it('busca case-insensitive', () => {
    const result = quickSearch(SAMPLE_ROWS, 'ACEITE');
    expect(result).toHaveLength(1);
  });

  it('busca en campos numericos convertidos a string', () => {
    const result = quickSearch(SAMPLE_ROWS, '120');
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Aceite de Oliva');
  });

  it('filtra por campos especificos', () => {
    const result = quickSearch(SAMPLE_ROWS, '120', ['nombre']);
    expect(result).toHaveLength(0);
  });

  it('ignora campos con valor null', () => {
    const result = quickSearch(SAMPLE_ROWS, 'null');
    expect(result).toHaveLength(0);
  });
});
