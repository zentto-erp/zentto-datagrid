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
  /** Data type */
  type?: 'string' | 'number' | 'date' | 'datetime' | 'boolean';
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

  /** Allow grouping by this column */
  groupable?: boolean;

  /** Column group ID */
  columnGroupId?: string;

  /** Custom render function (framework-agnostic: returns HTML string) */
  renderCell?: (value: unknown, row: GridRow) => string;
  /** Custom header render */
  renderHeader?: () => string;
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
  enableCellSelection?: boolean;

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
}
