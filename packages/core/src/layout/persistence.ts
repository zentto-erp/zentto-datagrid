/**
 * Layout persistence via localStorage (SYNCHRONOUS).
 *
 * Why localStorage instead of IndexedDB:
 * - localStorage.getItem() is SYNCHRONOUS — reads happen BEFORE the first render
 * - IndexedDB is async — by the time it responds, React/Lit already rendered with defaults
 * - Layout data is small (<5KB per grid) — well within localStorage limits
 */

import type { PivotConfig } from '../types';

const STORAGE_PREFIX = 'zentto-grid-layout:';

export interface GridChartLayout {
  open?: boolean;
  type?: 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'scatter' | 'stacked' | 'combo';
  xField?: string;
  yFields?: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  title?: string;
  showLegend?: boolean;
}

export interface GridLayout {
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
  density?: 'compact' | 'standard' | 'comfortable';
  groupByField?: string;
  groupSort?: 'asc' | 'desc' | '';
  features?: Record<string, boolean | string>;
  theme?: string;
  locale?: string;
  sorts?: Array<{ field: string; direction: string }>;
  pageSize?: number;
  freezeRows?: number;
  freezeCols?: number;
  viewMode?: 'table' | 'form' | 'cards' | 'kanban' | 'chart';
  kanbanField?: string;
  pivotConfig?: PivotConfig;
  chart?: GridChartLayout;
}

/**
 * Save grid layout. SYNCHRONOUS.
 */
export function saveLayout(gridId: string, layout: GridLayout): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + gridId, JSON.stringify(layout));
  } catch {
    // localStorage full or not available (SSR) — silently ignore
  }
}

/**
 * Load grid layout. SYNCHRONOUS — returns immediately.
 */
export function loadLayout(gridId: string): GridLayout | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + gridId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear layout for a grid.
 */
export function clearLayout(gridId: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + gridId);
  } catch {
    // noop
  }
}

// Keep async signatures as aliases for backwards compatibility
export { saveLayout as saveLayoutSync, loadLayout as loadLayoutSync };
