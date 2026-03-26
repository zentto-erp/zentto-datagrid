import { describe, it, expect } from 'vitest';
import { parseClipboardData, applyPasteData } from '../selection/paste';
import type { GridRow } from '../types';

describe('parseClipboardData', () => {
  it('parsea texto tab-separated (Excel)', () => {
    const text = "Nombre\tPrecio\tStock\nArroz\t45\t150\nAceite\t120\t5";
    const result = parseClipboardData(text);
    expect(result.rows).toBe(3);
    expect(result.cols).toBe(3);
    expect(result.values[0]).toEqual(['Nombre', 'Precio', 'Stock']);
    expect(result.values[1]).toEqual(['Arroz', '45', '150']);
  });

  it('parsea texto CSV', () => {
    const text = "Nombre,Precio,Stock\nArroz,45,150";
    const result = parseClipboardData(text);
    expect(result.rows).toBe(2);
    expect(result.cols).toBe(3);
    expect(result.values[0]).toEqual(['Nombre', 'Precio', 'Stock']);
  });

  it('maneja CSV con campos entrecomillados', () => {
    const text = '"Arroz ""Premium""",45,150';
    const result = parseClipboardData(text);
    expect(result.values[0][0]).toBe('Arroz "Premium"');
  });

  it('normaliza line endings \\r\\n', () => {
    const text = "A\tB\r\nC\tD";
    const result = parseClipboardData(text);
    expect(result.rows).toBe(2);
    expect(result.values[0]).toEqual(['A', 'B']);
    expect(result.values[1]).toEqual(['C', 'D']);
  });

  it('maneja texto vacio', () => {
    const result = parseClipboardData('');
    expect(result.rows).toBe(0);
    expect(result.cols).toBe(0);
    expect(result.values).toEqual([]);
  });

  it('maneja texto solo whitespace', () => {
    const result = parseClipboardData('   ');
    expect(result.rows).toBe(0);
  });

  it('elimina linea vacia final', () => {
    const text = "A\tB\nC\tD\n";
    const result = parseClipboardData(text);
    expect(result.rows).toBe(2);
  });

  it('padea filas mas cortas', () => {
    const text = "A\tB\tC\nD";
    const result = parseClipboardData(text);
    expect(result.cols).toBe(3);
    expect(result.values[1]).toEqual(['D', '', '']);
  });

  it('una sola celda', () => {
    const text = "Hola";
    const result = parseClipboardData(text);
    expect(result.rows).toBe(1);
    expect(result.cols).toBe(1);
    expect(result.values[0][0]).toBe('Hola');
  });
});

describe('applyPasteData', () => {
  it('aplica datos a partir de la posicion ancla', () => {
    const rows: Record<string, unknown>[] = [
      { id: 1, nombre: 'Arroz', precio: 45 },
      { id: 2, nombre: 'Aceite', precio: 120 },
      { id: 3, nombre: 'Cafe', precio: 95 },
    ];
    const columns = [
      { field: 'nombre', type: 'string' },
      { field: 'precio', type: 'number' },
    ];
    const pasteData = { values: [['Nuevo', '50'], ['Otro', '60']], rows: 2, cols: 2 };

    const changes = applyPasteData(rows, columns, pasteData, 0, 0);
    expect(changes).toHaveLength(4);
    expect(rows[0].nombre).toBe('Nuevo');
    expect(rows[0].precio).toBe(50);
    expect(rows[1].nombre).toBe('Otro');
    expect(rows[1].precio).toBe(60);
  });

  it('convierte tipo number automaticamente', () => {
    const rows: Record<string, unknown>[] = [{ id: 1, precio: 0 }];
    const columns = [{ field: 'precio', type: 'number' }];
    const pasteData = { values: [['$1,234.56']], rows: 1, cols: 1 };

    applyPasteData(rows, columns, pasteData, 0, 0);
    expect(rows[0].precio).toBe(1234.56);
  });

  it('convierte tipo boolean', () => {
    const rows: Record<string, unknown>[] = [{ id: 1, activo: false }];
    const columns = [{ field: 'activo', type: 'boolean' }];
    const pasteData = { values: [['si']], rows: 1, cols: 1 };

    applyPasteData(rows, columns, pasteData, 0, 0);
    expect(rows[0].activo).toBe(true);
  });

  it('no excede limites de rows', () => {
    const rows: Record<string, unknown>[] = [{ id: 1, nombre: 'A' }];
    const columns = [{ field: 'nombre' }];
    const pasteData = { values: [['X'], ['Y'], ['Z']], rows: 3, cols: 1 };

    const changes = applyPasteData(rows, columns, pasteData, 0, 0);
    expect(changes).toHaveLength(1);
  });

  it('no excede limites de columnas', () => {
    const rows: Record<string, unknown>[] = [{ id: 1, nombre: 'A' }];
    const columns = [{ field: 'nombre' }];
    const pasteData = { values: [['X', 'Y', 'Z']], rows: 1, cols: 3 };

    const changes = applyPasteData(rows, columns, pasteData, 0, 0);
    expect(changes).toHaveLength(1);
  });

  it('registra old y new values en changes', () => {
    const rows: Record<string, unknown>[] = [{ id: 1, nombre: 'Viejo' }];
    const columns = [{ field: 'nombre' }];
    const pasteData = { values: [['Nuevo']], rows: 1, cols: 1 };

    const changes = applyPasteData(rows, columns, pasteData, 0, 0);
    expect(changes[0].oldValue).toBe('Viejo');
    expect(changes[0].newValue).toBe('Nuevo');
  });
});
