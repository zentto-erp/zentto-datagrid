import type { ConditionalFormatRule } from '../types';

/**
 * Evaluate conditional formatting rules against a cell value.
 * Rules are evaluated in order; all matching styles are merged.
 * Returns merged CSS style object or null if no rules match.
 */
export function evaluateConditionalFormat(
  value: unknown,
  rules: ConditionalFormatRule[],
): Record<string, string> | null {
  if (!rules || rules.length === 0) return null;

  let merged: Record<string, string> | null = null;

  for (const rule of rules) {
    if (matchesCondition(value, rule)) {
      if (!merged) merged = {};
      Object.assign(merged, rule.style);
    }
  }

  return merged;
}

function matchesCondition(value: unknown, rule: ConditionalFormatRule): boolean {
  const { condition, value: ruleValue } = rule;

  switch (condition) {
    case 'isEmpty':
      return value == null || value === '';

    case 'isNotEmpty':
      return value != null && value !== '';

    case 'eq':
      return normalizeCompare(value) === normalizeCompare(ruleValue);

    case 'neq':
      return normalizeCompare(value) !== normalizeCompare(ruleValue);

    case 'gt':
      return toNumber(value) > toNumber(ruleValue);

    case 'gte':
      return toNumber(value) >= toNumber(ruleValue);

    case 'lt':
      return toNumber(value) < toNumber(ruleValue);

    case 'lte':
      return toNumber(value) <= toNumber(ruleValue);

    case 'between': {
      const arr = Array.isArray(ruleValue) ? ruleValue : [];
      if (arr.length < 2) return false;
      const num = toNumber(value);
      return num >= toNumber(arr[0]) && num <= toNumber(arr[1]);
    }

    case 'contains': {
      const str = String(value ?? '').toLowerCase();
      const search = String(ruleValue ?? '').toLowerCase();
      return str.includes(search);
    }

    default:
      return false;
  }
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function normalizeCompare(val: unknown): string | number {
  if (val == null) return '';
  if (typeof val === 'number') return val;
  const n = Number(val);
  if (!isNaN(n) && String(val).trim() !== '') return n;
  return String(val).toLowerCase();
}
