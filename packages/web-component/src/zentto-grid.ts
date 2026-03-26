import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  sortRows,
  filterRows,
  quickSearch,
  paginateRows,
  computeTotals,
  groupRows,
  pivotRows,
  downloadCsv,
  downloadJson,
  downloadExcel,
  downloadMarkdown,
  copyToClipboard,
  findInGrid,
  applyFormulas,
  saveLayout,
  loadLayout,
  // v0.2 — new modules
  calculateVirtualScroll,
  UndoRedoStack,
  normalizeRange,
  isCellInRange,
  copyRangeToClipboard,
  parseClipboardData,
  applyPasteData,
  processSparklineData,
  sparklineLinePath,
  sparklineAreaPath,
  sparklineBars,
  AuditTrail,
  generateQrSvg,
  generateBarcodeSvg,
  generateTimelineSvg,
} from '@zentto/datagrid-core';
import type {
  ColumnDef,
  ColumnGroup,
  GridRow,
  SortEntry,
  FilterRule,
  FindMatch,
  FilterPanelField,
  CrudConfig,
  FormulaDefinition,
  PivotConfig,
  VirtualScrollResult,
  EditAction,
  SelectionRange,
  NormalizedRange,
  PasteData,
  SparklineData,
  AuditEntry,
  TimelineEntry,
} from '@zentto/datagrid-core';
import { gridStyles } from './styles/grid-styles';

/**
 * <zentto-grid> — High-performance data grid web component.
 *
 * @example
 * ```html
 * <zentto-grid
 *   columns='[{"field":"name","header":"Nombre"},{"field":"price","header":"Precio","type":"number","currency":"USD"}]'
 *   rows='[{"name":"Widget","price":9.99}]'
 *   show-totals
 *   enable-toolbar
 * ></zentto-grid>
 * ```
 */
export class ZenttoGrid extends LitElement {
  static override styles = gridStyles;

  // ─── Properties (attributes) ──────────────────────────────────

  @property({ type: Array }) columns: ColumnDef[] = [];
  @property({ type: Array }) rows: GridRow[] = [];
  @property({ type: String }) theme: 'light' | 'dark' | 'zentto' = 'light';
  /** BCP 47 locale tag: 'es', 'en', 'pt', 'fr', 'de', 'es-VE', 'en-GB', etc. */
  @property({ type: String }) locale = 'es';
  @property({ type: Boolean, attribute: 'show-totals' }) showTotals = false;
  @property({ type: String, attribute: 'totals-label' }) totalsLabel = 'Totales';
  @property({ type: Boolean, attribute: 'enable-clipboard' }) enableClipboard = false;
  @property({ type: Boolean, attribute: 'enable-find' }) enableFind = false;
  @property({ type: Boolean, attribute: 'enable-quick-search' }) enableQuickSearch = true;
  @property({ type: Boolean, attribute: 'enable-status-bar' }) enableStatusBar = false;
  @property({ type: Boolean, attribute: 'enable-header-filters' }) enableHeaderFilters = false;
  @property({ type: String, attribute: 'default-currency' }) defaultCurrency = 'USD';
  @property({ type: String, attribute: 'export-filename' }) exportFilename = 'export';

  // ─── Layout Persistence (IndexedDB) ─────────────────────────
  /** Unique ID for persisting column layout, density, visibility. If empty, no persistence. */
  @property({ type: String, attribute: 'grid-id' }) gridId = '';
  @property({ type: Array, attribute: 'page-size-options' }) pageSizeOptions = [10, 25, 50, 100];
  @property({ type: Boolean }) loading = false;
  @property({ type: String }) density: 'compact' | 'standard' | 'comfortable' = 'compact';
  @property({ type: String }) height = '500px';

  // ─── View Mode (table, form, cards, kanban) ─────────────────
  @property({ type: String, attribute: 'view-mode' }) viewMode: 'table' | 'form' | 'cards' | 'kanban' = 'table';
  /** Field to group by in Kanban view (must be a status/category field) */
  @property({ type: String, attribute: 'kanban-field' }) kanbanField = '';
  /** Which views to show in the toolbar switcher. Default: all. */
  @property({ type: Boolean, attribute: 'show-view-table' }) showViewTable = true;
  @property({ type: Boolean, attribute: 'show-view-form' }) showViewForm = true;
  @property({ type: Boolean, attribute: 'show-view-cards' }) showViewCards = true;
  @property({ type: Boolean, attribute: 'show-view-kanban' }) showViewKanban = true;

  // ─── Create Button (emits 'create-click' event) ─────────────
  /** Show a "New" button in the toolbar. Emits 'create-click' event. */
  @property({ type: Boolean, attribute: 'enable-create' }) enableCreate = false;
  /** Label for the create button */
  @property({ type: String, attribute: 'create-label' }) createLabel = '';
  /** Icon name for the create button (default: 'add') */
  @property({ type: String, attribute: 'create-icon' }) createIcon = 'add';

  // ─── Toolbar ─────────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-toolbar' }) enableToolbar = true;
  @property({ type: Boolean, attribute: 'show-toolbar-search' }) showToolbarSearch = true;
  @property({ type: Boolean, attribute: 'show-toolbar-columns' }) showToolbarColumns = true;
  @property({ type: Boolean, attribute: 'show-toolbar-density' }) showToolbarDensity = true;
  @property({ type: Boolean, attribute: 'show-toolbar-export' }) showToolbarExport = true;
  @property({ type: Boolean, attribute: 'show-toolbar-filter' }) showToolbarFilter = true;

  // ─── Filter Panel (declarative from React) ───────────────────
  @property({ attribute: false }) filterPanel: FilterPanelField[] = [];
  @property({ type: Boolean, attribute: 'enable-filter-panel' }) enableFilterPanel = false;

  // ─── Master-Detail ─────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-master-detail' }) enableMasterDetail = false;
  @property({ attribute: false }) detailRenderer?: (row: GridRow) => string;
  /** Detail columns for nested table (e.g. invoice items). If set, renders a child zentto-grid. */
  @property({ attribute: false }) detailColumns?: ColumnDef[];
  /** Function that returns detail rows for a given parent row (e.g. row => row.items) */
  @property({ attribute: false }) detailRowsAccessor?: (row: GridRow) => GridRow[];

  // ─── Row Grouping ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-grouping' }) enableGrouping = false;
  @property({ type: String, attribute: 'group-field' }) groupField = '';
  @property({ type: Boolean, attribute: 'group-subtotals' }) groupSubtotals = false;
  @property({ type: String, attribute: 'group-sort' }) groupSort: 'asc' | 'desc' | '' = '';

  // ─── Row Group Drop Zone (drag headers to group) ──────────────
  @property({ type: Boolean, attribute: 'enable-group-drop-zone' }) enableGroupDropZone = false;

  // ─── Pivot Mode ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-pivot' }) enablePivot = false;
  @property({ attribute: false }) pivotConfig?: PivotConfig;

  // ─── Column Pinning ────────────────────────────────────────────
  @property({ attribute: false }) pinnedColumns: { left?: string[]; right?: string[] } = {};

  // ─── Context Menu ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-context-menu' }) enableContextMenu = false;

  // ─── Header Column Menu (three dots) ──────────────────────────
  @property({ type: Boolean, attribute: 'enable-header-menu' }) enableHeaderMenu = true;

  // ─── Column Groups ─────────────────────────────────────────────
  @property({ attribute: false }) columnGroups: ColumnGroup[] = [];

  // ─── Row Selection (checkbox multi-select) ────────────────────
  @property({ type: Boolean, attribute: 'enable-row-selection' }) enableRowSelection = false;

  // ─── Drag & Drop ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-drag-drop' }) enableDragDrop = false;
  @property({ type: String, attribute: 'drag-drop-group' }) dragDropGroup = '';

  // ─── Action Buttons (last column, pinned right) ───────────────
  /** Array of action button definitions: [{ icon: '👁', label: 'Ver', action: 'view' }, ...] */
  @property({ attribute: false }) actionButtons: { icon: string; label: string; action: string; color?: string }[] = [];

  // ─── Icon overrides (frameworks can inject their own icons) ────
  /** Override default icons. Each value is an HTML string (emoji, SVG, or icon font class) */
  @property({ attribute: false }) icons: Partial<Record<string, string>> = {};

