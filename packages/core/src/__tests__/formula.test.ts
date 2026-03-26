import { describe, it, expect } from 'vitest';
import { evaluateFormula, applyFormulas } from '../data/formula';
import type { GridRow, FormulaDefinition } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz', precioVenta: 100, precioCompra: 60, cantidad: 10 },
  { id: 2, nombre: 'Aceite', precioVenta: 200, precioCompra: 150, cantidad: 5 },
  { id: 3, nombre: 'Cafe', precioVenta: 150, precioCompra: 80, cantidad: 20 },
];

describe('evaluateFormula', () => {
  it('SUM — suma todos los valores del campo', () => {
    const result = evaluateFormula('=SUM({precioVenta})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(450);
  });

  it('AVG — promedio de todos los valores', () => {
    const result = evaluateFormula('=AVG({precioVenta})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(150);
  });

  it('MIN — valor minimo', () => {
    const result = evaluateFormula('=MIN({precioCompra})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(60);
  });

  it('MAX — valor maximo', () => {
    const result = evaluateFormula('=MAX({precioVenta})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(200);
  });

  it('COUNT — cuenta valores no vacios', () => {
    const result = evaluateFormula('=COUNT({nombre})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(3);
  });

  it('aritmetica per-row: multiplicacion', () => {
    const result = evaluateFormula('={precioVenta} * {cantidad}', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(1000);
  });

  it('aritmetica per-row: resta', () => {
    const result = evaluateFormula('={precioVenta} - {precioCompra}', SAMPLE_ROWS[1], SAMPLE_ROWS);
    expect(result).toBe(50);
  });

  it('aritmetica per-row: expresion compleja', () => {
    const result = evaluateFormula('=({precioVenta} - {precioCompra}) * {cantidad}', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(400);
  });

  it('ROUND — redondea a N decimales', () => {
    const rows: GridRow[] = [{ id: 1, valor: 3.14159 }];
    const result = evaluateFormula('=ROUND({valor}, 2)', rows[0], rows);
    expect(result).toBe(3.14);
  });

  it('IF — condicion verdadera', () => {
    const result = evaluateFormula('=IF({precioVenta} > 100, "Caro", "Barato")', SAMPLE_ROWS[1], SAMPLE_ROWS);
    expect(result).toBe('Caro');
  });

  it('IF — condicion falsa', () => {
    const result = evaluateFormula('=IF({precioVenta} > 100, "Caro", "Barato")', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe('Barato');
  });

  it('formula sin = prefix funciona igual', () => {
    const result = evaluateFormula('SUM({precioVenta})', SAMPLE_ROWS[0], SAMPLE_ROWS);
    expect(result).toBe(450);
  });

  it('campo null se trata como 0', () => {
    const rows: GridRow[] = [{ id: 1, valor: null }];
    const result = evaluateFormula('={valor} * 10', rows[0], rows);
    expect(result).toBe(0);
  });

  it('SUM con array vacio retorna 0', () => {
    const result = evaluateFormula('=SUM({precio})', {} as GridRow, []);
    expect(result).toBe(0);
  });
});

describe('applyFormulas', () => {
  it('aplica formulas a todos los rows', () => {
    const formulas: FormulaDefinition[] = [
      { field: 'total', formula: '={precioVenta} * {cantidad}' },
    ];
    const result = applyFormulas(SAMPLE_ROWS, formulas);
    expect(result[0].total).toBe(1000);
    expect(result[1].total).toBe(1000);
    expect(result[2].total).toBe(3000);
  });

  it('no muta rows originales', () => {
    const formulas: FormulaDefinition[] = [
      { field: 'total', formula: '={precioVenta} * {cantidad}' },
    ];
    applyFormulas(SAMPLE_ROWS, formulas);
    expect((SAMPLE_ROWS[0] as any).total).toBeUndefined();
  });

  it('retorna original si no hay formulas', () => {
    expect(applyFormulas(SAMPLE_ROWS, [])).toBe(SAMPLE_ROWS);
  });

  it('multiples formulas en secuencia', () => {
    const formulas: FormulaDefinition[] = [
      { field: 'ganancia', formula: '={precioVenta} - {precioCompra}' },
      { field: 'margen', formula: '=SUM({precioVenta})' },
    ];
    const result = applyFormulas(SAMPLE_ROWS, formulas);
    expect(result[0].ganancia).toBe(40);
    expect(result[0].margen).toBe(450);
  });
});
