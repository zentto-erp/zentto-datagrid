import { describe, it, expect } from 'vitest';
import { pivotRows } from '../data/pivot';
import type { GridRow, PivotConfig } from '../types';

const SALES_DATA: GridRow[] = [
  { id: 1, vendedor: 'Maria', region: 'Norte', ventas: 100 },
  { id: 2, vendedor: 'Maria', region: 'Sur', ventas: 80 },
  { id: 3, vendedor: 'Pedro', region: 'Norte', ventas: 150 },
  { id: 4, vendedor: 'Pedro', region: 'Sur', ventas: 120 },
  { id: 5, vendedor: 'Pedro', region: 'Norte', ventas: 50 },
  { id: 6, vendedor: 'Ana', region: 'Norte', ventas: 200 },
  { id: 7, vendedor: 'Ana', region: 'Sur', ventas: 90 },
  { id: 8, vendedor: 'Ana', region: 'Este', ventas: 60 },
];

describe('pivotRows', () => {
  it('genera pivot con sum por defecto', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    expect(result.rows).toHaveLength(3);
    const ana = result.rows.find(r => r.vendedor === 'Ana');
    expect(ana!['Norte']).toBe(200);
    expect(ana!['Sur']).toBe(90);
    expect(ana!['Este']).toBe(60);
  });

  it('Pedro tiene sum correcto de 2 ventas Norte', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    const pedro = result.rows.find(r => r.vendedor === 'Pedro');
    expect(pedro!['Norte']).toBe(200);
    expect(pedro!['Sur']).toBe(120);
  });

  it('genera columnas correctas', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    const fields = result.columns.map(c => c.field);
    expect(fields).toContain('vendedor');
    expect(fields).toContain('Norte');
    expect(fields).toContain('Sur');
    expect(fields).toContain('Este');
  });

  it('showRowTotals agrega columna __total__', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
      showRowTotals: true,
    };
    const result = pivotRows(SALES_DATA, config);
    const ana = result.rows.find(r => r.vendedor === 'Ana');
    expect(ana!['__total__']).toBe(350);
    expect(result.columns.some(c => c.field === '__total__')).toBe(true);
  });

  it('showGrandTotals agrega fila TOTAL', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
      showGrandTotals: true,
    };
    const result = pivotRows(SALES_DATA, config);
    const grandTotal = result.rows.find(r => r.__zentto_totals__);
    expect(grandTotal).toBeDefined();
    expect(grandTotal!.vendedor).toBe('TOTAL');
    expect(grandTotal!['Norte']).toBe(500);
    expect(grandTotal!['Sur']).toBe(290);
    expect(grandTotal!['Este']).toBe(60);
  });

  it('showGrandTotals + showRowTotals combinados', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
      showGrandTotals: true,
      showRowTotals: true,
    };
    const result = pivotRows(SALES_DATA, config);
    const grandTotal = result.rows.find(r => r.__zentto_totals__);
    expect(grandTotal!['__total__']).toBe(850);
  });

  it('celda sin datos retorna 0', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    const maria = result.rows.find(r => r.vendedor === 'Maria');
    expect(maria!['Este']).toBe(0);
  });

  it('maneja array vacio', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows([], config);
    expect(result.rows).toHaveLength(0);
    expect(result.columns).toHaveLength(1);
  });

  it('rows estan ordenados alfabeticamente', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    const names = result.rows.map(r => r.vendedor);
    expect(names).toEqual(['Ana', 'Maria', 'Pedro']);
  });

  it('columnas region estan ordenadas', () => {
    const config: PivotConfig = {
      rowField: 'vendedor',
      columnField: 'region',
      valueField: 'ventas',
    };
    const result = pivotRows(SALES_DATA, config);
    const colFields = result.columns.slice(1).map(c => c.field);
    expect(colFields).toEqual(['Este', 'Norte', 'Sur']);
  });
});