  /** SVG icon helper — all defaults are inline SVG 16x16, overrideable via icons prop */
  private _icon(name: string): string {
    const s = (d: string, extra = '') =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
    const defaults: Record<string, string> = {
      clipboard:  s('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
      search:     s('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
      columns:    s('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
      density:    s('<path d="M3 6h18M3 12h18M3 18h18"/>'),
      export:     s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
      filter:     s('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
      close:      s('<path d="M18 6 6 18M6 6l12 12"/>'),
      sortAsc:    s('<path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4l3 8"/><path d="M12.7 17h5.6"/>'),
      sortDesc:   s('<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4l3 8"/><path d="M12.7 9h5.6"/>'),
      pin:        s('<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>'),
      unpin:      s('<path d="M18 6 6 18M6 6l12 12"/>'),
      hide:       s('<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>'),
      copy:       s('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
      copyRow:    s('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
      add:        s('<path d="M12 5v14M5 12h14"/>'),
      delete:     s('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'),
      import:     s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
      menu:       s('<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>'),
      expand:     s('<polyline points="9 18 15 12 9 6"/>'),
      drag:       s('<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>', ' fill="currentColor"'),
      markdown:   s('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>'),
      view:       s('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
      edit:       s('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
      settings:   s('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
      pivot:      s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M14 14l3 3m0-3l-3 3"/>'),
      pinLeft:    s('<polyline points="11 17 6 12 11 7"/><line x1="6" y1="12" x2="18" y2="12"/>'),
      pinRight:   s('<polyline points="13 17 18 12 13 7"/><line x1="6" y1="12" x2="18" y2="12"/>'),
      exportCsv:  s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
      exportExcel:s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/>'),
      exportJson: s('<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1 2 2 2 2 0 0 1-2 2v5a2 2 0 0 1-2 2h-1"/>'),
      viewTable:  s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>'),
      viewForm:   s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="7" x2="17" y2="7"/><line x1="9" y1="12" x2="17" y2="12"/><line x1="9" y1="17" x2="17" y2="17"/><circle cx="6" cy="7" r="0.5" fill="currentColor"/><circle cx="6" cy="12" r="0.5" fill="currentColor"/><circle cx="6" cy="17" r="0.5" fill="currentColor"/>'),
      viewCards:  s('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
      viewKanban: s('<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>'),
      chevronLeft: s('<polyline points="15 18 9 12 15 6"/>'),
      chevronRight:s('<polyline points="9 18 15 12 9 6"/>'),
      // Action aliases (common names)
      visibility: s('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
      cancel:     s('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
      check:      s('<path d="M20 6 9 17l-5-5"/>'),
      save:       s('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>'),
      print:      s('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
      download:   s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
      upload:     s('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
      refresh:    s('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
      lock:       s('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
      unlock:     s('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
      send:       s('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
      approve:    s('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
      reject:     s('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),
      info:       s('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
      warning:    s('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
      money:      s('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
      user:       s('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
      mail:       s('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
      phone:      s('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'),
      calendar:   s('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
      clock:      s('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
      link:       s('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
      attachment: s('<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'),
      star:       s('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
      sparkle:    s('<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z"/>', ' fill="currentColor" stroke="none"'),
      barcodeIcon:s('<rect x="3" y="4" width="2" height="16"/><rect x="7" y="4" width="1" height="16"/><rect x="10" y="4" width="3" height="16"/><rect x="15" y="4" width="1" height="16"/><rect x="18" y="4" width="2" height="16"/>', ' fill="currentColor" stroke="none"'),
      timelineIcon:s('<line x1="3" y1="12" x2="21" y2="12"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>', ' fill="currentColor"'),
      auditIcon:  s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'),
    };
    const iconStr = this.icons[name] ?? defaults[name] ?? '';
    return iconStr;
  }

  /** Render an icon as HTML (supports SVG strings) */
  private _iconHtml(name: string) {
    return unsafeHTML(this._icon(name));
  }

  /** Resolve action button icon: accepts icon name ("edit", "delete", "view"),
   *  full SVG/HTML string, or emoji. Names are resolved via _icon(). */
  private _resolveActionIcon(icon: string): string {
    if (!icon) return '';
    // If it starts with < it's already HTML/SVG — use as-is
    if (icon.trimStart().startsWith('<')) return icon;
    // Try to resolve as a named icon
    const resolved = this._icon(icon);
    if (resolved) return resolved;
    // Fallback: use as-is (emoji or text)
    return icon;
  }

  // ─── Inline Editing / CRUD ────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-editing' }) enableEditing = false;
  @property({ attribute: false }) crudConfig?: CrudConfig;

  // ─── Import (available from toolbar without CRUD mode) ────────
  @property({ type: Boolean, attribute: 'enable-import' }) enableImport = false;

  // ─── Built-in Configurator Panel ──────────────────────────────
  @property({ type: Boolean, attribute: 'enable-configurator' }) enableConfigurator = false;
  /** @deprecated Use enableConfigurator instead */
  @property({ type: Boolean, attribute: 'enable-settings' }) enableSettings = false;

  // ─── Formulas ─────────────────────────────────────────────────
  @property({ attribute: false }) formulas: FormulaDefinition[] = [];

  // ─── v0.2 — Virtual Scroll ──────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-virtual-scroll' }) enableVirtualScroll = false;
  @property({ type: Number, attribute: 'virtual-overscan' }) virtualOverscan = 10;

  // ─── v0.2 — Undo/Redo ──────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-undo-redo' }) enableUndoRedo = false;

  // ─── v0.2 — Range Selection ─────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-range-selection' }) enableRangeSelection = false;

  // ─── v0.2 — Clipboard Paste ─────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-paste' }) enablePaste = false;

  // v0.8 — Audit Trail
  @property({ type: Boolean, attribute: 'enable-audit' }) enableAudit = false;
  @property({ attribute: false }) auditUser?: string;
  @property({ attribute: false }) aiResults: Record<string, string> = {};

  // ─── Internal state ───────────────────────────────────────────

  @state() private _sorts: SortEntry[] = [];
  @state() private _page = 0;
  @state() private _pageSize = 10;
  @state() private _headerFilters: Record<string, string> = {};
  @state() private _quickSearch = '';
  @state() private _findOpen = false;
  @state() private _findQuery = '';
  @state() private _findMatches: FindMatch[] = [];
  @state() private _findIdx = 0;

  // Master-Detail state
  @state() private _expandedRows: Set<string> = new Set();

  // Row Grouping state
  @state() private _expandedGroups: Set<string> = new Set();
  @state() private _groupDropOver = false;
  @state() private _groupFields: string[] = [];

  // Configurator panel state
  @state() private _configOpen = false;
  @state() private _formIndex = 0; // Current record index in form view
  @state() private _configTab: 'features' | 'pivot' | 'groups' | 'appearance' | 'code' = 'features';

  // Context Menu state
  @state() private _contextMenu: { x: number; y: number; row: GridRow; field: string; value: unknown } | null = null;

  // Column Resize state
  @state() private _columnWidths: Record<string, number> = {};
  private _resizing: { field: string; startX: number; startWidth: number } | null = null;

  // Toolbar panels state
  @state() private _showColumnsPanel = false;
  @state() private _showDensityPanel = false;
  @state() private _showExportPanel = false;
  @state() private _showFilterPanel = false;

  // Column visibility (hidden columns)
  @state() private _hiddenColumns: Set<string> = new Set();

  // Filter panel values
  @state() private _filterPanelValues: Record<string, unknown> = {};

  // Header context menu
  @state() private _headerMenu: { x: number; y: number; field: string } | null = null;

  // Row selection state
  @state() private _selectedRows: Set<string> = new Set();
  private _lastSelectedIdx = -1;

  // Drag & drop state
  @state() private _dragOverIdx = -1;
  private _dragRows: GridRow[] = [];

  // Editing state
  @state() private _editingCell: { rowKey: string; field: string } | null = null;
  @state() private _editValue = '';
  @state() private _newRowDraft: GridRow | null = null;

  // Active cell (Excel-like navigation)
  @state() private _activeCell: { rowIdx: number; colIdx: number } | null = null;

  // v0.2 — Virtual Scroll state
  @state() private _scrollTop = 0;
  @state() private _viewportHeight = 400;

  // v0.2 — Undo/Redo
  private _undoRedoStack = new UndoRedoStack(200);

  private _auditTrail = new AuditTrail();
  private _aiCache = new Map<string, string>();
  @state() private _aiLoading = new Set<string>();

  // v0.2 — Range Selection state
  @state() private _rangeAnchor: { rowIdx: number; colIdx: number } | null = null;
  @state() private _rangeEnd: { rowIdx: number; colIdx: number } | null = null;
  @state() private _isRangeSelecting = false;

  // Date picker state
  @state() private _datePickerOpen = false;
  @state() private _datePickerMonth = new Date();

  // ─── i18n helper ────────────────────────────────────────────
  /** i18n helper — uses locale prefix to pick translation. Falls back to English. */
  private _t(es: string, en: string): string {
    const lang = this.locale.split('-')[0]; // 'es-VE' → 'es'
    return lang === 'es' ? es : lang === 'pt' ? es : en; // PT uses ES as fallback (similar)
  }

  // ─── Computed data ────────────────────────────────────────────

  private get _filteredRows(): GridRow[] {
    // Apply formulas first
    let result = this.formulas.length > 0 ? applyFormulas(this.rows, this.formulas) : [...this.rows];

    // Apply quick search (global text filter across all columns)
    if (this._quickSearch.trim()) {
      result = quickSearch(result, this._quickSearch.trim());
    }

    // Apply filter panel values
    for (const [field, val] of Object.entries(this._filterPanelValues)) {
      if (val == null || val === '' || val === '__all__') continue;
      const fpDef = this.filterPanel.find(f => f.field === field);

      if (fpDef?.type === 'multi-select' && Array.isArray(val) && val.length > 0) {
        result = filterRows(result, [{ field, operator: 'inList', value: val }]);
      } else if (fpDef?.type === 'range' && Array.isArray(val)) {
        const [lo, hi] = val;
        if (lo != null && lo !== '') result = filterRows(result, [{ field, operator: 'gte', value: Number(lo) }]);
        if (hi != null && hi !== '') result = filterRows(result, [{ field, operator: 'lte', value: Number(hi) }]);
      } else if (fpDef?.type === 'text') {
        result = filterRows(result, [{ field, operator: 'contains', value: String(val) }]);
      } else {
        // select — exact match
        result = filterRows(result, [{ field, operator: 'equals', value: val }]);
      }
    }

    // Apply header filters
    const filterRules: FilterRule[] = [];
    for (const [field, val] of Object.entries(this._headerFilters)) {
      if (!val) continue;
      const col = this.columns.find((c) => c.field === field);
      if (col?.type === 'number') {
        const match = val.match(/^([><=!]+)?\s*(.+)$/);
        if (match) {
          const op = match[1] || '=';
          const opMap: Record<string, string> = { '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte', '=': 'equals', '!=': 'notEquals' };
          filterRules.push({ field, operator: (opMap[op] || 'gte') as FilterRule['operator'], value: Number(match[2]) });
        }
      } else {
        filterRules.push({ field, operator: 'contains', value: val });
      }
    }
    if (filterRules.length) result = filterRows(result, filterRules);

    return result;
  }

  private get _sortedRows(): GridRow[] {
    return sortRows(this._filteredRows, this._sorts);
  }

  private get _paginatedResult() {
    return paginateRows(this._sortedRows, { page: this._page, pageSize: this._pageSize });
  }

  private get _groupedRows(): GridRow[] {
    if (this.enableGrouping && this.groupField) {
      const grouped = groupRows(this._sortedRows, {
        field: this.groupField,
        showSubtotals: this.groupSubtotals,
        sortGroups: (this.groupSort as 'asc' | 'desc') || null,
      }, this.columns);
      const result: GridRow[] = [];
      let currentGroup: string | null = null;
      let groupExpanded = true;
      for (const row of grouped) {
        if (row['__zentto_group__']) {
          currentGroup = String(row['__zentto_group_value__']);
          groupExpanded = this._expandedGroups.has(currentGroup);
          result.push(row);
        } else if (row['__zentto_subtotal__']) {
          if (groupExpanded) result.push(row);
        } else {
          if (groupExpanded) result.push(row);
        }
      }
      return result;
    }
    return this._sortedRows;
  }

  // ─── Pivot result (computed) ──────────────────────────────────
  private get _pivotResult() {
    if (!this.enablePivot || !this.pivotConfig) return null;
    const { rowField, columnField, valueField } = this.pivotConfig;
    if (!rowField || !columnField || !valueField) return null;
    return pivotRows(this._filteredRows, this.pivotConfig);
  }

  private get _displayRows(): GridRow[] {
    // Pivot mode overrides everything
    if (this._pivotResult) {
      return this._pivotResult.rows;
    }

    let source: GridRow[];
    if (this.enableGrouping && this.groupField) {
      source = this._groupedRows;
    } else if (this.enableVirtualScroll) {
      // Virtual scroll — return slice from sorted rows
      const vs = this._virtualScrollResult;
      if (vs) {
        source = this._sortedRows.slice(vs.startIndex, vs.endIndex);
      } else {
        source = this._paginatedResult.rows;
      }
    } else {
      source = this._paginatedResult.rows;
    }
    if (this.showTotals && !(this.enableGrouping && this.groupField) && !this.enableVirtualScroll) {
      const totals = computeTotals(this._sortedRows, this.columns, this.totalsLabel);
      return [...source, totals];
    }
    return source;
  }

  // ─── Active filter count ────────────────────────────────────────
  private get _activeFilterCount(): number {
    let count = 0;
    for (const val of Object.values(this._filterPanelValues)) {
      if (val != null && val !== '' && val !== '__all__') {
        if (Array.isArray(val) && val.length === 0) continue;
        count++;
      }
    }
    return count;
  }

  // ─── Visible columns (respecting hidden + pivot) ────────────────
  private get _visibleColumns(): ColumnDef[] {
    // Pivot mode replaces columns entirely
    if (this._pivotResult) {
      return this._pivotResult.columns;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return this.columns.filter(c => {
      if (c.field.startsWith('__')) return false;
      if (this._hiddenColumns.has(c.field)) return false;
      if (isMobile && c.mobileHide) return false;
      return true;
    });
  }

  // ─── Filter panel: auto-generate options from data ──────────────
  private _getFilterOptions(field: string): { value: string; label: string }[] {
    const fpDef = this.filterPanel.find(f => f.field === field);
    if (fpDef?.options) return fpDef.options;

    // Auto-generate from unique values in data
    const unique = new Set<string>();
    for (const row of this.rows) {
      const v = row[field];
      if (v != null && v !== '') unique.add(String(v));
    }
    return [...unique].sort().map(v => ({ value: v, label: v }));
  }

  // ─── Event dispatchers ────────────────────────────────────────

  private _dispatchGridEvent(name: string, detail: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  // ─── Sort handler ─────────────────────────────────────────────

  private _handleSort(field: string) {
    const col = this.columns.find((c) => c.field === field);
    if (!col?.sortable) return;

    const existing = this._sorts.find((s) => s.field === field);
    if (!existing) {
      this._sorts = [{ field, direction: 'asc' }];
    } else if (existing.direction === 'asc') {
      this._sorts = [{ field, direction: 'desc' }];
    } else {
      this._sorts = [];
    }
    this._dispatchGridEvent('sort-change', { sorts: this._sorts });
  }

  private _getSortIcon(field: string): string {
    const entry = this._sorts.find((s) => s.field === field);
    if (!entry) return '';
    return entry.direction === 'asc' ? ' \u2191' : ' \u2193';
  }

  // ─── Pagination ───────────────────────────────────────────────

  private _handlePageSizeChange(e: Event) {
    this._pageSize = Number((e.target as HTMLSelectElement).value);
    this._page = 0;
  }

  private _prevPage() { if (this._page > 0) this._page--; }
  private _nextPage() { if (this._page < this._paginatedResult.totalPages - 1) this._page++; }

  // ─── Header filters ──────────────────────────────────────────

  private _handleFilterChange(field: string, value: string) {
    this._headerFilters = { ...this._headerFilters, [field]: value };
    this._page = 0;
  }

  // ─── Find ─────────────────────────────────────────────────────

  private _handleFindKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this._findOpen = false;
      this._findQuery = '';
      this._findMatches = [];
    }
    if (e.key === 'Enter') {
      this._findIdx = (this._findIdx + 1) % Math.max(1, this._findMatches.length);
    }
  }

  private _updateFind(query: string) {
    this._findQuery = query;
    this._findMatches = findInGrid(this._sortedRows, this.columns, query);
    this._findIdx = 0;
  }

  // ─── Clipboard ────────────────────────────────────────────────

  private async _copyAll() {
    await copyToClipboard(this._sortedRows, this.columns);
  }

  // ─── Export ───────────────────────────────────────────────────

  private _exportCsv() { downloadCsv(this._sortedRows, this.columns, this.exportFilename); this._showExportPanel = false; }
  private _exportJson() { downloadJson(this._sortedRows, this.columns, this.exportFilename); this._showExportPanel = false; }
  private _exportExcel() { downloadExcel(this._sortedRows, this.columns, this.exportFilename); this._showExportPanel = false; }
  private _exportMarkdown() { downloadMarkdown(this._sortedRows, this.columns, this.exportFilename); this._showExportPanel = false; }

  // ─── Master-Detail ──────────────────────────────────────────────

  private _toggleRowExpand(row: GridRow) {
    // On mobile, open detail in a slide-over drawer instead of inline
    if (this._isMobile) {
      this._openDetailDrawer(row);
      this._dispatchGridEvent('row-expand', { row, expanded: true });
      return;
    }
    const key = String(row['id'] ?? JSON.stringify(row));
    const next = new Set(this._expandedRows);
    if (next.has(key)) next.delete(key); else next.add(key);
    this._expandedRows = next;
    this._dispatchGridEvent('row-expand', { row, expanded: next.has(key) });
  }

  private _isRowExpanded(row: GridRow): boolean {
    const key = String(row['id'] ?? JSON.stringify(row));
    return this._expandedRows.has(key);
  }

  // ─── Row Grouping ─────────────────────────────────────────────

  private _toggleGroup(groupValue: string) {
    const next = new Set(this._expandedGroups);
    if (next.has(groupValue)) next.delete(groupValue); else next.add(groupValue);
    this._expandedGroups = next;
  }

  private _isGroupExpanded(groupValue: string): boolean {
    return this._expandedGroups.has(groupValue);
  }

  // ─── Drag-to-Group (header drag → group drop zone) ──────────

  private _handleHeaderDragStart(e: DragEvent, field: string) {
    e.dataTransfer?.setData('text/plain', field);
    e.dataTransfer!.effectAllowed = 'move';
  }

  private _handleGroupDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this._groupDropOver = true;
  }

  private _handleGroupDragLeave() {
    this._groupDropOver = false;
  }

  private _handleGroupDrop(e: DragEvent) {
    e.preventDefault();
    this._groupDropOver = false;
    const field = e.dataTransfer?.getData('text/plain');
    if (field && this.columns.some(c => c.field === field) && !this._groupFields.includes(field)) {
      this._groupFields = [...this._groupFields, field];
      this.enableGrouping = true;
      this.groupField = field;
      this.groupSubtotals = true;
      this._initGroups();
      this._dispatchGridEvent('group-change', { groupFields: this._groupFields, activeField: field });
    }
  }

  private _removeGroupField(field: string) {
    this._groupFields = this._groupFields.filter(f => f !== field);
    if (this._groupFields.length > 0) {
      this.groupField = this._groupFields[this._groupFields.length - 1];
      this._initGroups();
    } else {
      this._clearGrouping();
    }
    this._dispatchGridEvent('group-change', { groupFields: this._groupFields, activeField: this.groupField });
  }

  private _clearGrouping() {
    this._groupFields = [];
    this.groupField = '';
    this.enableGrouping = false;
    this._expandedGroups = new Set();
    this._dispatchGridEvent('group-change', { groupFields: [], activeField: '' });
  }

  // ─── Context Menu (cell) ──────────────────────────────────────

  private _handleContextMenu(e: MouseEvent, row: GridRow, field: string, value: unknown) {
    if (!this.enableContextMenu) return;
    e.preventDefault();
    // Position relative to the grid container, not the cell
    const container = this.shadowRoot?.querySelector('.zg-container');
    const rect = container?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.offsetX;
    const y = rect ? e.clientY - rect.top : e.offsetY;
    this._contextMenu = { x, y, row, field, value };
  }

  private _closeContextMenu() { this._contextMenu = null; }

  private async _contextCopyCell() {
    if (this._contextMenu) await navigator.clipboard.writeText(String(this._contextMenu.value ?? ''));
    this._closeContextMenu();
  }

  private async _contextCopyRow() {
    if (this._contextMenu) {
      const row = this._contextMenu.row;
      const text = this.columns.filter(c => !c.field.startsWith('__')).map(c => `${c.header || c.field}: ${row[c.field] ?? ''}`).join('\n');
      await navigator.clipboard.writeText(text);
    }
    this._closeContextMenu();
  }

  private _contextExportCsv() { this._exportCsv(); this._closeContextMenu(); }

  private _contextPinLeft() {
    if (!this._contextMenu) return;
    const field = this._contextMenu.field;
    const left = [...(this.pinnedColumns.left || [])];
    if (!left.includes(field)) left.push(field);
    this.pinnedColumns = { ...this.pinnedColumns, left };
    this._closeContextMenu();
  }

  private _contextPinRight() {
    if (!this._contextMenu) return;
    const field = this._contextMenu.field;
    const right = [...(this.pinnedColumns.right || [])];
    if (!right.includes(field)) right.push(field);
    this.pinnedColumns = { ...this.pinnedColumns, right };
    this._closeContextMenu();
  }

  private _contextUnpin() {
    if (!this._contextMenu) return;
    const field = this._contextMenu.field;
    const left = (this.pinnedColumns.left || []).filter(f => f !== field);
    const right = (this.pinnedColumns.right || []).filter(f => f !== field);
    this.pinnedColumns = { left, right };
    this._closeContextMenu();
  }

  private _contextFilterByValue() {
    if (!this._contextMenu) return;
    const { field, value } = this._contextMenu;
    this._headerFilters = { ...this._headerFilters, [field]: String(value ?? '') };
    this._page = 0;
    this._closeContextMenu();
  }

  private _contextExportVisible() {
    downloadCsv(this._filteredRows, this._visibleColumns, this.exportFilename + '-visible');
    this._closeContextMenu();
  }

  // ─── Row Selection ─────────────────────────────────────────────

  private _getRowKey(row: GridRow): string {
    return String(row['id'] ?? JSON.stringify(row));
  }

  private _isRowSelected(row: GridRow): boolean {
    return this._selectedRows.has(this._getRowKey(row));
  }

  private get _allSelected(): boolean {
    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    return displayRows.length > 0 && displayRows.every(r => this._isRowSelected(r));
  }

  private _toggleSelectAll() {
    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    if (this._allSelected) {
      this._selectedRows = new Set();
    } else {
      this._selectedRows = new Set(displayRows.map(r => this._getRowKey(r)));
    }
    this._emitSelectionChange();
  }

  private _toggleRowSelect(row: GridRow, idx: number, e: MouseEvent) {
    const key = this._getRowKey(row);
    const next = new Set(this._selectedRows);

    if (e.shiftKey && this._lastSelectedIdx >= 0) {
      // Shift+click: select range
      const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
      const start = Math.min(this._lastSelectedIdx, idx);
      const end = Math.max(this._lastSelectedIdx, idx);
      for (let i = start; i <= end; i++) {
        if (displayRows[i]) next.add(this._getRowKey(displayRows[i]));
      }
    } else {
      if (next.has(key)) next.delete(key); else next.add(key);
    }

    this._selectedRows = next;
    this._lastSelectedIdx = idx;
    this._emitSelectionChange();
  }

  private _emitSelectionChange() {
    const allRows = this._displayRows.filter(r => !r['__zentto_totals__']);
    const selected = allRows.filter(r => this._selectedRows.has(this._getRowKey(r)));
    this._dispatchGridEvent('selection-change', { selectedRows: selected, count: selected.length });
  }

  /** Expose selected rows as public getter for React interop */
  get selectedRows(): GridRow[] {
    return this._displayRows.filter(r => !r['__zentto_totals__'] && this._selectedRows.has(this._getRowKey(r)));
  }

  // ─── Drag & Drop ──────────────────────────────────────────────

  private _handleDragStart(e: DragEvent, row: GridRow) {
    if (!this.enableDragDrop) return;
    // Drag all selected rows, or just this one
    const rows = this._selectedRows.size > 0 && this._isRowSelected(row)
      ? this.selectedRows
      : [row];
    this._dragRows = rows;

    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('application/zentto-grid', JSON.stringify({
      group: this.dragDropGroup,
      rows,
    }));
    this._dispatchGridEvent('drag-start', { rows, group: this.dragDropGroup });
  }

  private _handleDragOver(e: DragEvent, idx: number) {
    if (!this.enableDragDrop) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this._dragOverIdx = idx;
  }

  private _handleDragLeave() {
    this._dragOverIdx = -1;
  }

  private _handleDrop(e: DragEvent) {
    if (!this.enableDragDrop) return;
    e.preventDefault();
    this._dragOverIdx = -1;

    try {
      const data = JSON.parse(e.dataTransfer!.getData('application/zentto-grid'));
      this._dispatchGridEvent('drag-drop', {
        rows: data.rows,
        sourceGroup: data.group,
        targetGroup: this.dragDropGroup,
      });
    } catch { /* ignore invalid drag data */ }
  }

  // ─── Action Buttons ───────────────────────────────────────────

  private _handleAction(action: string, row: GridRow) {
    this._dispatchGridEvent('action-click', { action, row });
  }

  // ─── Inline Editing (Excel-like behavior) ──────────────────────

  private _isEditable(field: string): boolean {
    if (!this.enableEditing) return false;
    // No editing in pivot mode
    if (this._pivotResult) return false;
    if (this.crudConfig?.editableFields) return this.crudConfig.editableFields.includes(field);
    return true;
  }

  /** Click on a cell → select it (active cell). Works always, not just in edit mode. */
  private _handleCellClick(_row: GridRow, field: string, rowIdx: number) {
    const colIdx = this._visibleColumns.findIndex(c => c.field === field);
    if (colIdx < 0) return;
    this._activeCell = { rowIdx, colIdx };
  }

  private _startEdit(row: GridRow, field: string) {
    if (!this._isEditable(field)) return;
    this._editingCell = { rowKey: this._getRowKey(row), field };
    this._editValue = String(row[field] ?? '');
    // Initialize date picker month from current value
    const col = this.columns.find(c => c.field === field);
    if (col?.type === 'date' || col?.type === 'datetime') {
      const d = row[field] ? new Date(String(row[field])) : new Date();
      this._datePickerMonth = isNaN(d.getTime()) ? new Date() : d;
    }
  }

  /** Start editing active cell */
  private _editActiveCell() {
    if (!this._activeCell) return;
    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const row = displayRows[this._activeCell.rowIdx];
    const col = this._visibleColumns[this._activeCell.colIdx];
    if (row && col && this._isEditable(col.field)) {
      this._startEdit(row, col.field);
    }
  }

  /** Move active cell by delta */
  /** Move active cell by delta — navigates visible non-pinned columns */
  private _moveActiveCell(dRow: number, dCol: number) {
    if (!this._activeCell) return;
    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const allCols = this._visibleColumns;
    // Only navigate non-pinned columns
    const navigable = allCols.filter(c => !this._isPinned(c.field));
    let { rowIdx } = this._activeCell;
    // Map current colIdx to navigable index
    const currentField = allCols[this._activeCell.colIdx]?.field;
    let navIdx = navigable.findIndex(c => c.field === currentField);
    if (navIdx < 0) navIdx = 0;

    navIdx += dCol;
    rowIdx += dRow;
    // Wrap columns
    if (navIdx >= navigable.length) { navIdx = 0; rowIdx++; }
    if (navIdx < 0) { navIdx = navigable.length - 1; rowIdx--; }
    // Clamp rows
    rowIdx = Math.max(0, Math.min(rowIdx, displayRows.length - 1));
    // Map navigable index back to visible column index
    const targetField = navigable[navIdx]?.field;
    const colIdx = allCols.findIndex(c => c.field === targetField);
    this._activeCell = { rowIdx, colIdx: colIdx >= 0 ? colIdx : 0 };
  }

  private _handleEditKeydown(e: KeyboardEvent, row: GridRow) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._commitEdit(row);
      // Move down
      this._moveActiveCell(1, 0);
      this._editActiveCell();
    } else if (e.key === 'Escape') {
      this._editingCell = null;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this._commitEdit(row);
      // Move right (Shift+Tab = left)
      this._moveActiveCell(0, e.shiftKey ? -1 : 1);
      this._editActiveCell();
    }
  }

  /** Grid-level keyboard handler for Excel-like navigation (works always, not just edit mode) */
  private _handleGridKeydown(e: KeyboardEvent) {
    if (!this._activeCell) return;
    if (this._editingCell) return; // Let edit input handle its own keys

    const { key } = e;

    // Arrow navigation — always works
    if (key === 'ArrowDown') { e.preventDefault(); this._moveActiveCell(1, 0); }
    else if (key === 'ArrowUp') { e.preventDefault(); this._moveActiveCell(-1, 0); }
    else if (key === 'ArrowRight') { e.preventDefault(); this._moveActiveCell(0, 1); }
    else if (key === 'ArrowLeft') { e.preventDefault(); this._moveActiveCell(0, -1); }
    else if (key === 'Tab') { e.preventDefault(); this._moveActiveCell(0, e.shiftKey ? -1 : 1); }
    else if (key === 'Enter') {
      e.preventDefault();
      if (this.enableEditing) {
        // In edit mode: Enter starts editing the active cell
        this._editActiveCell();
      } else {
        // In read-only mode: Enter moves down
        this._moveActiveCell(1, 0);
      }
    }
    else if (key === 'F2' && this.enableEditing) { e.preventDefault(); this._editActiveCell(); }
    // Type to edit: any printable character starts editing (only in edit mode)
    else if (this.enableEditing && key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this._editActiveCell();
    }
  }

  private async _commitEdit(row: GridRow) {
    if (!this._editingCell) return;
    const { rowKey, field } = this._editingCell;
    this._editingCell = null; // Clear immediately to prevent double-commit

    const col = this.columns.find(c => c.field === field);
    const newValue = col?.type === 'number' ? Number(this._editValue) : this._editValue;

    // Find the actual current row by key (not the stale render reference)
    const currentRow = this.rows.find(r => this._getRowKey(r) === rowKey);
    if (!currentRow) return;

    const oldValue = currentRow[field];
    if (newValue === oldValue) return;

    // Push undo action
    this._pushUndoAction({ type: 'cell-edit', timestamp: Date.now(), rowKey, field, oldValue, newValue });

    // v0.8 — Audit trail
    if (this.enableAudit) {
      const ae: AuditEntry = { field, rowKey, oldValue, newValue, user: this.auditUser || 'unknown', timestamp: Date.now() };
      this._auditTrail.record(ae);
      this._dispatchGridEvent('audit-change', { entry: ae, history: this._auditTrail.getHistory(rowKey, field) });
      this.requestUpdate();
    }

    // Update local data — create new array for Lit reactivity
    const updatedRow = { ...currentRow, [field]: newValue };
    const idField = this.crudConfig?.idField || 'id';
    this.rows = [...this.rows.map(r => this._getRowKey(r) === rowKey ? updatedRow : r)];

    // Call API if configured
    if (this.crudConfig?.baseUrl) {
      try {
        const method = this.crudConfig.methods?.update || 'PUT';
        const url = `${this.crudConfig.baseUrl}/${currentRow[idField]}`;
        const payload = this.crudConfig.transformPayload
          ? this.crudConfig.transformPayload(updatedRow, 'update')
          : updatedRow;

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...(this.crudConfig.headers || {}) },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this._dispatchGridEvent('crud-update', { row: updatedRow, field, oldValue, newValue, success: true });
      } catch (err) {
        this._dispatchGridEvent('crud-error', { action: 'update', row: updatedRow, error: err });
        // Rollback
        this.rows = [...this.rows.map(r => this._getRowKey(r) === rowKey ? currentRow : r)];
      }
    } else {
      this._dispatchGridEvent('cell-edit', { row: updatedRow, field, oldValue, newValue });
    }
  }

  /** Public method: add new empty row (callable from any framework) */
  addRow(defaults: GridRow = {}) {
    const newRow: GridRow = { ...defaults };
    if (!newRow['id']) newRow['id'] = `__new_${Date.now()}`;
    // Fill defaults for all columns
    for (const col of this.columns) {
      if (newRow[col.field] == null) newRow[col.field] = '';
    }
    this.rows = [newRow, ...this.rows];
    this._newRowDraft = newRow;
    this._dispatchGridEvent('row-add', { row: newRow });
    // Auto-start editing first editable cell
    const firstEditable = this.columns.find(c => this._isEditable(c.field));
    if (firstEditable) {
      setTimeout(() => this._startEdit(newRow, firstEditable.field), 50);
    }
  }

  /** Public method: delete selected rows */
  async deleteSelected() {
    const selected = this.selectedRows;
    if (!selected.length) return;

    const idField = this.crudConfig?.idField || 'id';

    if (this.crudConfig?.baseUrl) {
      for (const row of selected) {
        try {
          const method = this.crudConfig.methods?.delete || 'DELETE';
          const url = `${this.crudConfig.baseUrl}/${row[idField]}`;
          const res = await fetch(url, {
            method,
            headers: this.crudConfig.headers || {},
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          this._dispatchGridEvent('crud-error', { action: 'delete', row, error: err });
          return;
        }
      }
    }

    const keys = new Set(selected.map(r => this._getRowKey(r)));
    this.rows = this.rows.filter(r => !keys.has(this._getRowKey(r)));
    this._selectedRows = new Set();
    this._dispatchGridEvent('crud-delete', { rows: selected, count: selected.length });
  }

  /** Public method: save new row to API */
  async saveNewRow(row: GridRow) {
    if (!this.crudConfig?.baseUrl) {
      this._dispatchGridEvent('row-save', { row });
      return;
    }

    try {
      const method = this.crudConfig.methods?.create || 'POST';
      const payload = this.crudConfig.transformPayload
        ? this.crudConfig.transformPayload(row, 'create')
        : row;
      const res = await fetch(this.crudConfig.baseUrl, {
        method,
        headers: { 'Content-Type': 'application/json', ...(this.crudConfig.headers || {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      // Replace draft with saved version
      this.rows = this.rows.map(r => this._getRowKey(r) === this._getRowKey(row) ? { ...row, ...saved } : r);
      this._newRowDraft = null;
      this._dispatchGridEvent('crud-create', { row: saved, success: true });
    } catch (err) {
      this._dispatchGridEvent('crud-error', { action: 'create', row, error: err });
    }
  }

  // ─── Date Picker (inline calendar for date fields) ──────────────

  private _renderDateEditor(row: GridRow, col: ColumnDef) {
    // Parse current value
    const current = this._editValue ? new Date(this._editValue) : null;
    const viewMonth = this._datePickerMonth;
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    // Build calendar grid
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = this.locale === 'es'
      ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = this.locale === 'es'
      ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const selectDate = (day: number | null) => {
      if (!day) return;
      const d = new Date(year, month, day);
      this._editValue = d.toISOString().split('T')[0];
      this._commitEdit(row);
    };

    const clearDate = () => {
      this._editValue = '';
      this._commitEdit(row);
    };

    const prevMonth = () => {
      this._datePickerMonth = new Date(year, month - 1, 1);
    };

    const nextMonth = () => {
      this._datePickerMonth = new Date(year, month + 1, 1);
    };

    const isSelected = (day: number) => {
      if (!current || isNaN(current.getTime())) return false;
      return current.getFullYear() === year && current.getMonth() === month && current.getDate() === day;
    };

    const isToday = (day: number) => {
      return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    return html`
      <div class="zg-datepicker" @click=${(e: Event) => e.stopPropagation()}>
        <div class="zg-datepicker-header">
          <button class="zg-datepicker-nav" @click=${prevMonth}>${this._iconHtml('pinLeft')}</button>
          <span class="zg-datepicker-title">${monthNames[month]} ${year}</span>
          <button class="zg-datepicker-nav" @click=${nextMonth}>${this._iconHtml('pinRight')}</button>
        </div>
        <div class="zg-datepicker-days">
          ${dayNames.map(d => html`<span class="zg-datepicker-dayname">${d}</span>`)}
          ${days.map(d => d ? html`
            <button class="zg-datepicker-day ${isSelected(d) ? 'zg-datepicker-day--selected' : ''} ${isToday(d) ? 'zg-datepicker-day--today' : ''}"
                    @click=${() => selectDate(d)}>${d}</button>
          ` : html`<span class="zg-datepicker-day--empty"></span>`)}
        </div>
        <div class="zg-datepicker-footer">
          <button class="zg-datepicker-btn" @click=${() => selectDate(today.getDate())}>${this._t('Hoy', 'Today')}</button>
          <button class="zg-datepicker-btn zg-datepicker-btn--clear" @click=${clearDate}>${this._t('Borrar', 'Clear')}</button>
          <button class="zg-datepicker-btn" @click=${() => { this._editingCell = null; }}>${this._t('Cancelar', 'Cancel')}</button>
        </div>
      </div>
    `;
  }

  // ─── Import (Excel/JSON/CSV) ──────────────────────────────────

  private _handleImportClick() {
    const input = this.shadowRoot?.querySelector('.zg-import-file') as HTMLInputElement;
    if (input) input.click();
  }

  private async _handleFileImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    let importedRows: GridRow[] = [];

    try {
      if (ext === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        importedRows = Array.isArray(data) ? data : data.rows || data.data || [];
      } else if (ext === 'csv') {
        const text = await file.text();
        importedRows = this._parseCsv(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        importedRows = await this._parseExcel(file);
      }

      if (importedRows.length === 0) {
        this._dispatchGridEvent('import-error', { message: 'No se encontraron datos en el archivo.' });
        return;
      }

      // If CRUD API configured, send to server
      if (this.crudConfig?.baseUrl) {
        this._dispatchGridEvent('import-start', { rows: importedRows, count: importedRows.length });
        let successCount = 0;
        for (const row of importedRows) {
          try {
            const method = this.crudConfig.methods?.create || 'POST';
            const payload = this.crudConfig.transformPayload
              ? this.crudConfig.transformPayload(row, 'create')
              : row;
            const res = await fetch(this.crudConfig.baseUrl, {
              method,
              headers: { 'Content-Type': 'application/json', ...(this.crudConfig.headers || {}) },
              body: JSON.stringify(payload),
            });
            if (res.ok) successCount++;
          } catch { /* continue */ }
        }
        this._dispatchGridEvent('import-complete', { total: importedRows.length, success: successCount });
      }

      // Add to local data
      this.rows = [...this.rows, ...importedRows];
      this._dispatchGridEvent('import-complete', { rows: importedRows, count: importedRows.length });
    } catch (err) {
      this._dispatchGridEvent('import-error', { error: err });
    }

    // Reset file input
    (e.target as HTMLInputElement).value = '';
  }

  private _parseCsv(text: string): GridRow[] {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: GridRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: GridRow = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
      rows.push(row);
    }
    return rows;
  }

  /**
   * Parse Excel (.xlsx) files without external dependencies.
   * XLSX is a ZIP containing XML. We use the browser's built-in
   * DecompressionStream + DOMParser to extract sheet data.
   */
  private async _parseExcel(file: File): Promise<GridRow[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);

      // XLSX is a ZIP — decompress and find sheet1.xml + sharedStrings.xml
      // We use a simple ZIP parser (no dependencies)
      const entries = await this._readZipEntries(arrayBuffer);

      const sharedStringsXml = entries['xl/sharedStrings.xml'] ?? '';
      const sheetXml = entries['xl/worksheets/sheet1.xml'] ?? '';

      if (!sheetXml) {
        this._dispatchGridEvent('import-error', { message: 'No se encontró hoja de datos en el archivo Excel.' });
        return [];
      }

      // Parse shared strings
      const parser = new DOMParser();
      const sharedStrings: string[] = [];
      if (sharedStringsXml) {
        const ssDoc = parser.parseFromString(sharedStringsXml, 'application/xml');
        ssDoc.querySelectorAll('si').forEach(si => {
          const t = si.querySelector('t');
          sharedStrings.push(t?.textContent ?? '');
        });
      }

      // Parse sheet data
      const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');
      const rowEls = sheetDoc.querySelectorAll('sheetData row');

      const allRows: string[][] = [];
      rowEls.forEach(rowEl => {
        const cells: string[] = [];
        rowEl.querySelectorAll('c').forEach(cell => {
          const type = cell.getAttribute('t');
          const vEl = cell.querySelector('v');
          let value = vEl?.textContent ?? '';
          if (type === 's' && sharedStrings.length > 0) {
            value = sharedStrings[parseInt(value, 10)] ?? value;
          }
          cells.push(value);
        });
        allRows.push(cells);
      });

      if (allRows.length < 2) return [];

      // First row = headers, rest = data
      const headers = allRows[0];
      // Map headers to column fields if possible
      const fieldMap = headers.map(h => {
        const match = this.columns.find(c =>
          (c.header || '').toLowerCase() === h.toLowerCase() ||
          c.field.toLowerCase() === h.toLowerCase()
        );
        return match?.field ?? h;
      });

      const rows: GridRow[] = [];
      for (let i = 1; i < allRows.length; i++) {
        const row: GridRow = {};
        fieldMap.forEach((field, idx) => {
          let val: unknown = allRows[i][idx] ?? '';
          // Auto-convert numbers
          const col = this.columns.find(c => c.field === field);
          if (col?.type === 'number' && val !== '') val = Number(val);
          row[field] = val;
        });
        rows.push(row);
      }
      return rows;
    } catch (err) {
      this._dispatchGridEvent('import-error', { message: 'Error al leer archivo Excel', error: err });
      return [];
    }
  }

  /**
   * Minimal ZIP reader for XLSX files — reads entries from a ZIP ArrayBuffer.
   * Only extracts UTF-8 text files (XML) needed for spreadsheet parsing.
   */
  private async _readZipEntries(buffer: ArrayBuffer): Promise<Record<string, string>> {
    const view = new DataView(buffer);
    const entries: Record<string, string> = {};
    let offset = 0;
    const decoder = new TextDecoder();

    while (offset < buffer.byteLength - 4) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break; // Not a local file header

      const compressed = view.getUint16(offset + 8, true); // compression method
      const compressedSize = view.getUint32(offset + 18, true);
      const uncompressedSize = view.getUint32(offset + 22, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const nameBytes = new Uint8Array(buffer, offset + 30, nameLen);
      const name = decoder.decode(nameBytes);
      const dataStart = offset + 30 + nameLen + extraLen;
      const rawData = new Uint8Array(buffer, dataStart, compressedSize);

      if (name.endsWith('.xml') || name.endsWith('.rels')) {
        try {
          if (compressed === 0) {
            entries[name] = decoder.decode(rawData);
          } else if (compressed === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(rawData);
            writer.close();
            const reader = ds.readable.getReader();
            const chunks: Uint8Array[] = [];
            let done = false;
            while (!done) {
              const result = await reader.read();
              if (result.value) chunks.push(result.value);
              done = result.done;
            }
            const totalLen = chunks.reduce((s, c) => s + c.length, 0);
            const merged = new Uint8Array(totalLen);
            let pos = 0;
            for (const c of chunks) { merged.set(c, pos); pos += c.length; }
            entries[name] = decoder.decode(merged);
          }
        } catch { /* skip unreadable entries */ }
      }

      offset = dataStart + compressedSize;
    }

    return entries;
  }

  // ─── Header Context Menu ──────────────────────────────────────

  private _openHeaderMenu(e: MouseEvent, field: string) {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.target as HTMLElement).closest('.zg-th')?.getBoundingClientRect();
    const containerRect = this.shadowRoot?.querySelector('.zg-container')?.getBoundingClientRect();
    if (rect && containerRect) {
      this._headerMenu = {
        x: rect.left - containerRect.left,
        y: rect.bottom - containerRect.top,
        field,
      };
    }
  }

  private _closeHeaderMenu() { this._headerMenu = null; }

  private _headerMenuAction(action: string) {
    if (!this._headerMenu) return;
    const field = this._headerMenu.field;

    switch (action) {
      case 'sort-asc':
        this._sorts = [{ field, direction: 'asc' }];
        break;
      case 'sort-desc':
        this._sorts = [{ field, direction: 'desc' }];
        break;
      case 'clear-sort':
        this._sorts = this._sorts.filter(s => s.field !== field);
        break;
      case 'hide-column':
        this._hiddenColumns = new Set([...this._hiddenColumns, field]);
        this._dispatchGridEvent('column-visibility-change', { field, visible: false });
        break;
      case 'pin-left': {
        const left = [...(this.pinnedColumns.left || [])];
        if (!left.includes(field)) left.push(field);
        this.pinnedColumns = { ...this.pinnedColumns, left };
        break;
      }
      case 'pin-right': {
        const right = [...(this.pinnedColumns.right || [])];
        if (!right.includes(field)) right.push(field);
        this.pinnedColumns = { ...this.pinnedColumns, right };
        break;
      }
      case 'unpin': {
        const left = (this.pinnedColumns.left || []).filter(f => f !== field);
        const right = (this.pinnedColumns.right || []).filter(f => f !== field);
        this.pinnedColumns = { left, right };
        break;
      }
      case 'copy-column': {
        const values = this._sortedRows.map(r => String(r[field] ?? '')).join('\n');
        navigator.clipboard.writeText(values);
        break;
      }
      case 'filter': {
        // Turn on header filters and focus the input for this column
        this.enableHeaderFilters = true;
        this.requestUpdate();
        // Focus after render
        setTimeout(() => {
          const inputs = this.shadowRoot?.querySelectorAll('.zg-filter-input');
          const colIdx = this._visibleColumns.findIndex(c => c.field === field);
          if (inputs && colIdx >= 0 && inputs[colIdx]) {
            (inputs[colIdx] as HTMLInputElement).focus();
          }
        }, 50);
        break;
      }
      case 'manage-columns': {
        this._closeAllPanels();
        this._showColumnsPanel = true;
        break;
      }
    }

    this._dispatchGridEvent('header-menu-action', { field, action });
    this._closeHeaderMenu();
  }

  // ─── Column Resize ─────────────────────────────────────────────

  private _handleResizeStart(e: MouseEvent, field: string) {
    e.preventDefault();
    e.stopPropagation();
    const col = this.columns.find(c => c.field === field);
    const startWidth = this._columnWidths[field] || col?.width || 120;
    this._resizing = { field, startX: e.clientX, startWidth };

    const onMove = (ev: MouseEvent) => {
      if (!this._resizing) return;
      const diff = ev.clientX - this._resizing.startX;
      const newWidth = Math.max(40, this._resizing.startWidth + diff);
      this._columnWidths = { ...this._columnWidths, [this._resizing.field]: newWidth };
    };
    const onUp = () => {
      if (this._resizing) {
        this._dispatchGridEvent('column-resize', { field: this._resizing.field, width: this._columnWidths[this._resizing.field] });
      }
      this._resizing = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // ─── Pinned column helpers ──────────────────────────────────────

  private _getPinStyle(field: string, visibleCols: ColumnDef[]): string {
    const leftPins = this.pinnedColumns?.left || [];
    const rightPins = this.pinnedColumns?.right || [];

    if (leftPins.includes(field)) {
      let leftOffset = 40;
      for (const col of visibleCols) {
        if (col.field === field) break;
        if (leftPins.includes(col.field)) leftOffset += this._columnWidths[col.field] || col.width || 120;
      }
      return `position:sticky;left:${leftOffset}px;z-index:1;background:var(--zg-bg, #fff);`;
    }
    if (rightPins.includes(field)) {
      let rightOffset = 0;
      const reverseCols = [...visibleCols].reverse();
      for (const col of reverseCols) {
        if (col.field === field) break;
        if (rightPins.includes(col.field)) rightOffset += this._columnWidths[col.field] || col.width || 120;
      }
      return `position:sticky;right:${rightOffset}px;z-index:1;background:var(--zg-bg, #fff);`;
    }
    return '';
  }

  private _getPinHeaderStyle(field: string, visibleCols: ColumnDef[]): string {
    const leftPins = this.pinnedColumns?.left || [];
    const rightPins = this.pinnedColumns?.right || [];

    if (leftPins.includes(field)) {
      let leftOffset = 40;
      for (const col of visibleCols) {
        if (col.field === field) break;
        if (leftPins.includes(col.field)) leftOffset += this._columnWidths[col.field] || col.width || 120;
      }
      return `position:sticky;left:${leftOffset}px;z-index:3;`;
    }
    if (rightPins.includes(field)) {
      let rightOffset = 0;
      const reverseCols = [...visibleCols].reverse();
      for (const col of reverseCols) {
        if (col.field === field) break;
        if (rightPins.includes(col.field)) rightOffset += this._columnWidths[col.field] || col.width || 120;
      }
      return `position:sticky;right:${rightOffset}px;z-index:3;`;
    }
    return '';
  }

  private _isPinned(field: string): boolean {
    return (this.pinnedColumns?.left || []).includes(field) || (this.pinnedColumns?.right || []).includes(field);
  }

  // ─── Toolbar panel toggles ──────────────────────────────────────

  private _closeAllPanels() {
    this._showColumnsPanel = false;
    this._showDensityPanel = false;
    this._showExportPanel = false;
  }

  private _togglePanel(panel: 'columns' | 'density' | 'export') {
    const wasOpen = panel === 'columns' ? this._showColumnsPanel
      : panel === 'density' ? this._showDensityPanel
      : this._showExportPanel;
    this._closeAllPanels();
    if (!wasOpen) {
      if (panel === 'columns') this._showColumnsPanel = true;
      else if (panel === 'density') this._showDensityPanel = true;
      else this._showExportPanel = true;
    }
  }

  // ─── Column visibility toggle ────────────────────────────────

  private _toggleColumnVisibility(field: string) {
    const next = new Set(this._hiddenColumns);
    if (next.has(field)) next.delete(field); else next.add(field);
    this._hiddenColumns = next;
    this._dispatchGridEvent('column-visibility-change', { hiddenColumns: [...next] });
  }

  private _showAllColumns() {
    this._hiddenColumns = new Set();
    this._dispatchGridEvent('column-visibility-change', { hiddenColumns: [] });
  }

  // ─── Filter panel handlers ────────────────────────────────────

  private _handleFilterPanelChange(field: string, value: unknown) {
    this._filterPanelValues = { ...this._filterPanelValues, [field]: value };
    this._page = 0;
    this._dispatchGridEvent('filter-panel-change', { field, value, allFilters: this._filterPanelValues });
  }

  private _clearAllFilters() {
    this._filterPanelValues = {};
    this._page = 0;
    this._dispatchGridEvent('filter-panel-change', { field: null, value: null, allFilters: {} });
  }

  // ─── v0.2 — Virtual Scroll ────────────────────────────────────

  private get _virtualScrollResult(): VirtualScrollResult | null {
    if (!this.enableVirtualScroll) return null;
    const rowHeight = this.density === 'compact' ? 32 : this.density === 'comfortable' ? 52 : 40;
    const totalRows = this._sortedRows.length;
    return calculateVirtualScroll(this._scrollTop, {
      totalRows,
      rowHeight,
      viewportHeight: this._viewportHeight,
      overscan: this.virtualOverscan,
    });
  }

  private _handleVirtualScroll(e: Event) {
    const el = e.target as HTMLElement;
    this._scrollTop = el.scrollTop;
    this._viewportHeight = el.clientHeight;
  }

  // ─── v0.2 — Undo/Redo ──────────────────────────────────────

  /** Public: undo last edit */
  undo() {
    if (!this.enableUndoRedo) return;
    const action = this._undoRedoStack.undo();
    if (!action) return;
    this._applyUndoAction(action, true);
    this._dispatchGridEvent('undo', { action });
  }

  /** Public: redo last undone edit */
  redo() {
    if (!this.enableUndoRedo) return;
    const action = this._undoRedoStack.redo();
    if (!action) return;
    this._applyUndoAction(action, false);
    this._dispatchGridEvent('redo', { action });
  }

  private _applyUndoAction(action: EditAction, isUndo: boolean) {
    if (action.type === 'cell-edit' && action.rowKey && action.field) {
      const val = isUndo ? action.oldValue : action.newValue;
      this.rows = this.rows.map(r =>
        this._getRowKey(r) === action.rowKey ? { ...r, [action.field!]: val } : r
      );
    } else if (action.type === 'paste' && action.changes) {
      for (const c of action.changes) {
        const val = isUndo ? c.oldValue : c.newValue;
        const row = this.rows.find(r => this._getRowKey(r) === c.rowKey);
        if (row) (row as any)[c.field] = val;
      }
      this.rows = [...this.rows];
    } else if (action.type === 'row-add' && action.row) {
      if (isUndo) {
        this.rows = this.rows.filter(r => this._getRowKey(r) !== this._getRowKey(action.row as GridRow));
      } else {
        this.rows = [action.row as GridRow, ...this.rows];
      }
    } else if (action.type === 'row-delete' && action.row) {
      if (isUndo) {
        const idx = action.rowIndex ?? 0;
        const newRows = [...this.rows];
        newRows.splice(idx, 0, action.row as GridRow);
        this.rows = newRows;
      } else {
        this.rows = this.rows.filter(r => this._getRowKey(r) !== this._getRowKey(action.row as GridRow));
      }
    }
    this.requestUpdate();
  }

  private _pushUndoAction(action: EditAction) {
    if (this.enableUndoRedo) {
      this._undoRedoStack.push(action);
    }
  }

  private _getAuditTooltip(row: GridRow, field: string): string {
    const rk = this._getRowKey(row);
    const h = this._auditTrail.getHistory(rk, field);
    if (h.length === 0) return '';
    const l = h[h.length - 1];
    const d = new Date(l.timestamp);
    const ds = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${this._t('Cambiado por', 'Changed by')} ${l.user} ${this._t('el', 'on')} ${ds} — ${this._t('Anterior', 'Previous')}: ${String(l.oldValue)}`;
  }

  setAiResult(cacheKey: string, result: string) {
    this._aiCache.set(cacheKey, result);
    const nl = new Set(this._aiLoading);
    nl.delete(cacheKey);
    this._aiLoading = nl;
    this.requestUpdate();
  }

  getAuditTrail() { return this._auditTrail; }

  // ─── v0.2 — Range Selection ─────────────────────────────────

  private get _normalizedRange(): NormalizedRange | null {
    if (!this._rangeAnchor || !this._rangeEnd) return null;
    return normalizeRange({
      start: { rowIndex: this._rangeAnchor.rowIdx, colIndex: this._rangeAnchor.colIdx },
      end: { rowIndex: this._rangeEnd.rowIdx, colIndex: this._rangeEnd.colIdx },
    });
  }

  private _isCellInRange(rowIdx: number, colIdx: number): boolean {
    const range = this._normalizedRange;
    if (!range) return false;
    return isCellInRange(rowIdx, colIdx, range);
  }

  private _handleRangeMouseDown(rowIdx: number, colIdx: number, e: MouseEvent) {
    if (!this.enableRangeSelection) return;
    if (e.button !== 0) return; // only left click
    this._rangeAnchor = { rowIdx, colIdx };
    this._rangeEnd = { rowIdx, colIdx };
    this._isRangeSelecting = true;
    this._activeCell = { rowIdx, colIdx };
  }

  private _handleRangeMouseOver(rowIdx: number, colIdx: number) {
    if (!this._isRangeSelecting) return;
    this._rangeEnd = { rowIdx, colIdx };
  }

  private _handleRangeMouseUp() {
    if (!this._isRangeSelecting) return;
    this._isRangeSelecting = false;
    const range = this._normalizedRange;
    if (range) {
      this._dispatchGridEvent('range-select', range);
    }
  }

  private async _copyRange() {
    const range = this._normalizedRange;
    if (!range) return;
    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    await copyRangeToClipboard(displayRows, this._visibleColumns, range);
  }

  // ─── v0.2 — Clipboard Paste ─────────────────────────────────

  private async _handlePaste(e: ClipboardEvent) {
    if (!this.enablePaste) return;
    if (!this._activeCell) return;
    e.preventDefault();

    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;

    const pasteData = parseClipboardData(text);
    if (pasteData.rows === 0) return;

    const displayRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const changes = applyPasteData(
      displayRows,
      this._visibleColumns,
      pasteData,
      this._activeCell.rowIdx,
      this._activeCell.colIdx
    );

    // Push undo action
    this._pushUndoAction({
      type: 'paste',
      timestamp: Date.now(),
      changes: changes.map(c => ({ rowKey: c.rowKey, field: c.field, oldValue: c.oldValue, newValue: c.newValue })),
    });

    this.rows = [...this.rows]; // trigger reactivity
    this._dispatchGridEvent('paste', { changes, rows: pasteData.rows, cols: pasteData.cols });
  }

  // ─── v0.2 — Sparkline renderer ─────────────────────────────

  private _renderSparkline(val: unknown, col: ColumnDef): ReturnType<typeof html> | typeof nothing {
    const dataField = col.sparklineField || col.field;
    const values = Array.isArray(val) ? val : [];
    if (values.length < 2) return html`<span>${String(val ?? '')}</span>`;

    const data = processSparklineData(values);
    const w = 80;
    const h = 24;
    const color = col.sparklineColor || 'var(--zg-primary, #e67e22)';
    const type = col.sparkline || 'line';

    if (type === 'bar') {
      const bars = sparklineBars(data, w, h, 1, 1);
      return html`
        <svg class="zg-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          ${bars.map(b => unsafeHTML(
            `<rect x="${b.x.toFixed(1)}" y="${b.y.toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.h.toFixed(1)}" fill="${b.isMax ? color : b.isNegative ? 'var(--zg-error, #d63031)' : color}" opacity="${b.isMax || b.isMin ? '1' : '0.6'}"/>`
          ))}
        </svg>
      `;
    }

    if (type === 'area') {
      const { linePath, areaPath } = sparklineAreaPath(data, w, h);
      return html`
        <svg class="zg-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <path d="${areaPath}" fill="${color}" opacity="0.15"/>
          <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>
      `;
    }

    // line (default)
    const path = sparklineLinePath(data, w, h);
    return html`
      <svg class="zg-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <path d="${path}" fill="none" stroke="${color}" stroke-width="1.5"/>
        <circle cx="${(w - 2).toFixed(1)}" cy="${(2 + (h - 4) - ((data.last - data.min) / data.range) * (h - 4)).toFixed(1)}" r="2" fill="${data.trend === 'up' ? 'var(--zg-success)' : data.trend === 'down' ? 'var(--zg-error)' : color}"/>
      </svg>
    `;
  }

  // ─── Format value ─────────────────────────────────────────────

  private _formatValue(val: unknown, col: ColumnDef, isTotals = false): string {
    if (val == null) return '';

    if (col.currency) {
      const num = Number(val);
      // In totals row: just number with 2 decimals, no currency symbol
      if (isTotals) {
        return new Intl.NumberFormat(this.locale, {
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(num);
      }
      const code = typeof col.currency === 'string' ? col.currency : this.defaultCurrency;
      try {
        return new Intl.NumberFormat(this.locale, {
          style: 'currency', currency: code, minimumFractionDigits: 2,
        }).format(num);
      } catch { return String(val); }
    }

    if (col.type === 'number') {
      const num = Number(val);
      const hasDecimals = num % 1 !== 0;
      return new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: 2,
      }).format(num);
    }

    if (col.type === 'date' || col.type === 'datetime') {
      try {
        const d = new Date(String(val));
        if (isNaN(d.getTime())) return String(val);
        if (col.type === 'datetime') {
          return d.toLocaleString(this.locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString(this.locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch { return String(val); }
    }

    // Handle object values gracefully
    if (typeof val === 'object' && val !== null) {
      return (val as any).label ?? (val as any).name ?? (val as any).text ?? (val as any).value ?? '';
    }
    return String(val);
  }

  // ─── Render cell content ──────────────────────────────────────

  private _renderCellContent(val: unknown, col: ColumnDef, row: GridRow) {
    const isTotals = !!row['__zentto_totals__'];

    // Action buttons column
    if (col.type === 'actions' && col.actions && !isTotals) {
      return html`${col.actions.map(btn => html`
        <button class="zg-btn-icon" style="${btn.color ? `color:${btn.color}` : ''}"
                title="${btn.label}"
                @click=${(e: Event) => { e.stopPropagation(); this._dispatchGridEvent('action-click', { action: btn.action, row }); }}>
          ${unsafeHTML(this._resolveActionIcon(btn.icon))}
        </button>
      `)}`;
    }

    // Boolean → check/X icon
    if (col.type === 'boolean' && !isTotals) {
      const boolVal = val === true || val === 1 || val === '1' || val === 'true' || val === 'S' || val === 'Y' || val === 'yes' || val === 'si';
      const falseVal = val === false || val === 0 || val === '0' || val === 'false' || val === 'N' || val === 'no' || val === -1 || val === '-1';
      if (boolVal) {
        return html`<span style="color:var(--zg-success,#0d9668);display:flex;align-items:center;justify-content:center">${this._iconHtml('check')}</span>`;
      }
      if (falseVal) {
        return html`<span style="color:var(--zg-text-muted,#9aa0a6);display:flex;align-items:center;justify-content:center">${this._iconHtml('close')}</span>`;
      }
      return html`<span style="color:var(--zg-text-muted)">—</span>`;
    }

    // Radio options → visual radio buttons for multi-state fields
    if (col.radioOptions && !isTotals) {
      const currentVal = String(val ?? '');
      return html`
        <div style="display:flex;gap:4px;align-items:center">
          ${col.radioOptions.map(opt => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const optColor = typeof opt === 'object' ? opt.color : undefined;
            const isActive = currentVal === String(optVal);
            return html`
              <span style="display:inline-flex;align-items:center;gap:2px;cursor:${this.enableEditing ? 'pointer' : 'default'}"
                    title="${optLabel}"
                    @click=${this.enableEditing ? (e: Event) => {
                      e.stopPropagation();
                      const key = this._getRowKey(row);
                      this.rows = [...this.rows.map(r => this._getRowKey(r) === key ? { ...r, [col.field]: optVal } : r)];
                      this._dispatchGridEvent('cell-edit', { row: { ...row, [col.field]: optVal }, field: col.field, oldValue: val, newValue: optVal });
                    } : nothing}>
                <span style="width:14px;height:14px;border-radius:50%;border:2px solid ${isActive ? (optColor || 'var(--zg-primary)') : 'var(--zg-border-strong)'};display:flex;align-items:center;justify-content:center">
                  ${isActive ? html`<span style="width:8px;height:8px;border-radius:50%;background:${optColor || 'var(--zg-primary)'}"></span>` : nothing}
                </span>
                <span style="font-size:10px;color:${isActive ? 'var(--zg-text)' : 'var(--zg-text-muted)'}">${optLabel}</span>
              </span>
            `;
          })}
        </div>
      `;
    }

    // Color swatch → circle with color value
    if (col.type === 'color' && val && !isTotals) {
      return html`<span style="display:flex;align-items:center;gap:6px">
        <span style="width:16px;height:16px;border-radius:50%;background:${String(val)};border:1px solid var(--zg-border);flex-shrink:0"></span>
        <span style="font-size:11px;color:var(--zg-text-muted)">${val}</span>
      </span>`;
    }

    // Percentage → bar + number
    if (col.type === 'percentage' && !isTotals) {
      const pct = Math.min(100, Math.max(0, Number(val) || 0));
      const color = pct >= 75 ? 'var(--zg-success)' : pct >= 50 ? 'var(--zg-warning)' : pct >= 25 ? 'var(--zg-primary)' : 'var(--zg-error)';
      return html`<span style="display:flex;align-items:center;gap:6px;width:100%">
        <span style="flex:1;height:6px;background:var(--zg-surface);border-radius:3px;overflow:hidden">
          <span style="display:block;height:100%;width:${pct}%;background:${color};border-radius:3px"></span>
        </span>
        <span style="font-size:11px;font-weight:600;min-width:32px;text-align:right">${pct}%</span>
      </span>`;
    }

    if (col.renderCell && !isTotals) return html`<span .innerHTML=${col.renderCell(val, row)}></span>`;

    // Sparkline columns
    if (col.sparkline && !isTotals) {
      return this._renderSparkline(val, col);
    }

    if (col.statusColors && val != null) {
      // Extract text from object values (e.g. { label: 'Active', value: 1 })
      const text = typeof val === 'object' ? ((val as any).label ?? (val as any).name ?? (val as any).text ?? (val as any).value ?? JSON.stringify(val)) : String(val);
      const color = col.statusColors[text] ?? 'default';
      const variant = col.statusVariant ?? 'filled';
      return html`<span class="zg-chip zg-chip--${color} zg-chip--${variant}">${text}</span>`;
    }

    if (col.progressMax != null) {
      const pct = Math.min(100, (Number(val) / col.progressMax) * 100);
      return html`<div class="zg-progress"><div class="zg-progress-bar" style="width:${pct}%"></div><span class="zg-progress-text">${Math.round(pct)}%</span></div>`;
    }

    if (col.ratingMax != null) {
      const stars = Number(val) || 0;
      return html`<span class="zg-rating">${'\u2605'.repeat(Math.min(stars, col.ratingMax))}${'\u2606'.repeat(Math.max(0, col.ratingMax - stars))}</span>`;
    }

    if (col.avatarField) {
      const variant = col.avatarVariant || 'circular';
      const subtitle = col.subtitleField ? row[col.subtitleField] : null;
      return html`
        <div class="zg-avatar-cell">
          <img class="zg-avatar zg-avatar--${variant}" src="${String(row[col.avatarField] || '')}" alt="" loading="lazy" />
          <div class="zg-avatar-text">
            <span>${this._formatValue(val, col)}</span>
            ${subtitle ? html`<span class="zg-avatar-subtitle">${subtitle}</span>` : nothing}
          </div>
        </div>
      `;
    }

    if (col.flagField) {
      const code = String(row[col.flagField] || val || '');
      const flag = code.length === 2
        ? String.fromCodePoint(...([...code.toUpperCase()] as string[]).map(c => 0x1F1A5 + c.charCodeAt(0)))
        : '';
      return html`<span>${flag} ${this._formatValue(val, col)}</span>`;
    }

    if (col.imageField) {
      const src = String(row[col.imageField] || val || '');
      return html`<img class="zg-thumb" src="${src}" width="${col.imageWidth || 40}" height="${col.imageHeight || 40}" loading="lazy" />`;
    }

    if (col.linkField) {
      const href = String(row[col.linkField] || val || '#');
      return html`<a class="zg-link" href="${href}" target="${col.linkTarget || '_blank'}" @click=${(e: Event) => e.stopPropagation()}>${this._formatValue(val, col)}</a>`;
    }

    // v0.8 — Barcode / QR
    if (col.barcode && val != null && !isTotals) {
      const data = String(val);
      if (data) {
        const svg = col.barcode === 'qr' ? generateQrSvg(data, 32) : generateBarcodeSvg(data, col.barcode, 120, 28);
        return html`<span class="zg-barcode-cell" title="${data}">${unsafeHTML(svg)}</span>`;
      }
    }
    // v0.8 — Status Timeline
    if (col.timeline && !isTotals) {
      const td = (col.timelineField ? row[col.timelineField] : val) as TimelineEntry[] | undefined;
      if (Array.isArray(td) && td.length > 0) {
        const svg = generateTimelineSvg(td, 120);
        return html`<span class="zg-timeline-cell">${unsafeHTML(svg)}</span>`;
      }
      return html`<span style="color:var(--zg-text-muted)">&mdash;</span>`;
    }
    // v0.8 — AI Column
    if (col.ai && !isTotals) {
      const rk = this._getRowKey(row), ck = `${rk}_${col.field}`;
      if (this.aiResults[ck]) return html`<span class="zg-ai-cell">${this.aiResults[ck]}</span>`;
      if (this._aiCache.has(ck)) return html`<span class="zg-ai-cell">${this._aiCache.get(ck)}</span>`;
      if (this._aiLoading.has(ck)) return html`<span class="zg-ai-loading"><span class="zg-ai-spinner"></span></span>`;
      this._aiLoading = new Set([...this._aiLoading, ck]);
      const ctx: Record<string, unknown> = {};
      for (const f of col.ai.fields) ctx[f] = row[f];
      setTimeout(() => this._dispatchGridEvent('ai-request', { row, prompt: col.ai!.prompt, fields: ctx, field: col.field, cacheKey: ck }), 0);
      return html`<span class="zg-ai-loading"><span class="zg-ai-spinner"></span></span>`;
    }
    // v0.8 — Cell Hyperlinks
    if (col.hyperlink && val != null && !isTotals) {
      let href = '#';
      if (col.hyperlinkPattern) { href = col.hyperlinkPattern.replace(/\{(\w+)\}/g, (_: string, f: string) => String(row[f] ?? '')); }
      else { href = String(val); }
      return html`<a class="zg-link" href="${href}" target="${col.hyperlinkTarget || '_blank'}" @click=${(e: Event) => e.stopPropagation()}>${this._formatValue(val, col)}</a>`;
    }
    return html`${this._formatValue(val, col, isTotals)}`;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('paste', this._handlePasteEvent as EventListener);
    this.addEventListener('mouseup', this._handleGlobalMouseUp);
    document.addEventListener('click', this._handleDocClick);
    window.addEventListener('resize', this._handleResize);
    if (this.enableGrouping && this.groupField) this._initGroups();
    // Set ARIA role
    this.setAttribute('role', 'grid');
    this.setAttribute('aria-label', this._t('Tabla de datos', 'Data grid'));
    // Restore layout from IndexedDB
    this._restoreLayout();
    // Auto-detect dark mode if theme not explicitly set
    this._autoDetectTheme();
    // Watch for theme changes on parent/body
    this._themeObserver = new MutationObserver(() => this._autoDetectTheme());
    this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'style'] });
    this._themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'style'] });
    // Also listen to system preference changes
    this._darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._darkMediaQuery.addEventListener('change', this._handleMediaChange);
  }

  private _themeObserver?: MutationObserver;
  private _darkMediaQuery?: MediaQueryList;
  private _themeSetExplicitly = false;

  private _handleMediaChange = () => this._autoDetectTheme();

  private _autoDetectTheme() {
    // Don't override if user set theme via configurator or prop
    if (this._themeSetExplicitly) return;
    // Check if theme attribute was explicitly set in HTML
    if (this.getAttribute('theme')) { this._themeSetExplicitly = true; return; }

    const isDark =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
      document.body.classList.contains('dark') ||
      document.body.getAttribute('data-theme') === 'dark' ||
      document.documentElement.style.colorScheme === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      // MUI dark mode detection: check body background
      (typeof getComputedStyle !== 'undefined' && (() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        if (!bg || bg === 'rgba(0, 0, 0, 0)') return false;
        const match = bg.match(/\d+/g);
        if (!match) return false;
        const [r, g, b] = match.map(Number);
        return (r + g + b) / 3 < 100; // Dark if average RGB < 100
      })());

    this.theme = isDark ? 'dark' : 'light';
  }

  private async _restoreLayout() {
    if (!this.gridId) return;
    const layout = await loadLayout(this.gridId);
    if (!layout) return;
    if (layout.density) this.density = layout.density;
    if (layout.groupByField) { this.groupField = layout.groupByField; this.enableGrouping = true; this._initGroups(); }
    if (layout.columnWidths) this._columnWidths = layout.columnWidths;
    if (layout.columnVisibility) {
      const hidden = new Set<string>();
      for (const [field, visible] of Object.entries(layout.columnVisibility)) {
        if (!visible) hidden.add(field);
      }
      this._hiddenColumns = hidden;
    }
  }

  private _persistLayout() {
    if (!this.gridId) return;
    const visibility: Record<string, boolean> = {};
    for (const col of this.columns) {
      visibility[col.field] = !this._hiddenColumns.has(col.field);
    }
    saveLayout(this.gridId, {
      density: this.density,
      groupByField: this.enableGrouping ? this.groupField : undefined,
      columnWidths: Object.keys(this._columnWidths).length > 0 ? this._columnWidths : undefined,
      columnVisibility: visibility,
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('paste', this._handlePasteEvent as EventListener);
    this.removeEventListener('mouseup', this._handleGlobalMouseUp);
    document.removeEventListener('click', this._handleDocClick);
    window.removeEventListener('resize', this._handleResize);
    this._themeObserver?.disconnect();
    this._darkMediaQuery?.removeEventListener('change', this._handleMediaChange);
  }

  private _handlePasteEvent = (e: Event) => this._handlePaste(e as ClipboardEvent);
  private _handleGlobalMouseUp = () => this._handleRangeMouseUp();

  private _initGroups() {
    if (this.enableGrouping && this.groupField && this._expandedGroups.size === 0) {
      const groups = new Set<string>();
      for (const row of this.rows) groups.add(String(row[this.groupField] ?? '(vacio)'));
      this._expandedGroups = groups;
    }
  }

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('groupField') || changed.has('enableGrouping') || changed.has('rows')) {
      if (this.enableGrouping && this.groupField) this._initGroups();
    }
    // Persist layout on relevant changes
    if (this.gridId && (changed.has('density') || changed.has('groupField') || changed.has('enableGrouping') || changed.has('_columnWidths') || changed.has('_hiddenColumns'))) {
      this._persistLayout();
    }
  }

  private _handleDocClick = () => {
    if (this._contextMenu) this._closeContextMenu();
    if (this._headerMenu) this._closeHeaderMenu();
    this._closeAllPanels();
  };

  private _handleResize = () => { this.requestUpdate(); };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this._editingCell) { this._editingCell = null; return; }
      if (this._contextMenu) { this._closeContextMenu(); return; }
      if (this._headerMenu) { this._closeHeaderMenu(); return; }
      this._closeAllPanels();
      this._activeCell = null;
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && this.enableFind) {
      e.preventDefault();
      this._findOpen = true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // Range copy takes priority, then clipboard all
      if (this.enableRangeSelection && this._normalizedRange) {
        e.preventDefault();
        this._copyRange();
      } else if (this.enableClipboard) {
        this._copyAll();
      }
    }
    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && this.enableUndoRedo) {
      e.preventDefault();
      if (e.shiftKey) this.redo(); else this.undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y' && this.enableUndoRedo) {
      e.preventDefault();
      this.redo();
    }
    // Range selection with Shift+Arrow
    if (this.enableRangeSelection && e.shiftKey && this._activeCell && ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
      if (!this._rangeAnchor) {
        this._rangeAnchor = { ...this._activeCell };
        this._rangeEnd = { ...this._activeCell };
      }
      const d = e.key === 'ArrowDown' ? [1,0] : e.key === 'ArrowUp' ? [-1,0] : e.key === 'ArrowRight' ? [0,1] : [0,-1];
      this._rangeEnd = {
        rowIdx: Math.max(0, (this._rangeEnd?.rowIdx ?? 0) + d[0]),
        colIdx: Math.max(0, (this._rangeEnd?.colIdx ?? 0) + d[1]),
      };
      return;
    }
    // Clear range on Escape
    if (e.key === 'Escape' && this._rangeAnchor) {
      this._rangeAnchor = null;
      this._rangeEnd = null;
    }
    // Excel-like grid navigation
    this._handleGridKeydown(e);
  };

  // ─── Mobile detection ────────────────────────────────────────

  private get _isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  // ─── Mobile detail drawer state ─────────────────────────────

  @state() private _detailDrawerRow: GridRow | null = null;

  private _openDetailDrawer(row: GridRow) {
    this._detailDrawerRow = row;
  }

  private _closeDetailDrawer() {
    this._detailDrawerRow = null;
  }

  // ─── Density class ────────────────────────────────────────────

  private get _densityClass(): string { return `zg-density-${this.density}`; }

  // ─── RENDER ───────────────────────────────────────────────────

  override render() {
    const isPivot = !!this._pivotResult;
    const { totalRows: paginatedTotal, totalPages } = this._paginatedResult;
    const totalRows = isPivot ? this._pivotResult!.rows.length : paginatedTotal;
    const visibleCols = this._visibleColumns;
    const displayRows = this._displayRows;
    const from = isPivot ? 1 : this._page * this._pageSize + 1;
    const to = isPivot ? totalRows : Math.min(from + this._pageSize - 1, totalRows);
    const hasActions = this.actionButtons.length > 0;
    const colSpanTotal = visibleCols.length + 1
      + (this.enableMasterDetail ? 1 : 0)
      + (this.enableRowSelection ? 1 : 0)
      + (this.enableDragDrop ? 1 : 0)
      + (hasActions ? 1 : 0);
    const actionsWidth = hasActions ? Math.max(80, this.actionButtons.length * 40 + 16) : 0;
    const selCount = this._selectedRows.size;

    return html`
      <div class="zg-container ${this._densityClass} zg-theme-${this.theme}" style="height:${this.height}" tabindex="0"
           @click=${(e: Event) => e.stopPropagation()}>

        <!-- Rich Toolbar -->
        ${this.enableToolbar ? this._renderToolbar(totalRows) : nothing}

        <!-- CRUD bar (when editing enabled) -->
        ${this.enableEditing ? html`
          <div class="zg-crud-bar">
            <button class="zg-btn-primary" @click=${() => this.addRow()}>${this._iconHtml('add')} ${this._t('Agregar', 'Add')}</button>
            ${selCount > 0 ? html`
              <button class="zg-btn-danger" @click=${() => this.deleteSelected()}>
                ${this._iconHtml('delete')} ${this._t('Eliminar', 'Delete')} (${selCount})
              </button>
            ` : nothing}
            <span class="zg-toolbar-sep"></span>
            <button class="zg-btn-icon" @click=${this._handleImportClick} title="${this._t('Importar Excel/CSV/JSON', 'Import Excel/CSV/JSON')}">
              ${this._iconHtml('import')} ${this._t('Importar', 'Import')}
            </button>
            <input type="file" class="zg-import-file" accept=".csv,.json,.xlsx,.xls" @change=${this._handleFileImport} />
          </div>
        ` : nothing}

        <!-- Filter Panel (collapsible, below toolbar) -->
        ${this._showFilterPanel && this.filterPanel.length > 0 ? this._renderFilterPanel() : nothing}

        <!-- Find bar -->
        ${this._findOpen ? html`
          <div class="zg-find-bar">
            <span>${this._iconHtml('search')}</span>
            <input type="text" class="zg-find-input" placeholder="${this._t('Buscar...', 'Search...')}"
              .value=${this._findQuery}
              @input=${(e: InputEvent) => this._updateFind((e.target as HTMLInputElement).value)}
              @keydown=${this._handleFindKeydown} autofocus />
            <span class="zg-find-count">
              ${this._findMatches.length > 0
                ? `${this._findIdx + 1} ${this._t('de', 'of')} ${this._findMatches.length}`
                : this._t('Sin resultados', 'No results')}
            </span>
            <button class="zg-btn zg-btn-sm" @click=${() => { this._findOpen = false; this._findQuery = ''; this._findMatches = []; }}>\u2715</button>
          </div>
        ` : nothing}

        <!-- Group Drop Zone (drag column headers here to group) -->
        ${this.enableGroupDropZone ? html`
          <div class="zg-group-drop-zone ${this._groupFields.length === 0 ? 'zg-group-drop-zone--empty' : ''} ${this._groupDropOver ? 'zg-group-drop-zone--dragover' : ''}"
               @dragover=${this._handleGroupDragOver}
               @dragleave=${this._handleGroupDragLeave}
               @drop=${this._handleGroupDrop}>
            ${this._groupFields.length > 0 ? html`
              <span class="zg-group-drop-label">${this._t('Agrupado por', 'Grouped by')}</span>
              ${this._groupFields.map(f => {
                const col = this.columns.find(c => c.field === f);
                return html`
                  <span class="zg-group-chip">
                    ${col?.header || f}
                    <button class="zg-group-chip-remove" @click=${() => this._removeGroupField(f)}>${this._iconHtml('close')}</button>
                  </span>
                `;
              })}
            ` : html`
              <span>${this._iconHtml('drag')} ${this._t('Arrastra una columna aqui para agrupar', 'Drag a column here to group')}</span>
            `}
          </div>
        ` : nothing}

        <!-- Loading overlay -->
        ${this.loading ? html`<div class="zg-loading"><div class="zg-spinner"></div></div>` : nothing}

        <!-- Content area: table + optional configurator side by side -->
        <div class="zg-config-wrapper">
        <div class="zg-config-main">

        <!-- Content: switches by viewMode -->
        ${this.viewMode === 'form' ? this._renderFormView() : nothing}
        ${this.viewMode === 'cards' ? this._renderCardsView() : nothing}
        ${this.viewMode === 'kanban' ? this._renderKanbanView() : nothing}

        <!-- Table (default view) -->
        ${this.viewMode === 'table' ? html`<div class="zg-table-wrapper ${this.enableVirtualScroll ? 'zg-virtual-scroll' : ''}"
             @scroll=${this.enableVirtualScroll ? (e: Event) => this._handleVirtualScroll(e) : nothing}>
          ${this.enableVirtualScroll && this._virtualScrollResult ? html`
            <div class="zg-virtual-spacer" style="height:${this._virtualScrollResult.totalHeight}px"></div>
          ` : nothing}
          <table class="zg-table" role="grid" aria-rowcount="${this._sortedRows.length}"
                 style="${this.enableVirtualScroll && this._virtualScrollResult ? `transform:translateY(${this._virtualScrollResult.offsetY}px)` : ''}">
            <thead role="rowgroup">
              <!-- Column Groups -->
              ${this.columnGroups.length > 0 ? html`
                <tr class="zg-column-group-row">
                  ${this.enableMasterDetail ? html`<th class="zg-th" style="width:32px"></th>` : nothing}
                  <th class="zg-th zg-th-row-num" style="width:40px"></th>
                  ${this._renderColumnGroupHeaders(visibleCols)}
                </tr>
              ` : nothing}
              <tr>
                ${this.enableRowSelection ? html`
                  <th class="zg-th zg-th-checkbox" style="width:36px;position:sticky;left:0;z-index:3">
                    <input type="checkbox" class="zg-row-checkbox" .checked=${this._allSelected} @change=${this._toggleSelectAll} />
                  </th>
                ` : nothing}
                ${this.enableDragDrop ? html`<th class="zg-th zg-drag-handle" style="width:24px"></th>` : nothing}
                ${this.enableMasterDetail ? html`<th class="zg-th zg-th-expand" style="width:32px"></th>` : nothing}
                <th class="zg-th zg-th-row-num" style="width:40px" role="columnheader" aria-label="#">#</th>
                ${visibleCols.map((col) => {
                  const w = this._columnWidths[col.field] || col.width;
                  const pinStyle = this._getPinHeaderStyle(col.field, visibleCols);
                  const pinClass = this._isPinned(col.field) ? 'zg-th-pinned' : '';
                  return html`
                  <th
                    class="zg-th ${col.sortable ? 'zg-th-sortable' : ''} ${col.type === 'number' || col.currency ? 'zg-th-right' : ''} ${pinClass}"
                    style="${w ? `width:${w}px;` : col.flex ? `flex:${col.flex};` : ''}${pinStyle}"
                    role="columnheader"
                    aria-sort="${this._sorts.find(s => s.field === col.field)?.direction === 'asc' ? 'ascending' : this._sorts.find(s => s.field === col.field)?.direction === 'desc' ? 'descending' : 'none'}"
                    aria-label="${col.header || col.field}"
                    tabindex="${col.sortable ? '0' : '-1'}"
                    ?draggable=${this.enableGroupDropZone && col.groupable !== false}
                    @dragstart=${this.enableGroupDropZone ? (e: DragEvent) => this._handleHeaderDragStart(e, col.field) : nothing}
                    @click=${() => this._handleSort(col.field)}
                    @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleSort(col.field); } }}
                  >
                    <span>${col.ai ? html`<span class="zg-ai-sparkle" title="AI">${this._iconHtml('sparkle')}</span> ` : nothing}${col.header || col.field}${this._getSortIcon(col.field)}</span>
                    ${this.enableHeaderMenu ? html`
                      <span class="zg-th-menu-trigger" @click=${(e: MouseEvent) => this._openHeaderMenu(e, col.field)} title="${this._t('Menu de columna', 'Column menu')}">${this._iconHtml('menu')}</span>
                    ` : nothing}
                    ${col.resizable !== false ? html`
                      <span class="zg-resize-handle" @mousedown=${(e: MouseEvent) => this._handleResizeStart(e, col.field)}></span>
                    ` : nothing}
                  </th>
                `})}
                ${hasActions ? html`
                  <th class="zg-th zg-th-right" style="width:${actionsWidth}px;position:sticky;right:0;top:0;z-index:5;background:var(--zg-header-bg)">
                    ${this._t('Acciones', 'Actions')}
                  </th>
                ` : nothing}
              </tr>
              ${this.enableHeaderFilters ? html`
                <tr class="zg-filter-row">
                  ${this.enableRowSelection ? html`<td></td>` : nothing}
                  ${this.enableDragDrop ? html`<td></td>` : nothing}
                  ${this.enableMasterDetail ? html`<td></td>` : nothing}
                  <td></td>
                  ${visibleCols.map((col) => html`
                    <td>
                      <input type="${col.type === 'date' ? 'date' : 'text'}" class="zg-filter-input"
                        placeholder="${col.header ?? col.field}..."
                        @input=${(e: InputEvent) => this._handleFilterChange(col.field, (e.target as HTMLInputElement).value)} />
                    </td>
                  `)}
                  ${hasActions ? html`<td></td>` : nothing}
                </tr>
              ` : nothing}
            </thead>
            <tbody role="rowgroup">
              ${displayRows.map((row, idx) => {
                const isTotals = row['__zentto_totals__'];
                const isGroupHeader = row['__zentto_group__'];
                const isSubtotal = row['__zentto_subtotal__'];
                const groupValue = String(row['__zentto_group_value__'] ?? '');

                if (isGroupHeader) {
                  const expanded = this._isGroupExpanded(groupValue);
                  return html`
                    <tr class="zg-row zg-row-group-header" @click=${() => this._toggleGroup(groupValue)}>
                      <td class="zg-td zg-td-group-header" colspan="${colSpanTotal}">
                        <span class="zg-group-chevron ${expanded ? 'zg-group-chevron--expanded' : ''}">\u25B6</span>
                        <strong>${row[String(row['__zentto_group_field__'])]}</strong>
                      </td>
                    </tr>
                  `;
                }

                if (isSubtotal) {
                  return html`
                    <tr class="zg-row zg-row-subtotal">
                      ${this.enableMasterDetail ? html`<td class="zg-td"></td>` : nothing}
                      <td class="zg-td zg-td-row-num"></td>
                      ${visibleCols.map((col) => {
                        const val = row[col.field];
                        const pinStyle = this._getPinStyle(col.field, visibleCols);
                        return html`<td class="zg-td zg-td-subtotal ${col.type === 'number' || col.currency ? 'zg-td-right' : ''}" style="${pinStyle}">
                          ${val != null ? this._formatValue(val, col) : ''}
                        </td>`;
                      })}
                    </tr>
                  `;
                }

                const expanded = this.enableMasterDetail && this._isRowExpanded(row);
                const isSelected = this.enableRowSelection && this._isRowSelected(row);
                const isDragOver = this.enableDragDrop && this._dragOverIdx === idx;
                return html`
                  <tr class="zg-row ${isTotals ? 'zg-row-totals' : idx % 2 ? 'zg-row-alt' : ''} ${isSelected ? 'zg-row--selected' : ''} ${isDragOver ? 'zg-row--drag-over' : ''}"
                      role="row" aria-rowindex="${this._page * this._pageSize + idx + 1}" aria-selected="${isSelected ? 'true' : 'false'}"
                      draggable="${this.enableDragDrop && !isTotals ? 'true' : 'false'}"
                      @click=${() => this._dispatchGridEvent('row-click', { row, rowIndex: idx })}
                      @dragstart=${(e: DragEvent) => this._handleDragStart(e, row)}
                      @dragover=${(e: DragEvent) => this._handleDragOver(e, idx)}
                      @dragleave=${this._handleDragLeave}
                      @drop=${(e: DragEvent) => this._handleDrop(e)}>
                    ${this.enableRowSelection ? html`
                      <td class="zg-td zg-td-checkbox" style="position:sticky;left:0;z-index:1;background:var(--zg-bg, #fff)">
                        ${!isTotals ? html`<input type="checkbox" class="zg-row-checkbox" .checked=${isSelected}
                          @click=${(e: MouseEvent) => { e.stopPropagation(); this._toggleRowSelect(row, idx, e); }} />` : nothing}
                      </td>
                    ` : nothing}
                    ${this.enableDragDrop ? html`
                      <td class="zg-td zg-drag-handle">${!isTotals ? '\u2630' : ''}</td>
                    ` : nothing}
                    ${this.enableMasterDetail ? html`
                      <td class="zg-td zg-td-expand" @click=${(e: Event) => { e.stopPropagation(); this._toggleRowExpand(row); }}>
                        <span class="zg-expand-chevron ${expanded ? 'zg-expand-chevron--expanded' : ''}">\u25B6</span>
                      </td>
                    ` : nothing}
                    <td class="zg-td zg-td-row-num">${isTotals ? '' : this._page * this._pageSize + idx + 1}</td>
                    ${visibleCols.map((col) => {
                      const val = row[col.field];
                      const isMatch = this._findMatches.some((m) => m.rowIndex === idx && m.field === col.field);
                      const isCurrent = this._findMatches[this._findIdx]?.rowIndex === idx && this._findMatches[this._findIdx]?.field === col.field;
                      const pinStyle = this._getPinStyle(col.field, visibleCols);
                      const pinClass = this._isPinned(col.field) ? 'zg-td-pinned' : '';
                      const editable = this._isEditable(col.field) && !isTotals;
                      const isEditing = this._editingCell?.rowKey === this._getRowKey(row) && this._editingCell?.field === col.field;
                      const colIdx = visibleCols.indexOf(col);
                      const isActive = this._activeCell?.rowIdx === idx && this._activeCell?.colIdx === colIdx;
                      const inRange = this.enableRangeSelection && this._isCellInRange(idx, colIdx);
                      return html`
                        <td class="zg-td ${col.type === 'number' || col.currency ? 'zg-td-right' : ''} ${isTotals ? 'zg-td-totals' : ''} ${isMatch ? 'zg-find-match' : ''} ${isCurrent ? 'zg-find-current' : ''} ${pinClass} ${editable ? 'zg-td--editable' : ''} ${isActive ? 'zg-td--active' : ''} ${inRange ? 'zg-td--in-range' : ''}"
                            style="${pinStyle}"
                            role="gridcell"
                            aria-colindex="${colIdx + 1}"
                            aria-selected="${isActive || inRange ? 'true' : 'false'}"
                            @contextmenu=${(e: MouseEvent) => this._handleContextMenu(e, row, col.field, val)}
                            @click=${() => this._handleCellClick(row, col.field, idx)}
                            @mousedown=${(e: MouseEvent) => this._handleRangeMouseDown(idx, colIdx, e)}
                            @mouseover=${() => this._handleRangeMouseOver(idx, colIdx)}
                            @dblclick=${editable ? () => this._startEdit(row, col.field) : nothing}>
                          ${isEditing ? (col.type === 'date' || col.type === 'datetime')
                            ? this._renderDateEditor(row, col)
                            : html`
                            <input type="${col.type === 'number' ? 'number' : 'text'}"
                              class="zg-edit-input"
                              .value=${this._editValue}
                              @input=${(e: InputEvent) => { this._editValue = (e.target as HTMLInputElement).value; }}
                              @keydown=${(e: KeyboardEvent) => this._handleEditKeydown(e, row)}
                              @blur=${() => this._commitEdit(row)}
                              autofocus />
                          ` : html`${this.enableAudit && this._auditTrail.hasHistory(this._getRowKey(row), col.field) ? html`<span class="zg-audit-dot" title="${this._getAuditTooltip(row, col.field)}"></span>` : nothing}${this._renderCellContent(val, col, row)}`}
                        </td>
                      `;
                    })}
                    ${hasActions && !isTotals ? html`
                      <td class="zg-td zg-td-right zg-td-actions" style="position:sticky;right:0;z-index:3;background:var(--zg-row-bg, var(--zg-bg));white-space:nowrap">
                        ${this.actionButtons.map(btn => html`
                          <button class="zg-btn-icon" style="${btn.color ? `color:${btn.color}` : ''}"
                                  title="${btn.label}"
                                  @click=${(e: Event) => { e.stopPropagation(); this._handleAction(btn.action, row); }}>
                            ${unsafeHTML(this._resolveActionIcon(btn.icon))}
                          </button>
                        `)}
                      </td>
                    ` : hasActions ? html`<td class="zg-td"></td>` : nothing}
                  </tr>
                  ${expanded && !this._isMobile ? html`
                    <tr class="zg-row-detail">
                      <td class="zg-td-detail" colspan="${colSpanTotal}">
                        ${this.detailColumns && this.detailRowsAccessor ? html`
                          <div class="zg-detail-panel">
                            <zentto-grid
                              .columns=${this.detailColumns}
                              .rows=${this.detailRowsAccessor(row)}
                              .theme=${this.theme}
                              .locale=${this.locale}
                              .density=${this.density}
                              .defaultCurrency=${this.defaultCurrency}
                              height="auto"
                              show-totals
                            ></zentto-grid>
                          </div>
                        ` : this.detailRenderer ? html`
                          <div class="zg-detail-panel" .innerHTML=${this.detailRenderer(row)}></div>
                        ` : nothing}
                      </td>
                    </tr>
                  ` : nothing}
                `;
              })}
            </tbody>
          </table>
        </div>` : nothing}

        <!-- Cell Context Menu -->
        ${this._contextMenu ? html`
          <div class="zg-context-menu" style="left:${this._contextMenu.x}px;top:${this._contextMenu.y}px" @click=${(e: Event) => e.stopPropagation()}>
            <div class="zg-context-item" @click=${this._contextCopyCell}>
              <span class="zg-header-menu-icon">${this._iconHtml('copy')}</span> ${this._t('Copiar valor de celda', 'Copy cell value')}
            </div>
            <div class="zg-context-item" @click=${this._contextCopyRow}>
              <span class="zg-header-menu-icon">${this._iconHtml('copyRow')}</span> ${this._t('Copiar fila', 'Copy row')}
            </div>
            <div class="zg-context-divider"></div>
            <div class="zg-context-item" @click=${this._contextPinLeft}>
              <span class="zg-header-menu-icon">${this._iconHtml('pin')}</span> ${this._t('Fijar columna a la izquierda', 'Pin column left')}
            </div>
            <div class="zg-context-item" @click=${this._contextPinRight}>
              <span class="zg-header-menu-icon">${this._iconHtml('pin')}</span> ${this._t('Fijar columna a la derecha', 'Pin column right')}
            </div>
            ${this._isPinned(this._contextMenu.field) ? html`
              <div class="zg-context-item" @click=${this._contextUnpin}>
                <span class="zg-header-menu-icon">${this._iconHtml('unpin')}</span> ${this._t('Desfijar columna', 'Unpin column')}
              </div>
            ` : nothing}
            <div class="zg-context-divider"></div>
            <div class="zg-context-item" @click=${this._contextFilterByValue}>
              <span class="zg-header-menu-icon">${this._iconHtml('filter')}</span> ${this._t('Filtrar por este valor', 'Filter by this value')}
            </div>
            <div class="zg-context-item" @click=${this._contextExportVisible}>
              <span class="zg-header-menu-icon">${this._iconHtml('export')}</span> ${this._t('Exportar datos visibles', 'Export visible data')}
            </div>
          </div>
        ` : nothing}

        <!-- Header Context Menu (three dots) -->
        ${this._headerMenu ? html`
          <div class="zg-header-menu" style="left:${this._headerMenu.x}px;top:${this._headerMenu.y}px" @click=${(e: Event) => e.stopPropagation()}>
            <div class="zg-header-menu-item" @click=${() => this._headerMenuAction('sort-asc')}>
              <span class="zg-header-menu-icon">${this._iconHtml('sortAsc')}</span> ${this._t('Ordenar ascendente', 'Sort ascending')}
            </div>
            <div class="zg-header-menu-item" @click=${() => this._headerMenuAction('sort-desc')}>
              <span class="zg-header-menu-icon">${this._iconHtml('sortDesc')}</span> ${this._t('Ordenar descendente', 'Sort descending')}
            </div>
            <div class="zg-context-divider"></div>
            <div class="zg-header-menu-item" @click=${() => this._headerMenuAction('filter')}>
              <span class="zg-header-menu-icon">${this._iconHtml('filter')}</span> ${this._t('Filtrar', 'Filter')}
            </div>
            <div class="zg-context-divider"></div>
            <div class="zg-header-menu-item" @click=${() => this._headerMenuAction('hide-column')}>
              <span class="zg-header-menu-icon">${this._iconHtml('hide')}</span> ${this._t('Ocultar columna', 'Hide column')}
            </div>
            <div class="zg-header-menu-item" @click=${() => this._headerMenuAction('manage-columns')}>
              <span class="zg-header-menu-icon">${this._iconHtml('columns')}</span> ${this._t('Administrar columnas', 'Manage columns')}
            </div>
          </div>
        ` : nothing}

        <!-- Footer -->
        <div class="zg-footer">
          <div class="zg-footer-left">
            ${this.enableStatusBar ? html`
              <span class="zg-status-count"><strong>${totalRows}</strong> ${this._t('filas', 'rows')}</span>
              ${this.columns.filter((c) => c.aggregation === 'sum').map((c) => {
                const sum = this._sortedRows.reduce((a, r) => a + (Number(r[c.field]) || 0), 0);
                return html`<span class="zg-status-agg"><strong>${c.header || c.field}:</strong> ${this._formatValue(sum, c)}</span>`;
              })}
            ` : nothing}
          </div>
          <div class="zg-footer-right">
            <span>${this._t('Filas por pagina:', 'Rows per page:')}</span>
            <select class="zg-page-size" @change=${this._handlePageSizeChange}>
              ${this.pageSizeOptions.map((n) => html`<option value=${n} ?selected=${n === this._pageSize}>${n}</option>`)}
            </select>
            <span class="zg-page-info">${from}\u2013${to} ${this._t('de', 'of')} ${totalRows}</span>
            <button class="zg-btn zg-btn-sm" @click=${this._prevPage} ?disabled=${this._page === 0}>\u2039</button>
            <button class="zg-btn zg-btn-sm" @click=${this._nextPage} ?disabled=${this._page >= totalPages - 1}>\u203A</button>
          </div>
        </div>

        </div><!-- /zg-config-main -->

        <!-- Built-in Configurator Panel (right sidebar) -->
        ${this._configOpen && (this.enableConfigurator || this.enableSettings) ? this._renderConfigurator() : nothing}

        </div><!-- /zg-config-wrapper -->

        <!-- Mobile Detail Bottom Sheet -->
        ${this._detailDrawerRow ? html`
          <div class="zg-bottom-sheet-overlay" @click=${this._closeDetailDrawer}></div>
          <div class="zg-bottom-sheet">
            <div class="zg-bottom-sheet-handle"></div>
            <div class="zg-bottom-sheet-header">
              <span class="zg-bottom-sheet-title">${this._t('Detalle', 'Detail')}</span>
              <button class="zg-btn-icon" @click=${this._closeDetailDrawer}>${this._iconHtml('close')}</button>
            </div>
            <div class="zg-bottom-sheet-body">
              ${this.detailRenderer ? html`<div .innerHTML=${this.detailRenderer(this._detailDrawerRow)}></div>` : html`
                ${this._visibleColumns.map(col => html`
                  <div class="zg-bottom-sheet-field">
                    <span class="zg-bottom-sheet-label">${col.header || col.field}</span>
                    <span class="zg-bottom-sheet-value">${this._formatValue(this._detailDrawerRow![col.field], col)}</span>
                  </div>
                `)}
              `}
            </div>
          </div>
        ` : nothing}

      </div>
    `;
  }

  // ─── Configurator Panel (built-in) ──────────────────────────────

  private _toggleConfig() {
    this._configOpen = !this._configOpen;
    if (!this.enableConfigurator) {
      // Legacy: emit event for external configurators
      this._dispatchGridEvent('settings-click', {});
    }
  }

  private _renderConfigSwitch(label: string, checked: boolean, onChange: (v: boolean) => void, tooltip = '') {
    return html`
      <div class="zg-config-switch" title=${tooltip || label}>
        <label class="zg-toggle">
          <input type="checkbox" .checked=${checked} @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)} />
          <span class="zg-toggle-track"></span>
          <span class="zg-toggle-thumb"></span>
        </label>
        <span class="zg-config-switch-label">${label}</span>
      </div>
    `;
  }

  private _renderConfigSelect(label: string, value: string, options: { value: string; label: string }[], onChange: (v: string) => void, tooltip = '') {
    return html`
      <div class="zg-config-select-group" title=${tooltip || label}>
        <span class="zg-config-select-label">${label}</span>
        <select class="zg-config-select" .value=${value} @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}>
          ${options.map(o => html`<option value=${o.value} ?selected=${o.value === value}>${o.label}</option>`)}
        </select>
      </div>
    `;
  }

  /** Detect numeric columns from data */
  private get _numericColumns(): ColumnDef[] {
    return this.columns.filter(c => c.type === 'number' || c.currency);
  }

  /** Detect text/category columns (non-numeric, non-internal) */
  private get _textColumns(): ColumnDef[] {
    return this.columns.filter(c => !c.field.startsWith('__') && c.type !== 'number' && !c.currency);
  }

  /** Detect groupable columns */
  private get _groupableColumns(): ColumnDef[] {
    return this.columns.filter(c => c.groupable && !c.field.startsWith('__'));
  }

  private _renderConfigurator() {
    const tab = this._configTab;
    const tabs: { id: 'features' | 'pivot' | 'groups' | 'appearance' | 'code'; icon: string; label: string; tooltip: string }[] = [
      { id: 'features', icon: 'columns', label: this._t('Funciones', 'Features'), tooltip: this._t('Activar/desactivar funcionalidades', 'Toggle features on/off') },
      { id: 'pivot', icon: 'pivot', label: 'Pivot', tooltip: this._t('Tabla dinamica con filas, columnas y valores', 'Dynamic table with rows, columns and values') },
      { id: 'groups', icon: 'drag', label: this._t('Grupos', 'Groups'), tooltip: this._t('Agrupar filas por campo', 'Group rows by field') },
      { id: 'appearance', icon: 'density', label: this._t('Tema', 'Theme'), tooltip: this._t('Tema, densidad e idioma', 'Theme, density and language') },
      { id: 'code', icon: 'markdown', label: this._t('Codigo', 'Code'), tooltip: this._t('Codigo copiable para React, HTML o Vue', 'Copyable code for React, HTML or Vue') },
    ];

    return html`
      <div class="zg-config-panel" @click=${(e: Event) => e.stopPropagation()}>
        <div class="zg-config-header">
          <span class="zg-config-title">${tabs.find(t => t.id === tab)?.label || 'Config'}</span>
          <button class="zg-config-close" @click=${() => { this._configOpen = false; }}>${this._iconHtml('close')}</button>
        </div>

        <div class="zg-config-tabs">
          ${tabs.map(t => html`
            <button class="zg-config-tab ${tab === t.id ? 'zg-config-tab--active' : ''}"
                    @click=${() => { this._configTab = t.id; }}
                    title=${t.tooltip}>${this._iconHtml(t.icon)}</button>
          `)}
        </div>

        <div class="zg-config-body">
          ${tab === 'features' ? this._renderConfigFeatures() : nothing}
          ${tab === 'pivot' ? this._renderConfigPivot() : nothing}
          ${tab === 'groups' ? this._renderConfigGroups() : nothing}
          ${tab === 'appearance' ? this._renderConfigAppearance() : nothing}
          ${tab === 'code' ? this._renderConfigCode() : nothing}
        </div>
      </div>
    `;
  }

  // ─── Tab: Features ──────────────────────────────────
  private _renderConfigFeatures() {
    return html`
      <div class="zg-config-section">${this._t('Funciones', 'Features')}</div>
      ${this._renderConfigSwitch(this._t('Filtros en headers', 'Header filters'), this.enableHeaderFilters, v => { this.enableHeaderFilters = v; }, this._t('Inputs de filtro debajo de cada columna', 'Filter inputs below each column header'))}
      ${this._renderConfigSwitch(this._t('Fila de totales', 'Totals row'), this.showTotals, v => { this.showTotals = v; }, this._t('Muestra totales al final', 'Shows totals at the bottom'))}
      ${this._renderConfigSwitch(this._t('Portapapeles (Ctrl+C)', 'Clipboard (Ctrl+C)'), this.enableClipboard, v => { this.enableClipboard = v; }, this._t('Copiar datos', 'Copy data'))}
      ${this._renderConfigSwitch(this._t('Menu contextual', 'Context menu'), this.enableContextMenu, v => { this.enableContextMenu = v; }, this._t('Click derecho sobre celdas', 'Right-click on cells'))}
      ${this._renderConfigSwitch(this._t('Barra de estado', 'Status bar'), this.enableStatusBar, v => { this.enableStatusBar = v; }, this._t('Conteo y agregaciones en footer', 'Count and aggregations in footer'))}
      ${this._renderConfigSwitch(this._t('Maestro-detalle', 'Master-detail'), this.enableMasterDetail, v => { this.enableMasterDetail = v; }, this._t('Expandir filas', 'Expand rows'))}
      ${this._renderConfigSwitch(this._t('Importar datos', 'Import data'), this.enableImport, v => { this.enableImport = v; }, this._t('Excel, CSV o JSON', 'Excel, CSV or JSON'))}
      ${this._renderConfigSwitch(this._t('Seleccion de filas', 'Row selection'), this.enableRowSelection, v => { this.enableRowSelection = v; }, this._t('Checkboxes para seleccionar', 'Checkboxes to select'))}
      ${this._renderConfigSwitch(this._t('Edicion en linea', 'Inline editing'), this.enableEditing, v => { this.enableEditing = v; }, this._t('Click en celda para editar (tipo Excel)', 'Click cell to edit (Excel-like)'))}
      ${this._renderConfigSwitch(this._t('Menu de columna', 'Column menu'), this.enableHeaderMenu, v => { this.enableHeaderMenu = v; }, this._t('Menu de 3 puntos en headers', 'Three-dot menu on headers'))}
      ${this._renderConfigSwitch(this._t('Arrastrar filas', 'Drag & drop'), this.enableDragDrop, v => { this.enableDragDrop = v; }, this._t('Reordenar filas arrastrando', 'Reorder rows by dragging'))}
      ${this._renderConfigSwitch(this._t('Seleccion de rango', 'Range selection'), this.enableRangeSelection, v => { this.enableRangeSelection = v; }, this._t('Seleccionar celdas arrastrando como Excel', 'Select cells by dragging like Excel'))}
      ${this._renderConfigSwitch(this._t('Pegar desde Excel', 'Paste from Excel'), this.enablePaste, v => { this.enablePaste = v; }, this._t('Ctrl+V para pegar datos desde Excel/Sheets', 'Ctrl+V to paste data from Excel/Sheets'))}
      ${this._renderConfigSwitch(this._t('Deshacer/Rehacer', 'Undo/Redo'), this.enableUndoRedo, v => { this.enableUndoRedo = v; }, this._t('Ctrl+Z / Ctrl+Y para deshacer y rehacer', 'Ctrl+Z / Ctrl+Y to undo and redo'))}
      ${this._renderConfigSwitch(this._t('Virtual Scroll', 'Virtual Scroll'), this.enableVirtualScroll, v => { this.enableVirtualScroll = v; }, this._t('Rendimiento para 100K+ filas', 'Performance for 100K+ rows'))}

      <div class="zg-config-divider"></div>
      <div class="zg-config-section">v0.2</div>
      ${this._renderConfigSwitch(this._t('Virtual Scroll (100K+)', 'Virtual Scroll (100K+)'), this.enableVirtualScroll, v => { this.enableVirtualScroll = v; }, this._t('Renderiza solo filas visibles', 'Renders only visible rows'))}
      ${this._renderConfigSwitch(this._t('Deshacer/Rehacer', 'Undo/Redo'), this.enableUndoRedo, v => { this.enableUndoRedo = v; }, 'Ctrl+Z / Ctrl+Y')}
      ${this._renderConfigSwitch(this._t('Seleccion de rango', 'Range Selection'), this.enableRangeSelection, v => { this.enableRangeSelection = v; }, this._t('Seleccion tipo Excel con Shift+Click', 'Excel-like selection with Shift+Click'))}
      ${this._renderConfigSwitch(this._t('Pegar desde Excel', 'Paste from Excel'), this.enablePaste, v => { this.enablePaste = v; }, 'Ctrl+V')}

      <div class="zg-config-divider"></div>
      <div class="zg-config-section">${this._t('Barra de herramientas', 'Toolbar')}</div>
      ${this._renderConfigSwitch(this._t('Mostrar toolbar', 'Show toolbar'), this.enableToolbar, v => { this.enableToolbar = v; }, this._t('Barra superior con busqueda y botones', 'Top bar with search and buttons'))}
      ${this.enableToolbar ? html`
        ${this._renderConfigSwitch(this._t('Busqueda rapida', 'Quick search'), this.showToolbarSearch, v => { this.showToolbarSearch = v; }, this._t('Campo de busqueda global', 'Global search field'))}
        ${this._renderConfigSwitch(this._t('Selector de columnas', 'Column chooser'), this.showToolbarColumns, v => { this.showToolbarColumns = v; }, this._t('Ocultar/mostrar columnas', 'Hide/show columns'))}
        ${this._renderConfigSwitch(this._t('Selector de densidad', 'Density picker'), this.showToolbarDensity, v => { this.showToolbarDensity = v; }, this._t('Compacto, normal, amplio', 'Compact, standard, comfortable'))}
        ${this._renderConfigSwitch(this._t('Botones de exportar', 'Export buttons'), this.showToolbarExport, v => { this.showToolbarExport = v; }, this._t('CSV, Excel, JSON', 'CSV, Excel, JSON'))}
        ${this._renderConfigSwitch(this._t('Boton de filtros', 'Filter button'), this.showToolbarFilter, v => { this.showToolbarFilter = v; }, this._t('Panel de filtros avanzados', 'Advanced filter panel'))}
        ${this._renderConfigSwitch(this._t('Boton crear', 'Create button'), this.enableCreate, v => { this.enableCreate = v; }, this._t('Boton para crear nuevo registro', 'Button to create new record'))}
      ` : nothing}

      <div class="zg-config-divider"></div>
      <div class="zg-config-section">${this._t('Vistas', 'Views')}</div>
      ${this._renderConfigSwitch(this._t('Vista tabla', 'Table view'), this.showViewTable, v => { this.showViewTable = v; if (!v && this.viewMode === 'table') this.viewMode = 'form'; }, this._t('Filas y columnas clasicas', 'Classic rows and columns'))}
      ${this._renderConfigSwitch(this._t('Vista formulario', 'Form view'), this.showViewForm, v => { this.showViewForm = v; }, this._t('Un registro a la vez', 'One record at a time'))}
      ${this._renderConfigSwitch(this._t('Vista tarjetas', 'Cards view'), this.showViewCards, v => { this.showViewCards = v; }, this._t('Grid de tarjetas', 'Card grid'))}
      ${this._renderConfigSwitch(this._t('Vista kanban', 'Kanban view'), this.showViewKanban, v => { this.showViewKanban = v; }, this._t('Columnas por estado', 'Columns by status'))}
    `;
  }

  // ─── Tab: Pivot ──────────────────────────────────────
  @state() private _codeFw: 'react' | 'html' | 'vue' = 'react';

  private _ensurePivotConfig(): PivotConfig {
    return this.pivotConfig ?? { rowField: '', columnField: '', valueField: '', aggregation: 'sum', showGrandTotals: true, showRowTotals: true };
  }

  private _updatePivot(partial: Partial<PivotConfig>) {
    this.pivotConfig = { ...this._ensurePivotConfig(), ...partial };
  }

  private _renderConfigPivot() {
    const textCols = this._textColumns;
    const numCols = this._numericColumns;
    const hasPivotData = numCols.length > 0 && textCols.length >= 2;
    const aggLabels: Record<string, string> = { sum: this._t('Suma', 'Sum'), avg: this._t('Promedio', 'Avg'), count: this._t('Conteo', 'Count'), min: 'Min', max: 'Max' };
    const pc = this._ensurePivotConfig();

    return html`
      <div class="zg-config-section">Pivot</div>
      ${this._renderConfigSwitch(this._t('Modo Pivot', 'Pivot Mode'), this.enablePivot, v => {
        this.enablePivot = v;
        if (v && !this.pivotConfig) {
          // Auto-initialize with best guess from columns
          const textCols = this._textColumns;
          const numCols = this._numericColumns;
          if (textCols.length >= 2 && numCols.length >= 1) {
            this.pivotConfig = {
              rowField: textCols[0].field,
              columnField: textCols[1].field,
              valueField: numCols[0].field,
              aggregation: 'sum',
              showGrandTotals: true,
              showRowTotals: true,
            };
          }
        }
      }, this._t('Transforma los datos en una tabla dinamica', 'Transform data into a dynamic pivot table'))}

      ${this.enablePivot && hasPivotData ? html`
        ${this._renderConfigSelect(this._t('Filas (eje Y)', 'Rows (Y axis)'),
          pc.rowField,
          textCols.map(c => ({ value: c.field, label: c.header || c.field })),
          v => this._updatePivot({ rowField: v })
        )}
        <span class="zg-config-hint">${this._t('Cada valor unico sera una fila', 'Each unique value becomes a row')}</span>

        ${this._renderConfigSelect(this._t('Columnas (eje X)', 'Columns (X axis)'),
          pc.columnField,
          textCols.map(c => ({ value: c.field, label: c.header || c.field })),
          v => this._updatePivot({ columnField: v })
        )}
        <span class="zg-config-hint">${this._t('Cada valor unico genera una columna', 'Each unique value becomes a column')}</span>

        <div class="zg-config-divider"></div>
        <div class="zg-config-section">${this._t('Valores', 'Values')}</div>

        <div class="zg-config-row">
          ${this._renderConfigSelect(this._t('Campo', 'Field'),
            pc.valueField,
            numCols.map(c => ({ value: c.field, label: c.header || c.field })),
            v => this._updatePivot({ valueField: v })
          )}
          ${this._renderConfigSelect('Fn',
            pc.aggregation || 'sum',
            [{ value: 'sum', label: this._t('Suma', 'Sum') }, { value: 'avg', label: this._t('Promedio', 'Avg') }, { value: 'count', label: this._t('Conteo', 'Count') }, { value: 'min', label: 'Min' }, { value: 'max', label: 'Max' }],
            v => this._updatePivot({ aggregation: v as any })
          )}
        </div>

        ${pc.valueField ? html`
          <span class="zg-config-chip">
            ${aggLabels[pc.aggregation || 'sum']}(${pc.valueField})
            <button class="zg-config-chip-x" @click=${() => this._updatePivot({ valueField: '' })}>${this._iconHtml('close')}</button>
          </span>
        ` : nothing}

        <div class="zg-config-divider"></div>
        ${this._renderConfigSwitch(this._t('Gran Total', 'Grand Total'), pc.showGrandTotals ?? true, v => this._updatePivot({ showGrandTotals: v }))}
        ${this._renderConfigSwitch(this._t('Total por fila', 'Row Total'), pc.showRowTotals ?? true, v => this._updatePivot({ showRowTotals: v }))}
      ` : this.enablePivot && !hasPivotData ? html`
        <span class="zg-config-hint">${this._t(
          'No hay suficientes campos para pivot. Necesitas al menos 2 campos de texto y 1 numerico.',
          'Not enough fields for pivot. Need at least 2 text fields and 1 numeric.'
        )}</span>
      ` : !this.enablePivot ? html`
        <span class="zg-config-hint">${this._t(
          'Activa Pivot Mode para crear una tabla dinamica.',
          'Enable Pivot Mode to create a dynamic table.'
        )}</span>
      ` : nothing}
    `;
  }

  // ─── Tab: Groups ─────────────────────────────────────
  private _renderConfigGroups() {
    const groupable = this._groupableColumns.length > 0 ? this._groupableColumns : this._textColumns;
    return html`
      <div class="zg-config-section">${this._t('Grupos', 'Groups')}</div>
      ${this._renderConfigSwitch(this._t('Agrupar filas', 'Row Groups'), this.enableGrouping, v => { this.enableGrouping = v; if (!v) { this.groupField = ''; } }, this._t('Agrupa filas por un campo con subtotales', 'Group rows by a field with subtotals'))}

      ${this.enableGrouping ? html`
        <span class="zg-config-hint">${this._t('Agrupar filas por campo', 'Group rows by field')}</span>
        ${this._renderConfigSelect(this._t('Agrupar por', 'Group by'),
          this.groupField,
          groupable.map(c => ({ value: c.field, label: c.header || c.field })),
          v => { this.groupField = v; this._initGroups(); }
        )}

        ${this.groupField ? html`
          <span class="zg-config-chip">
            ${this.columns.find(c => c.field === this.groupField)?.header || this.groupField}
            <button class="zg-config-chip-x" @click=${() => { this.groupField = ''; this.enableGrouping = false; }}>${this._iconHtml('close')}</button>
          </span>
        ` : nothing}

        ${this._renderConfigSelect(this._t('Ordenar', 'Sort'),
          this.groupSort || 'asc',
          [{ value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }],
          v => { this.groupSort = v as any; }
        )}

        ${this._renderConfigSwitch(this._t('Subtotales', 'Subtotals'), this.groupSubtotals, v => { this.groupSubtotals = v; })}

        <div class="zg-config-divider"></div>
        ${this._renderConfigSwitch(this._t('Zona de arrastre', 'Drop zone'), this.enableGroupDropZone, v => { this.enableGroupDropZone = v; }, this._t('Arrastra columnas al panel para agrupar', 'Drag column headers to group'))}
      ` : html`
        <span class="zg-config-hint">${this._t(
          'Activa Row Groups para agrupar filas por un campo.',
          'Enable Row Groups to group rows by a field.'
        )}</span>
      `}

      <div class="zg-config-divider"></div>
      <div class="zg-config-section">${this._t('Fijar columnas (Pin)', 'Pin columns')}</div>
      <span class="zg-config-hint">${this._t('Haz clic en los iconos para fijar a izquierda o derecha', 'Click icons to pin left or right')}</span>
      ${this.columns.filter(c => !c.field.startsWith('__')).map(col => {
        const leftPins = this.pinnedColumns?.left || [];
        const rightPins = this.pinnedColumns?.right || [];
        const isPinnedLeft = leftPins.includes(col.field);
        const isPinnedRight = rightPins.includes(col.field);
        return html`
          <div class="zg-config-switch" style="padding:3px 0">
            <button class="zg-config-close" style="font-size:12px;${isPinnedLeft ? 'color:var(--zg-primary)' : ''}"
                    title="${this._t('Fijar izquierda', 'Pin left')}"
                    @click=${() => {
                      const lp = this.pinnedColumns?.left || [];
                      const rp = this.pinnedColumns?.right || [];
                      if (isPinnedLeft) {
                        this.pinnedColumns = { left: lp.filter((f: string) => f !== col.field), right: rp };
                      } else {
                        this.pinnedColumns = { left: [...lp, col.field], right: rp.filter((f: string) => f !== col.field) };
                      }
                    }}>${this._iconHtml('pinLeft')}</button>
            <span class="zg-config-switch-label" style="flex:1;font-size:12px">${col.header || col.field}</span>
            <button class="zg-config-close" style="font-size:12px;${isPinnedRight ? 'color:var(--zg-primary)' : ''}"
                    title="${this._t('Fijar derecha', 'Pin right')}"
                    @click=${() => {
                      const lp = this.pinnedColumns?.left || [];
                      const rp = this.pinnedColumns?.right || [];
                      if (isPinnedRight) {
                        this.pinnedColumns = { left: lp, right: rp.filter((f: string) => f !== col.field) };
                      } else {
                        this.pinnedColumns = { left: lp.filter((f: string) => f !== col.field), right: [...rp, col.field] };
                      }
                    }}>${this._iconHtml('pinRight')}</button>
          </div>
        `;
      })}
    `;
  }

  // ─── Tab: Appearance ──────────────────────────────────
  private _renderConfigAppearance() {
    return html`
      <div class="zg-config-section">${this._t('Apariencia', 'Appearance')}</div>
      ${this._renderConfigSelect(this._t('Tema', 'Theme'), this.theme,
        [{ value: 'light', label: this._t('Claro', 'Light') }, { value: 'dark', label: this._t('Oscuro', 'Dark') }, { value: 'zentto', label: 'Zentto' }],
        v => { this.theme = v as any; },
        this._t('Esquema de colores del grid', 'Grid color scheme')
      )}

      <div class="zg-config-section">${this._t('Densidad', 'Density')}</div>
      <div style="display:flex;gap:4px">
        ${(['compact', 'standard', 'comfortable'] as const).map(d => {
          const labels: Record<string, string> = {
            compact: this._t('Compacto', 'Compact'),
            standard: this._t('Normal', 'Standard'),
            comfortable: this._t('Amplio', 'Comfortable'),
          };
          const icons: Record<string, string> = {
            compact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
            standard: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="19" x2="21" y2="19"/></svg>',
            comfortable: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="4" x2="21" y2="4"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="20" x2="21" y2="20"/></svg>',
          };
          return html`
            <button class="zg-config-fw-tab ${this.density === d ? 'zg-config-fw-tab--active' : ''}"
                    style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px"
                    title=${labels[d]}
                    @click=${() => { this.density = d; }}>
              ${unsafeHTML(icons[d])}
              <span style="font-size:9px">${labels[d]}</span>
            </button>
          `;
        })}
      </div>

      <div class="zg-config-divider"></div>
      ${this._renderConfigSelect(this._t('Idioma', 'Language'), this.locale,
        [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }],
        v => { this.locale = v as any; },
        this._t('Idioma de la interfaz', 'Interface language')
      )}
    `;
  }

  // ─── Tab: Code Generator ──────────────────────────────
  private _renderConfigCode() {
    const fw = this._codeFw;
    const boolAttrs = [
      this.showTotals && 'show-totals', this.enableHeaderFilters && 'enable-header-filters',
      this.enableClipboard && 'enable-clipboard', this.enableFind && 'enable-find',
      this.enableQuickSearch && 'enable-quick-search', this.enableContextMenu && 'enable-context-menu',
      this.enableStatusBar && 'enable-status-bar', this.enableRowSelection && 'enable-row-selection',
      this.enableMasterDetail && 'enable-master-detail', this.enableImport && 'enable-import',
      this.enableGrouping && 'enable-grouping', this.enableGroupDropZone && 'enable-group-drop-zone',
      this.enablePivot && 'enable-pivot',
    ].filter(Boolean) as string[];

    const code = fw === 'react' ? this._genReactCode(boolAttrs) : fw === 'vue' ? this._genVueCode(boolAttrs) : this._genHtmlCode(boolAttrs);

    return html`
      <div class="zg-config-fw-tabs">
        <button class="zg-config-fw-tab ${fw === 'react' ? 'zg-config-fw-tab--active' : ''}" @click=${() => { this._codeFw = 'react'; }}>React</button>
        <button class="zg-config-fw-tab ${fw === 'html' ? 'zg-config-fw-tab--active' : ''}" @click=${() => { this._codeFw = 'html'; }}>HTML</button>
        <button class="zg-config-fw-tab ${fw === 'vue' ? 'zg-config-fw-tab--active' : ''}" @click=${() => { this._codeFw = 'vue'; }}>Vue</button>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:4px">
        <button class="zg-btn-icon" style="font-size:11px" @click=${() => navigator.clipboard.writeText(code)}>${this._iconHtml('copy')} <span style="font-size:10px">${this._t('Copiar', 'Copy')}</span></button>
      </div>
      <pre class="zg-config-code">${code}</pre>
    `;
  }

  private _genReactCode(attrs: string[]): string {
    return `// npm install @zentto/datagrid @zentto/datagrid-core
"use client";
import { useEffect, useRef } from "react";
import "@zentto/datagrid";

export default function MyGrid() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.columns = [/* your columns */];
    el.rows = [/* your data */];${this.enableGrouping && this.groupField ? `\n    el.groupField = "${this.groupField}";` : ''}${this.enablePivot && this.pivotConfig?.rowField ? `\n    el.pivotConfig = ${JSON.stringify(this.pivotConfig)};` : ''}
  }, []);

  return (
    <zentto-grid
      ref={ref}
      ${attrs.join('\n      ')}
      theme="${this.theme}"
      density="${this.density}"
      locale="${this.locale}"
      height="500px"
    />
  );
}`;
  }

  private _genHtmlCode(attrs: string[]): string {
    return `<!-- npm install @zentto/datagrid -->
<zentto-grid
  ${attrs.join('\n  ')}
  theme="${this.theme}"
  density="${this.density}"
  locale="${this.locale}"
  height="500px"
></zentto-grid>

<script type="module">
  import "@zentto/datagrid";
  const grid = document.querySelector("zentto-grid");
  grid.columns = [/* your columns */];
  grid.rows = [/* your data */];${this.enablePivot && this.pivotConfig?.rowField ? `\n  grid.pivotConfig = ${JSON.stringify(this.pivotConfig)};` : ''}
</script>`;
  }

  private _genVueCode(attrs: string[]): string {
    return `<!-- npm install @zentto/datagrid @zentto/datagrid-core -->
<script setup>
import { ref, onMounted } from "vue";
import "@zentto/datagrid";

const gridRef = ref(null);

onMounted(() => {
  const el = gridRef.value;
  el.columns = [/* your columns */];
  el.rows = [/* your data */];${this.enablePivot && this.pivotConfig?.rowField ? `\n  el.pivotConfig = ${JSON.stringify(this.pivotConfig)};` : ''}
});
</script>

<template>
  <zentto-grid
    ref="gridRef"
    ${attrs.join('\n    ')}
    theme="${this.theme}"
    density="${this.density}"
    locale="${this.locale}"
    height="500px"
  />
</template>`;
  }

  // ─── View: Form (one record at a time) ─────────────────────────

  private _renderFormView() {
    const dataRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const row = dataRows[this._formIndex];
    if (!row) return html`<div style="padding:20px;text-align:center;color:var(--zg-text-muted)">${this._t('Sin datos', 'No data')}</div>`;
    const cols = this._visibleColumns;

    return html`
      <div class="zg-table-wrapper" style="padding:16px;overflow:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--zg-border)">
          <button class="zg-btn" @click=${() => { if (this._formIndex > 0) this._formIndex--; }} ?disabled=${this._formIndex === 0}>${this._iconHtml('chevronLeft')} ${this._t('Anterior', 'Previous')}</button>
          <span style="font-size:13px;font-weight:600;color:var(--zg-text-secondary)">${this._formIndex + 1} / ${dataRows.length}</span>
          <button class="zg-btn" @click=${() => { if (this._formIndex < dataRows.length - 1) this._formIndex++; }} ?disabled=${this._formIndex >= dataRows.length - 1}>${this._t('Siguiente', 'Next')} ${this._iconHtml('chevronRight')}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
          ${cols.map(col => {
            const val = row[col.field];
            return html`
              <div style="display:flex;flex-direction:column;gap:2px;padding:8px;border-radius:var(--zg-radius);border:1px solid var(--zg-border)">
                <span style="font-size:10px;font-weight:600;color:var(--zg-text-muted);text-transform:uppercase;letter-spacing:0.05em">${col.header || col.field}</span>
                <span style="font-size:13px;color:var(--zg-text)">${this._renderCellContent(val, col, row)}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  // ─── View: Cards (grid of cards) ──────────────────────────────

  private _renderCardsView() {
    const dataRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const cols = this._visibleColumns.slice(0, 6); // Show max 6 fields per card
    const titleCol = cols[0];
    const subtitleCol = cols[1];

    return html`
      <div class="zg-table-wrapper" style="padding:12px;overflow:auto">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">
          ${dataRows.map((row, idx) => html`
            <div style="border:1px solid var(--zg-border);border-radius:var(--zg-radius-lg);padding:12px;background:var(--zg-bg);cursor:pointer;transition:box-shadow 0.15s"
                 @click=${() => this._dispatchGridEvent('row-click', { row, rowIndex: idx })}
                 @mouseenter=${(e: Event) => (e.target as HTMLElement).style.boxShadow = 'var(--zg-shadow-md)'}
                 @mouseleave=${(e: Event) => (e.target as HTMLElement).style.boxShadow = 'none'}>
              ${titleCol ? html`<div style="font-weight:700;font-size:14px;margin-bottom:4px;color:var(--zg-text)">${this._renderCellContent(row[titleCol.field], titleCol, row)}</div>` : nothing}
              ${subtitleCol ? html`<div style="font-size:12px;color:var(--zg-text-secondary);margin-bottom:8px">${this._renderCellContent(row[subtitleCol.field], subtitleCol, row)}</div>` : nothing}
              ${cols.slice(2).map(col => html`
                <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid var(--zg-border)">
                  <span style="color:var(--zg-text-muted)">${col.header || col.field}</span>
                  <span style="color:var(--zg-text);font-weight:500">${this._renderCellContent(row[col.field], col, row)}</span>
                </div>
              `)}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  // ─── View: Kanban (columns by status) ─────────────────────────

  private _renderKanbanView() {
    const dataRows = this._displayRows.filter(r => !r['__zentto_totals__'] && !r['__zentto_group__'] && !r['__zentto_subtotal__']);
    const field = this.kanbanField || this.columns.find(c => c.statusColors)?.field || '';
    if (!field) return html`<div style="padding:20px;text-align:center;color:var(--zg-text-muted)">${this._t('Selecciona un campo para Kanban', 'Select a field for Kanban')}</div>`;

    const col = this.columns.find(c => c.field === field);
    const groups = new Map<string, typeof dataRows>();
    for (const row of dataRows) {
      const key = String(row[field] ?? '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    const titleCol = this._visibleColumns.find(c => c.field !== field && c.type !== 'number');
    const valueCol = this._visibleColumns.find(c => c.type === 'number' || c.currency);

    return html`
      <div class="zg-table-wrapper" style="padding:12px;overflow-x:auto;overflow-y:auto">
        <div style="display:flex;gap:10px;min-width:max-content">
          ${[...groups.entries()].map(([key, rows]) => {
            const statusColor = col?.statusColors?.[key] || 'default';
            return html`
              <div style="min-width:220px;max-width:280px;flex:1;background:var(--zg-surface);border-radius:var(--zg-radius-lg);border:1px solid var(--zg-border);display:flex;flex-direction:column">
                <div style="padding:8px 12px;font-weight:700;font-size:12px;border-bottom:1px solid var(--zg-border);display:flex;align-items:center;gap:6px">
                  <span class="zg-chip zg-chip--${statusColor} zg-chip--filled" style="font-size:10px;height:18px">${key || this._t('Sin estado', 'No status')}</span>
                  <span style="color:var(--zg-text-muted);font-size:11px">${rows.length}</span>
                </div>
                <div style="padding:6px;display:flex;flex-direction:column;gap:6px;overflow-y:auto;flex:1">
                  ${rows.map(row => html`
                    <div style="background:var(--zg-bg);border:1px solid var(--zg-border);border-radius:var(--zg-radius);padding:8px;cursor:pointer;font-size:12px"
                         @click=${() => this._dispatchGridEvent('row-click', { row, rowIndex: dataRows.indexOf(row) })}>
                      ${titleCol ? html`<div style="font-weight:600;margin-bottom:4px">${row[titleCol.field]}</div>` : nothing}
                      ${valueCol ? html`<div style="color:var(--zg-text-secondary)">${this._formatValue(row[valueCol.field], valueCol)}</div>` : nothing}
                    </div>
                  `)}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  // ─── Rich Toolbar ─────────────────────────────────────────────

  private _renderToolbar(totalRows: number) {
    const filterCount = this._activeFilterCount;
    const selCount = this._selectedRows.size;
    return html`
      <div class="zg-toolbar">
        <div class="zg-toolbar-left">
          <span class="zg-row-count">${totalRows} ${this._t('filas', 'rows')}</span>

          <!-- Create Button -->
          ${this.enableCreate ? html`
            <button class="zg-btn-primary" style="padding:4px 12px;font-size:12px;border-radius:16px;display:flex;align-items:center;gap:4px"
                    @click=${() => this._dispatchGridEvent('create-click', {})}
                    title="${this.createLabel || this._t('Nuevo', 'New')}">
              ${this._iconHtml(this.createIcon || 'add')}
              <span>${this.createLabel || this._t('Nuevo', 'New')}</span>
            </button>
          ` : nothing}

          ${selCount > 0 ? html`<span class="zg-selection-info">${selCount} ${this._t('seleccionadas', 'selected')}</span>` : nothing}

          <!-- Quick Search (global filter) -->
          ${this.enableQuickSearch && this.showToolbarSearch ? html`
            <input type="text" class="zg-find-input" style="width:180px;margin-left:8px"
              placeholder="${this._t('Buscar en tabla...', 'Search table...')}"
              .value=${this._quickSearch}
              @input=${(e: InputEvent) => { this._quickSearch = (e.target as HTMLInputElement).value; this._page = 0; }} />
          ` : nothing}

          <!-- Filter Panel toggle -->
          ${this.filterPanel.length > 0 && this.showToolbarFilter ? html`
            <button class="zg-btn-icon ${this._showFilterPanel ? 'zg-btn-icon--active' : ''}"
                    @click=${(e: Event) => { e.stopPropagation(); this._showFilterPanel = !this._showFilterPanel; }}
                    title="${this._t('Filtros', 'Filters')}">
              ${this._iconHtml('filter')}${filterCount > 0 ? html`<span class="zg-filter-active-count">${filterCount}</span>` : nothing}
            </button>
          ` : nothing}
        </div>

        <div class="zg-toolbar-right">
          <!-- View Mode Switcher -->
          ${this.showViewTable ? html`<button class="zg-btn-icon ${this.viewMode === 'table' ? 'zg-btn-icon--active' : ''}" @click=${() => { this.viewMode = 'table'; }} title="${this._t('Vista tabla', 'Table view')}">${this._iconHtml('viewTable')}</button>` : nothing}
          ${this.showViewForm ? html`<button class="zg-btn-icon ${this.viewMode === 'form' ? 'zg-btn-icon--active' : ''}" @click=${() => { this.viewMode = 'form'; this._formIndex = 0; }} title="${this._t('Vista formulario', 'Form view')}">${this._iconHtml('viewForm')}</button>` : nothing}
          ${this.showViewCards ? html`<button class="zg-btn-icon ${this.viewMode === 'cards' ? 'zg-btn-icon--active' : ''}" @click=${() => { this.viewMode = 'cards'; }} title="${this._t('Vista tarjetas', 'Cards view')}">${this._iconHtml('viewCards')}</button>` : nothing}
          ${this.showViewKanban && this.columns.some(c => c.statusColors) ? html`
            <button class="zg-btn-icon ${this.viewMode === 'kanban' ? 'zg-btn-icon--active' : ''}" @click=${() => { this.viewMode = 'kanban'; if (!this.kanbanField) { const sc = this.columns.find(c => c.statusColors); if (sc) this.kanbanField = sc.field; } }} title="${this._t('Vista kanban', 'Kanban view')}">${this._iconHtml('viewKanban')}</button>
          ` : nothing}
          <span class="zg-toolbar-sep"></span>

          <!-- Clipboard -->
          ${this.enableClipboard ? html`
            <button class="zg-btn-icon" @click=${this._copyAll} title="${this._t('Copiar todo', 'Copy all')}">${this._iconHtml('clipboard')}</button>
          ` : nothing}

          <!-- Find toggle -->
          ${this.enableFind ? html`
            <button class="zg-btn-icon ${this._findOpen ? 'zg-btn-icon--active' : ''}"
                    @click=${() => { this._findOpen = !this._findOpen; if (!this._findOpen) { this._findQuery = ''; this._findMatches = []; }}}
                    title="Ctrl+F">${this._iconHtml('search')}</button>
          ` : nothing}

          <span class="zg-toolbar-sep"></span>

          <!-- Columns chooser -->
          ${this.showToolbarColumns ? html`<div class="zg-toolbar-dropdown" @click=${(e: Event) => e.stopPropagation()}>
            <button class="zg-btn-icon ${this._showColumnsPanel ? 'zg-btn-icon--active' : ''}"
                    @click=${() => this._togglePanel('columns')}
                    title="${this._t('Columnas', 'Columns')}">${this._iconHtml('columns')}</button>
            ${this._showColumnsPanel ? html`
              <div class="zg-toolbar-panel">
                <div class="zg-panel-header">
                  <span class="zg-panel-title">${this._t('Columnas', 'Columns')}</span>
                  <button class="zg-filter-clear" @click=${this._showAllColumns}>${this._t('Mostrar todas', 'Show all')}</button>
                </div>
                ${this.columns.filter(c => !c.field.startsWith('__')).map(col => html`
                  <label class="zg-col-item">
                    <input type="checkbox" class="zg-col-checkbox"
                      .checked=${!this._hiddenColumns.has(col.field)}
                      @change=${() => this._toggleColumnVisibility(col.field)} />
                    <span>${col.header || col.field}</span>
                  </label>
                `)}
              </div>
            ` : nothing}
          </div>` : nothing}

          <!-- Density picker -->
          ${this.showToolbarDensity ? html`<div class="zg-toolbar-dropdown" @click=${(e: Event) => e.stopPropagation()}>
            <button class="zg-btn-icon ${this._showDensityPanel ? 'zg-btn-icon--active' : ''}"
                    @click=${() => this._togglePanel('density')}
                    title="${this._t('Densidad', 'Density')}">${this._iconHtml('density')}</button>
            ${this._showDensityPanel ? html`
              <div class="zg-toolbar-panel" style="min-width:150px">
                <div class="zg-panel-header">
                  <span class="zg-panel-title">${this._t('Densidad', 'Density')}</span>
                </div>
                <div class="zg-density-item ${this.density === 'compact' ? 'zg-density-item--active' : ''}"
                     @click=${() => { this.density = 'compact'; this._showDensityPanel = false; }}>
                  ${this._t('Compacto', 'Compact')}
                </div>
                <div class="zg-density-item ${this.density === 'standard' ? 'zg-density-item--active' : ''}"
                     @click=${() => { this.density = 'standard'; this._showDensityPanel = false; }}>
                  ${this._t('Normal', 'Standard')}
                </div>
                <div class="zg-density-item ${this.density === 'comfortable' ? 'zg-density-item--active' : ''}"
                     @click=${() => { this.density = 'comfortable'; this._showDensityPanel = false; }}>
                  ${this._t('Amplio', 'Comfortable')}
                </div>
              </div>
            ` : nothing}
          </div>` : nothing}

          <!-- Export buttons (inline, each with distinct icon) -->
          ${this.showToolbarExport ? html`
            <button class="zg-btn-icon" @click=${this._exportCsv} title="CSV">${this._iconHtml('exportCsv')} <span style="font-size:11px;font-weight:600">CSV</span></button>
            <button class="zg-btn-icon" @click=${this._exportExcel} title="Excel" style="color:var(--zg-success,#0d9668)">${this._iconHtml('exportExcel')} <span style="font-size:11px;font-weight:600">Excel</span></button>
            <button class="zg-btn-icon" @click=${this._exportJson} title="JSON" style="color:var(--zg-warning,#e67e22)">${this._iconHtml('exportJson')} <span style="font-size:11px;font-weight:600">JSON</span></button>
          ` : nothing}

          <!-- Import button (available when enableImport or enableEditing) -->
          ${this.enableImport || this.enableEditing ? html`
            <button class="zg-btn-icon" @click=${this._handleImportClick}
                    title="${this._t('Importar Excel/CSV/JSON', 'Import Excel/CSV/JSON')}">${this._iconHtml('import')}</button>
            <input type="file" class="zg-import-file" accept=".csv,.json,.xlsx,.xls" @change=${this._handleFileImport}
                   style="display:none" />
          ` : nothing}

          <!-- Undo/Redo buttons -->
          ${this.enableUndoRedo ? html`
            <span class="zg-toolbar-sep"></span>
            <button class="zg-btn-icon" @click=${() => this.undo()} ?disabled=${!this._undoRedoStack.canUndo}
                    title="${this._t('Deshacer', 'Undo')} (Ctrl+Z)" aria-label="${this._t('Deshacer', 'Undo')}">
              ${unsafeHTML(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`)}
            </button>
            <button class="zg-btn-icon" @click=${() => this.redo()} ?disabled=${!this._undoRedoStack.canRedo}
                    title="${this._t('Rehacer', 'Redo')} (Ctrl+Y)" aria-label="${this._t('Rehacer', 'Redo')}">
              ${unsafeHTML(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`)}
            </button>
          ` : nothing}

          <!-- Settings / Configurator toggle -->
          ${this.enableConfigurator || this.enableSettings ? html`
            <button class="zg-btn-icon ${this._configOpen ? 'zg-btn-icon--active' : ''}" @click=${() => this._toggleConfig()}
                    title="${this._t('Configuracion', 'Settings')}">${this._iconHtml('settings')}</button>
          ` : nothing}
        </div>
      </div>
    `;
  }

  // ─── Filter Panel ─────────────────────────────────────────────

  private _renderFilterPanel() {
    const filterCount = this._activeFilterCount;
    return html`
      <div class="zg-filter-panel">
        ${this.filterPanel.map(fp => {
          const options = this._getFilterOptions(fp.field);
          const currentVal = this._filterPanelValues[fp.field];

          switch (fp.type) {
            case 'select':
              return html`
                <div class="zg-filter-field" style="${fp.width ? `width:${fp.width}px` : ''}">
                  <span class="zg-filter-label">${fp.label}</span>
                  <select class="zg-filter-select"
                    @change=${(e: Event) => this._handleFilterPanelChange(fp.field, (e.target as HTMLSelectElement).value)}>
                    <option value="__all__">${fp.placeholder || this._t('Todos', 'All')}</option>
                    ${options.map(o => html`<option value="${o.value}" ?selected=${currentVal === o.value}>${o.label}</option>`)}
                  </select>
                </div>
              `;

            case 'multi-select':
              return html`
                <div class="zg-filter-field" style="${fp.width ? `width:${fp.width}px` : ''}">
                  <span class="zg-filter-label">${fp.label}</span>
                  <select class="zg-filter-select" multiple
                    @change=${(e: Event) => {
                      const sel = e.target as HTMLSelectElement;
                      const values = [...sel.selectedOptions].map(o => o.value);
                      this._handleFilterPanelChange(fp.field, values);
                    }}>
                    ${options.map(o => html`<option value="${o.value}">${o.label}</option>`)}
                  </select>
                </div>
              `;

            case 'range':
              return html`
                <div class="zg-filter-field">
                  <span class="zg-filter-label">${fp.label}</span>
                  <div class="zg-filter-range">
                    <input type="number" placeholder="${this._t('Min', 'Min')}"
                      .value=${(Array.isArray(currentVal) ? currentVal[0] : '') ?? ''}
                      @input=${(e: InputEvent) => {
                        const cur = Array.isArray(currentVal) ? currentVal : ['', ''];
                        this._handleFilterPanelChange(fp.field, [(e.target as HTMLInputElement).value, cur[1]]);
                      }} />
                    <span>\u2013</span>
                    <input type="number" placeholder="${this._t('Max', 'Max')}"
                      .value=${(Array.isArray(currentVal) ? currentVal[1] : '') ?? ''}
                      @input=${(e: InputEvent) => {
                        const cur = Array.isArray(currentVal) ? currentVal : ['', ''];
                        this._handleFilterPanelChange(fp.field, [cur[0], (e.target as HTMLInputElement).value]);
                      }} />
                  </div>
                </div>
              `;

            case 'text':
              return html`
                <div class="zg-filter-field" style="${fp.width ? `width:${fp.width}px` : ''}">
                  <span class="zg-filter-label">${fp.label}</span>
                  <input type="text" class="zg-filter-text"
                    placeholder="${fp.placeholder || fp.label}"
                    .value=${String(currentVal ?? '')}
                    @input=${(e: InputEvent) => this._handleFilterPanelChange(fp.field, (e.target as HTMLInputElement).value)} />
                </div>
              `;

            case 'date-range':
              return html`
                <div class="zg-filter-field">
                  <span class="zg-filter-label">${fp.label}</span>
                  <div class="zg-filter-range">
                    <input type="date"
                      .value=${(Array.isArray(currentVal) ? currentVal[0] : '') ?? ''}
                      @input=${(e: InputEvent) => {
                        const cur = Array.isArray(currentVal) ? currentVal : ['', ''];
                        this._handleFilterPanelChange(fp.field, [(e.target as HTMLInputElement).value, cur[1]]);
                      }} />
                    <span>\u2013</span>
                    <input type="date"
                      .value=${(Array.isArray(currentVal) ? currentVal[1] : '') ?? ''}
                      @input=${(e: InputEvent) => {
                        const cur = Array.isArray(currentVal) ? currentVal : ['', ''];
                        this._handleFilterPanelChange(fp.field, [cur[0], (e.target as HTMLInputElement).value]);
                      }} />
                  </div>
                </div>
              `;

            default:
              return nothing;
          }
        })}

        ${filterCount > 0 ? html`
          <button class="zg-filter-clear" @click=${this._clearAllFilters}>
            \u2715 ${this._t('Limpiar filtros', 'Clear filters')}
          </button>
        ` : nothing}
      </div>
    `;
  }

  // ─── Column Group Headers helper ─────────────────────────────

  private _renderColumnGroupHeaders(visibleCols: ColumnDef[]) {
    if (!this.columnGroups.length) return nothing;

    const headers: { label: string; colspan: number; isGroup: boolean }[] = [];
    let i = 0;
    while (i < visibleCols.length) {
      const col = visibleCols[i];
      const group = this.columnGroups.find(g => g.children.includes(col.field));
      if (group) {
        let span = 0;
        for (let j = i; j < visibleCols.length; j++) {
          if (group.children.includes(visibleCols[j].field)) span++;
          else break;
        }
        headers.push({ label: group.header, colspan: span, isGroup: true });
        i += span;
      } else {
        headers.push({ label: '', colspan: 1, isGroup: false });
        i++;
      }
    }

    return headers.map(h => html`
      <th class="zg-th zg-th-group ${h.isGroup ? '' : 'zg-th-group-empty'}" colspan="${h.colspan}">
        ${h.label}
      </th>
    `);
  }
}

// Register custom element with guard (prevents HMR double-registration)
if (typeof customElements !== 'undefined' && !customElements.get('zentto-grid')) {
  customElements.define('zentto-grid', ZenttoGrid);
}

declare global {
  interface HTMLElementTagNameMap {
    'zentto-grid': ZenttoGrid;
  }
}
