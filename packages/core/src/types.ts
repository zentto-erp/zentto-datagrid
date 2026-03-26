// ─── Core Types — Public API of @zentto/datagrid ─────────────────────────────

/** A single row of data */
export type GridRow = Record<string, unknown>;

/** Aggregation function */
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort model entry */
export interface SortEntry {
  field: string;
  direction: SortDirection;
}

/** Filter operator */
export type FilterOperator =
  | 'contains' | 'notContains'
  | 'equals' | 'notEquals'
  | 'startsWith' | 'endsWith'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'isEmpty' | 'isNotEmpty'
  | 'between' | 'inList';

/** A single filter rule */
export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/** Column definition */
export interface ColumnDef {
  /** Unique field name — maps to row[field] */
  field: string;
  /** Display header */
  header?: string;
  /** Column width in px */
  width?: number;
  /** Flex grow factor */
  flex?: number;
  /** Minimum width */
  minWidth?: number;
  /** Data type. 'actions' renders action buttons instead of data. */
  type?: 'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'actions';
  /** Allow sorting */
  sortable?: boolean;
  /** Allow filtering */
  filterable?: boolean;
  /** Allow resizing */
  resizable?: boolean;
  /** Allow reordering */
  reorderable?: boolean;
  /** Pin to left or right */
  pin?: 'left' | 'right';
  /** Hide on mobile (< 768px) */
  mobileHide?: boolean;
  /** Hide on tablet (< 1024px) */
  tabletHide?: boolean;

  // ─── Aggregation ──────────────────────────────────────
  /** Aggregation for totals row */
  aggregation?: AggregationType;

  // ─── Currency ─────────────────────────────────────────
  /** ISO 4217 currency code or true for default */
  currency?: string | true;

  // ─── Templates (rich cell rendering) ──────────────────
  /** Status chip with color map: { Active: 'success', Inactive: 'error' } */
  statusColors?: Record<string, string>;
  statusVariant?: 'filled' | 'outlined';

  /** Avatar cell: field containing image URL */
  avatarField?: string;
  subtitleField?: string;
  avatarVariant?: 'circular' | 'rounded' | 'square';

  /** Progress bar */
  progressMax?: number;
  progressColor?: string;

  /** Star rating */
  ratingMax?: number;

  /** Country flag (ISO 3166-1 alpha-2 field) */
  flagField?: string;

  /** Link/URL */
  linkField?: string;
  linkTarget?: '_blank' | '_self';

  /** Image/thumbnail */
  imageField?: string;
  imageWidth?: number;
  imageHeight?: number;

  /** Action buttons (only for type: 'actions') */
  actions?: ActionButtonDef[];

  /** Allow grouping by this column */
  groupable?: boolean;

  /** Column group ID */
  columnGroupId?: string;

  /** Custom render function (framework-agnostic: returns HTML string) */
  renderCell?: (value: unknown, row: GridRow) => string;
  /** Custom header render */
  renderHeader?: () => string;

  // ─── Sparkline ──────────────────────────────────────
  /** Sparkline type — renders a mini chart from an array field */
  sparkline?: 'line' | 'bar' | 'area';
  /** Field containing the sparkline data array (defaults to this column's field) */
  sparklineField?: string;
  /** Sparkline color override */
  sparklineColor?: string;
}

/** Column group (multi-level headers) */
export interface ColumnGroup {
  groupId: string;
  header: string;
  children: string[];
}

/** Pivot configuration */
export interface PivotConfig {
  rowField: string;
  columnField: string;
  valueField: string;
  aggregation?: AggregationType;
  showGrandTotals?: boolean;
  showRowTotals?: boolean;
}

/** Row grouping configuration */
export interface RowGroupingConfig {
  field: string;
  showSubtotals?: boolean;
  sortGroups?: SortDirection | null;
}

/** Pagination model */
export interface PaginationModel {
  page: number;
  pageSize: number;
}

/** Grid theme */
export type GridTheme = 'light' | 'dark' | 'zentto';

/** Grid locale */
export type GridLocale = 'es' | 'en' | 'pt';

/** Context menu item */
export interface ContextMenuItem {
  label: string;
  icon?: string; // HTML string or emoji
  action: (params: { row: GridRow; field: string; value: unknown }) => void;
  divider?: boolean;
}

/** Grid event map */
export interface GridEvents {
  'row-click': { row: GridRow; rowIndex: number };
  'cell-click': { row: GridRow; field: string; value: unknown };
  'sort-change': { sorts: SortEntry[] };
  'filter-change': { filters: FilterRule[] };
  'page-change': { page: number; pageSize: number };
  'selection-change': { selectedRows: GridRow[] };
  'column-resize': { field: string; width: number };
  'column-reorder': { fields: string[] };
  'row-expand': { row: GridRow; expanded: boolean };
  'drag-start': { rows: GridRow[]; group?: string };
  'drag-drop': { rows: GridRow[]; sourceGroup?: string; targetGroup?: string };
  'undo': { action: unknown };
  'redo': { action: unknown };
  'paste': { changes: unknown[]; rows: number; cols: number };
  'range-select': { startRow: number; endRow: number; startCol: number; endCol: number };
}

