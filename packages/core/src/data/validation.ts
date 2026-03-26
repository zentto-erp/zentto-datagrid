import type { GridRow, ValidationRule } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/;

/**
 * Validate a value against a ValidationRule.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateValue(
  value: unknown,
  rule: ValidationRule,
  row?: GridRow,
): string | null {
  const str = value == null ? '' : String(value);
  const isEmpty = str.trim() === '';

  // Required check
  if (rule.required && isEmpty) {
    return rule.message ?? 'This field is required';
  }

  // If empty and not required, skip further validation
  if (isEmpty) return null;

  // Type-specific validation
  if (rule.type === 'email') {
    if (!EMAIL_REGEX.test(str)) {
      return rule.message ?? 'Invalid email address';
    }
  }

  if (rule.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      return rule.message ?? 'Must be a valid number';
    }
    if (rule.min != null && num < rule.min) {
      return rule.message ?? `Minimum value is ${rule.min}`;
    }
    if (rule.max != null && num > rule.max) {
      return rule.message ?? `Maximum value is ${rule.max}`;
    }
  }

  if (rule.type === 'date') {
    const d = new Date(str);
    if (isNaN(d.getTime())) {
      return rule.message ?? 'Invalid date';
    }
    if (rule.after) {
      const afterDate = rule.after === 'today' ? startOfDay(new Date()) : new Date(rule.after);
      if (d < afterDate) {
        return rule.message ?? `Date must be after ${rule.after}`;
      }
    }
    if (rule.before) {
      const beforeDate = rule.before === 'today' ? startOfDay(new Date()) : new Date(rule.before);
      if (d > beforeDate) {
        return rule.message ?? `Date must be before ${rule.before}`;
      }
    }
  }

  if (rule.type === 'regex' && rule.pattern) {
    try {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(str)) {
        return rule.message ?? 'Invalid format';
      }
    } catch {
      return 'Invalid validation pattern';
    }
  }

  // Length checks (for any type)
  if (rule.minLength != null && str.length < rule.minLength) {
    return rule.message ?? `Minimum length is ${rule.minLength}`;
  }
  if (rule.maxLength != null && str.length > rule.maxLength) {
    return rule.message ?? `Maximum length is ${rule.maxLength}`;
  }

  // Numeric range checks (for non-type:'number' columns too)
  if (rule.type !== 'number') {
    const num = Number(value);
    if (!isNaN(num)) {
      if (rule.min != null && num < rule.min) {
        return rule.message ?? `Minimum value is ${rule.min}`;
      }
      if (rule.max != null && num > rule.max) {
        return rule.message ?? `Maximum value is ${rule.max}`;
      }
    }
  }

  // Custom validator
  if (rule.type === 'custom' && rule.validate) {
    return rule.validate(value, row ?? {});
  }

  return null;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
