// @zentto/datagrid-core — Pure logic engine, zero UI dependencies.

// Types
export type {
  GridRow,
  AggregationType,
  SortDirection,
  SortEntry,
  FilterOperator,
  FilterRule,
  ColumnDef,
  ColumnGroup,
  PivotConfig,
  RowGroupingConfig,
  PaginationModel,
  GridTheme,
  GridLocale,
  ContextMenuItem,
  GridEvents,
  GridOptions,
  FilterPanelField,
  HeaderMenuAction,
  ActionButtonDef,
  CrudConfig,
  FormulaDefinition,
} from './types';

// Data operations
export { sortRows } from './data/sort';
export { filterRows, quickSearch } from './data/filter';
export { aggregate, computeTotals } from './data/aggregate';
export { groupRows } from './data/group';
export type { GroupedResult } from './data/group';
export { pivotRows } from './data/pivot';
export type { PivotResult } from './data/pivot';
export { paginateRows } from './data/paginate';
export type { PaginationResult } from './data/paginate';

// Export
export { toCsv, downloadCsv } from './export/csv';
export { toJson, downloadJson } from './export/json';
export { toExcelHtml, downloadExcel } from './export/excel';
export { toMarkdown, downloadMarkdown } from './export/markdown';

// Search
export { findInGrid } from './search/find';
export type { FindMatch } from './search/find';

// Selection & Clipboard
export { copyToClipboard, copyCellValue } from './selection/clipboard';

// Range Selection
export { normalizeRange, isCellInRange, getRangeSize, extractRangeData, copyRangeToClipboard } from './selection/range-selection';
export type { CellAddress, SelectionRange, NormalizedRange } from './selection/range-selection';

// Clipboard Paste
export { parseClipboardData, applyPasteData } from './selection/paste';
export type { PasteData } from './selection/paste';

// Batch Edit
export { applyBatchEdit } from './data/batch-edit';
export type { BatchChange } from './data/batch-edit';

// Formulas
export { evaluateFormula, applyFormulas } from './data/formula';

// Virtual Scroll
export { calculateVirtualScroll, calculateDynamicVirtualScroll } from './virtualization/virtual-scroll';
export type { VirtualScrollConfig, VirtualScrollResult } from './virtualization/virtual-scroll';

// Undo/Redo
export { UndoRedoStack } from './history/undo-redo';
export type { EditAction } from './history/undo-redo';

// Sparklines
export { processSparklineData, sparklineLinePath, sparklineAreaPath, sparklineBars } from './data/sparkline';
export type { SparklineType, SparklineConfig, SparklineData } from './data/sparkline';

// Layout persistence
export { saveLayout, loadLayout, clearLayout } from './layout/persistence';
export type { GridLayout } from './layout/persistence';