/** Filter panel field definition — declared from React, rendered inside the grid toolbar */
export interface FilterPanelField {
  /** Field name in the row data */
  field: string;
  /** Display label */
  label: string;
  /** Filter type: select (dropdown), multi-select, range slider, text search, date range */
  type: 'select' | 'multi-select' | 'range' | 'text' | 'date-range';
  /** Fixed options (if omitted, auto-generated from data) */
  options?: { value: string; label: string }[];
  /** Default selected value(s) */
  defaultValue?: unknown;
  /** Placeholder text */
  placeholder?: string;
  /** Width in px (for toolbar inline mode) */
  width?: number;
}

/** Header context menu action (emitted as event) */
export interface HeaderMenuAction {
  field: string;
  action: 'sort-asc' | 'sort-desc' | 'clear-sort' | 'hide-column' | 'pin-left' | 'pin-right' | 'unpin' | 'copy-column' | 'auto-size';
}

/** Action button definition for the actions column */
export interface ActionButtonDef {
  icon: string;
  label: string;
  action: string;
  color?: string;
}

/** CRUD API configuration for inline editing */
export interface CrudConfig {
  /** Base URL for CRUD operations (e.g., '/api/v1/articulos') */
  baseUrl: string;
  /** Primary key field name (default: 'id') */
  idField?: string;
  /** Additional headers for API calls */
  headers?: Record<string, string>;
  /** HTTP method overrides */
  methods?: {
    create?: string;  // default POST
    update?: string;  // default PUT
    delete?: string;  // default DELETE
  };
  /** Editable column fields (if omitted, all columns are editable) */
  editableFields?: string[];
  /** Custom transform before sending to API */
  transformPayload?: (row: GridRow, action: 'create' | 'update') => unknown;
}

/** Formula cell definition */
export interface FormulaDefinition {
  /** Target field where formula result goes */
  field: string;
  /** Formula expression: =SUM(price), =A*B, ={field1}*{field2}, =ROUND({total}/1.16, 2) */
  formula: string;
}

/** Full grid options (props for the web component) */
export interface GridOptions {
  columns: ColumnDef[];
  rows: GridRow[];

  // ─── Sorting ──────────────────────────
  sortModel?: SortEntry[];
  multiSort?: boolean;

  // ─── Filtering ────────────────────────
  filters?: FilterRule[];
  enableHeaderFilters?: boolean;
  enableFind?: boolean;
  filterPanel?: FilterPanelField[];

  // ─── Column Visibility ─────────────────
  hiddenColumns?: string[];

  // ─── Pagination ───────────────────────
  pagination?: PaginationModel;
  pageSizeOptions?: number[];
  paginationMode?: 'client' | 'server';
  totalRows?: number;

  // ─── Grouping & Pivot ─────────────────
  enableGrouping?: boolean;
  rowGroupingConfig?: RowGroupingConfig;
  enablePivot?: boolean;
  pivotConfig?: PivotConfig;

  // ─── Aggregation ──────────────────────
  showTotals?: boolean;
  totalsLabel?: string;

  // ─── Selection ────────────────────────
  enableRowSelection?: boolean;
  enableMultiSelect?: boolean;
  enableCellSelection?: boolean;

  // ─── Drag & Drop ───────────────────────
  enableDragDrop?: boolean;
  dragDropGroup?: string;

  // ─── Column Features ──────────────────
  columnGroups?: ColumnGroup[];
  pinnedColumns?: { left?: string[]; right?: string[] };

  // ─── Master-Detail ────────────────────
  enableMasterDetail?: boolean;
  detailRenderer?: (row: GridRow) => string;

  // ─── Clipboard ────────────────────────
  enableClipboard?: boolean;
  enablePaste?: boolean;

  // ─── Context Menu ─────────────────────
  enableContextMenu?: boolean;
  contextMenuItems?: ContextMenuItem[];

  // ─── Status Bar ───────────────────────
  enableStatusBar?: boolean;

  // ─── Export ───────────────────────────
  exportFilename?: string;

  // ─── Appearance ───────────────────────
  theme?: GridTheme;
  locale?: GridLocale;
  defaultCurrency?: string;
  density?: 'compact' | 'standard' | 'comfortable';
  loading?: boolean;
  height?: string | number;

  // ─── Layout Persistence ───────────────
  gridId?: string;

  // ─── Virtual Scroll ────────────────────
  enableVirtualScroll?: boolean;

  // ─── Undo/Redo ─────────────────────────
  enableUndoRedo?: boolean;

  // ─── Range Selection ───────────────────
  enableRangeSelection?: boolean;
}
