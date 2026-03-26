import { describe, it, expect } from 'vitest';
import { groupRows } from '../data/group';
import type { GridRow, ColumnDef, RowGroupingConfig } from '../types';

const SAMPLE_ROWS: GridRow[] = [
  { id: 1, nombre: 'Arroz Premium', precio: 45.00, stock: 150, categoria: 'Alimentos' },
  { id: 2, nombre: 'Aceite de Oliva', precio: 120.00, stock: 5, categoria: 'Alimentos' },
  { id: 3, nombre: 'Detergente', precio: 75.00, stock: 0, categoria: 'Limpieza' },
  { id: 4, nombre: 'Papel Higienico', precio: 30.00, stock: 200, categoria: 'Limpieza' },
  { id: 5, nombre: 'Cafe Molido', precio: 95.00, stock: 80, categoria: 'Alimentos' },
];

const COLUMNS: ColumnDef[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'precio', header: 'Precio', type: 'number', aggregation: 'sum' },
  { field: 'stock', header: 'Stock', type: 'number', aggregation: 'sum' },
  { field: 'categoria', header: 'Categoria' },
];

describe('groupRows', () => {
  it('agrupa filas por campo', () => {
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const headers = result.filter(r => r.__zentto_group__);
    expect(headers).toHaveLength(2);
  });

  it('inserta header rows con metadata correcta', () => {
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const header = result.find(r => r.__zentto_group_value__ === 'Alimentos');
    expect(header).toBeDefined();
    expect(header!.__zentto_group_count__).toBe(3);
    expect(header!.__zentto_group_field__).toBe('categoria');
  });

  it('mantiene data rows despues de cada header', () => {
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const headerIdx = result.findIndex(r => r.__zentto_group_value__ === 'Alimentos');
    expect(result[headerIdx + 1].nombre).toBeDefined();
    expect(result[headerIdx + 2].nombre).toBeDefined();
    expect(result[headerIdx + 3].nombre).toBeDefined();
  });

  it('ordena grupos ascendente', () => {
    const config: RowGroupingConfig = { field: 'categoria', sortGroups: 'asc' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const headers = result.filter(r => r.__zentto_group__);
    expect(headers[0].__zentto_group_value__).toBe('Alimentos');
    expect(headers[1].__zentto_group_value__).toBe('Limpieza');
  });

  it('ordena grupos descendente', () => {
    const config: RowGroupingConfig = { field: 'categoria', sortGroups: 'desc' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const headers = result.filter(r => r.__zentto_group__);
    expect(headers[0].__zentto_group_value__).toBe('Limpieza');
    expect(headers[1].__zentto_group_value__).toBe('Alimentos');
  });

  it('genera subtotales cuando showSubtotals = true', () => {
    const config: RowGroupingConfig = { field: 'categoria', showSubtotals: true };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const subtotals = result.filter(r => r.__zentto_subtotal__);
    expect(subtotals).toHaveLength(2);
  });

  it('subtotales contienen valores agregados correctos', () => {
    const config: RowGroupingConfig = { field: 'categoria', showSubtotals: true, sortGroups: 'asc' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const subtotals = result.filter(r => r.__zentto_subtotal__);
    const alimentosSub = subtotals.find(r => String(r.categoria).includes('Alimentos'));
    expect(alimentosSub!.precio).toBe(260);
    const limpiezaSub = subtotals.find(r => String(r.categoria).includes('Limpieza'));
    expect(limpiezaSub!.precio).toBe(105);
  });

  it('maneja valores null en el campo de grupo', () => {
    const rows: GridRow[] = [
      { id: 1, nombre: 'Sin categoria', categoria: null },
      { id: 2, nombre: 'Con categoria', categoria: 'A' },
    ];
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows(rows, config, COLUMNS);
    const headers = result.filter(r => r.__zentto_group__);
    expect(headers.some(h => h.__zentto_group_value__ === '(vacio)')).toBe(true);
  });

  it('sin subtotales por defecto', () => {
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    expect(result.filter(r => r.__zentto_subtotal__)).toHaveLength(0);
  });

  it('maneja array vacio', () => {
    const config: RowGroupingConfig = { field: 'categoria' };
    const result = groupRows([], config, COLUMNS);
    expect(result).toHaveLength(0);
  });

  it('formato correcto del header label', () => {
    const config: RowGroupingConfig = { field: 'categoria', sortGroups: 'asc' };
    const result = groupRows(SAMPLE_ROWS, config, COLUMNS);
    const header = result.find(r => r.__zentto_group_value__ === 'Alimentos');
    expect(header!.categoria).toBe('Alimentos (3)');
  });
});
