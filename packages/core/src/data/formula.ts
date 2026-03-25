import type { GridRow, FormulaDefinition } from '../types';

/**
 * Formula engine — evaluate Excel-like formulas on grid rows.
 *
 * Supported syntax:
 *   =SUM({field})      — sum of all rows for that field
 *   =AVG({field})       — average
 *   =MIN({field})       — minimum
 *   =MAX({field})       — maximum
 *   =COUNT({field})     — count non-null
 *   ={field1} * {field2} — per-row arithmetic using field references
 *   =ROUND({field}, 2)  — round to N decimals
 *   =IF({field} > 100, "High", "Low") — conditional
 *
 * Field references use {fieldName} syntax.
 * Works per-row (cell formulas) or on all rows (aggregate formulas like SUM).
 */

const AGG_REGEX = /^(SUM|AVG|MIN|MAX|COUNT)\(\{(\w+)\}\)$/i;
const ROUND_REGEX = /^ROUND\((.+),\s*(\d+)\)$/i;
const IF_REGEX = /^IF\((.+),\s*(.+),\s*(.+)\)$/i;
const FIELD_REF = /\{(\w+)\}/g;

/** Evaluate a single formula for one row */
export function evaluateFormula(
  formula: string,
  row: GridRow,
  allRows: GridRow[],
): unknown {
  const expr = formula.startsWith('=') ? formula.slice(1).trim() : formula.trim();

  // Aggregate functions (operate on all rows)
  const aggMatch = expr.match(AGG_REGEX);
  if (aggMatch) {
    const fn = aggMatch[1].toUpperCase();
    const field = aggMatch[2];
    const values = allRows.map(r => Number(r[field]) || 0);
    switch (fn) {
      case 'SUM': return values.reduce((a, b) => a + b, 0);
      case 'AVG': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'MIN': return values.length ? Math.min(...values) : 0;
      case 'MAX': return values.length ? Math.max(...values) : 0;
      case 'COUNT': return allRows.filter(r => r[field] != null && r[field] !== '').length;
    }
  }

  // ROUND
  const roundMatch = expr.match(ROUND_REGEX);
  if (roundMatch) {
    const innerVal = evaluateFormula('=' + roundMatch[1], row, allRows);
    const decimals = parseInt(roundMatch[2], 10);
    return Number(Number(innerVal).toFixed(decimals));
  }

  // IF
  const ifMatch = expr.match(IF_REGEX);
  if (ifMatch) {
    const condition = resolveFieldRefs(ifMatch[1], row);
    const trueVal = ifMatch[2].trim().replace(/^["']|["']$/g, '');
    const falseVal = ifMatch[3].trim().replace(/^["']|["']$/g, '');
    try {
      // Safe eval of simple comparison
      const result = evaluateComparison(condition);
      return result ? trueVal : falseVal;
    } catch {
      return falseVal;
    }
  }

  // Per-row arithmetic: replace {field} with values, then evaluate
  const resolved = resolveFieldRefs(expr, row);
  try {
    // Only allow safe math characters
    if (/^[\d\s+\-*/().]+$/.test(resolved)) {
      return Function(`"use strict"; return (${resolved})`)();
    }
    return resolved;
  } catch {
    return resolved;
  }
}

function resolveFieldRefs(expr: string, row: GridRow): string {
  return expr.replace(FIELD_REF, (_, field) => {
    const val = row[field];
    if (val == null) return '0';
    if (typeof val === 'number') return String(val);
    return String(val);
  });
}

function evaluateComparison(expr: string): boolean {
  // Support: >, <, >=, <=, ==, !=
  const match = expr.match(/^(.+?)\s*(>=|<=|!=|==|>|<)\s*(.+)$/);
  if (!match) return false;
  const left = parseFloat(match[1]);
  const right = parseFloat(match[3]);
  switch (match[2]) {
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '==': return left === right;
    case '!=': return left !== right;
    default: return false;
  }
}

/** Apply formulas to all rows, returns new rows with computed values */
export function applyFormulas(
  rows: GridRow[],
  formulas: FormulaDefinition[],
): GridRow[] {
  if (!formulas.length) return rows;
  return rows.map(row => {
    const newRow = { ...row };
    for (const def of formulas) {
      newRow[def.field] = evaluateFormula(def.formula, row, rows);
    }
    return newRow;
  });
}
