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
  @property({ type: String }) locale: 'es' | 'en' = 'es';
  @property({ type: Boolean, attribute: 'show-totals' }) showTotals = false;
  @property({ type: String, attribute: 'totals-label' }) totalsLabel = 'Totales';
  @property({ type: Boolean, attribute: 'enable-clipboard' }) enableClipboard = false;
  @property({ type: Boolean, attribute: 'enable-find' }) enableFind = false;
  @property({ type: Boolean, attribute: 'enable-quick-search' }) enableQuickSearch = true;
  @property({ type: Boolean, attribute: 'enable-status-bar' }) enableStatusBar = false;
  @property({ type: Boolean, attribute: 'enable-header-filters' }) enableHeaderFilters = false;
  @property({ type: String, attribute: 'default-currency' }) defaultCurrency = 'USD';
  @property({ type: String, attribute: 'export-filename' }) exportFilename = 'export';
  @property({ type: Array, attribute: 'page-size-options' }) pageSizeOptions = [10, 25, 50, 100];
  @property({ type: Boolean }) loading = false;
  @property({ type: String }) density: 'compact' | 'standard' | 'comfortable' = 'standard';
  @property({ type: String }) height = '500px';

  // ─── Toolbar ─────────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-toolbar' }) enableToolbar = true;

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
    };
    const iconStr = this.icons[name] ?? defaults[name] ?? '';
    return iconStr;
  }

  /** Render an icon as HTML (supports SVG strings) */
  private _iconHtml(name: string) {
    return unsafeHTML(this._icon(name));
  }

  // ─── Inline Editing / CRUD ────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-editing' }) enableEditing = false;
  @property({ attribute: false }) crudConfig?: CrudConfig;

  // ─── Import (available from toolbar without CRUD mode) ────────
  @property({ type: Boolean, attribute: 'enable-import' }) enableImport = false;

  // ─── Settings button (emits 'settings-click' event) ──────────
  @property({ type: Boolean, attribute: 'enable-settings' }) enableSettings = false;

  // ─── Formulas ─────────────────────────────────────────────────
  @property({ attribute: false }) formulas: FormulaDefinition[] = [];

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

  // ─── i18n helper ────────────────────────────────────────────
  private _t(es: string, en: string): string {
    return this.locale === 'es' ? es : en;
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
    } else {
      source = this._paginatedResult.rows;
    }
    if (this.showTotals && !(this.enableGrouping && this.groupField)) {
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

  // ─── Inline Editing ───────────────────────────────────────────

  private _isEditable(field: string): boolean {
    if (!this.enableEditing) return false;
    if (this.crudConfig?.editableFields) return this.crudConfig.editableFields.includes(field);
    return true;
  }

  private _startEdit(row: GridRow, field: string) {
    if (!this._isEditable(field)) return;
    this._editingCell = { rowKey: this._getRowKey(row), field };
    this._editValue = String(row[field] ?? '');
  }

  private _handleEditKeydown(e: KeyboardEvent, row: GridRow) {
    if (e.key === 'Enter') {
      this._commitEdit(row);
    } else if (e.key === 'Escape') {
      this._editingCell = null;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this._commitEdit(row);
      // Move to next editable cell
      const cols = this._visibleColumns.filter(c => this._isEditable(c.field));
      const curIdx = cols.findIndex(c => c.field === this._editingCell?.field);
      if (curIdx >= 0 && curIdx < cols.length - 1) {
        this._startEdit(row, cols[curIdx + 1].field);
      }
    }
  }

  private async _commitEdit(row: GridRow) {
    if (!this._editingCell) return;
    const { field } = this._editingCell;
    const col = this.columns.find(c => c.field === field);
    const newValue = col?.type === 'number' ? Number(this._editValue) : this._editValue;
    const oldValue = row[field];

    if (newValue === oldValue) {
      this._editingCell = null;
      return;
    }

    // Update local data
    const updatedRow = { ...row, [field]: newValue };
    const idField = this.crudConfig?.idField || 'id';
    this.rows = this.rows.map(r => this._getRowKey(r) === this._getRowKey(row) ? updatedRow : r);
    this._editingCell = null;

    // Call API if configured
    if (this.crudConfig?.baseUrl) {
      try {
        const method = this.crudConfig.methods?.update || 'PUT';
        const url = `${this.crudConfig.baseUrl}/${row[idField]}`;
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
        this.rows = this.rows.map(r => this._getRowKey(r) === this._getRowKey(row) ? row : r);
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

  // ─── Format value ─────────────────────────────────────────────

  private _formatValue(val: unknown, col: ColumnDef): string {
    if (val == null) return '';

    if (col.currency) {
      const code = typeof col.currency === 'string' ? col.currency : this.defaultCurrency;
      try {
        return new Intl.NumberFormat(this.locale === 'es' ? 'es-VE' : 'en-US', {
          style: 'currency', currency: code, minimumFractionDigits: 2,
        }).format(Number(val));
      } catch { return String(val); }
    }

    if (col.type === 'number') {
      return new Intl.NumberFormat(this.locale === 'es' ? 'es-VE' : 'en-US', {
        minimumFractionDigits: 2,
      }).format(Number(val));
    }

    if (col.type === 'date' || col.type === 'datetime') {
      try {
        const d = new Date(String(val));
        if (isNaN(d.getTime())) return String(val);
        return d.toLocaleDateString(this.locale === 'es' ? 'es-VE' : 'en-US');
      } catch { return String(val); }
    }

    return String(val);
  }

  // ─── Render cell content ──────────────────────────────────────

  private _renderCellContent(val: unknown, col: ColumnDef, row: GridRow) {
    if (col.renderCell) return html`<span .innerHTML=${col.renderCell(val, row)}></span>`;

    if (col.statusColors && val != null) {
      const color = col.statusColors[String(val)] ?? 'default';
      const variant = col.statusVariant ?? 'filled';
      return html`<span class="zg-chip zg-chip--${color} zg-chip--${variant}">${val}</span>`;
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

    return html`${this._formatValue(val, col)}`;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
    document.addEventListener('click', this._handleDocClick);
    window.addEventListener('resize', this._handleResize);
    if (this.enableGrouping && this.groupField) this._initGroups();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('click', this._handleDocClick);
    window.removeEventListener('resize', this._handleResize);
  }

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
  }

  private _handleDocClick = () => {
    if (this._contextMenu) this._closeContextMenu();
    if (this._headerMenu) this._closeHeaderMenu();
    this._closeAllPanels();
  };

  private _handleResize = () => { this.requestUpdate(); };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this._contextMenu) { this._closeContextMenu(); return; }
      if (this._headerMenu) { this._closeHeaderMenu(); return; }
      this._closeAllPanels();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f' && this.enableFind) {
      e.preventDefault();
      this._findOpen = true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && this.enableClipboard) {
      this._copyAll();
    }
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
    const actionsWidth = hasActions ? Math.max(60, this.actionButtons.length * 32 + 12) : 0;
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

        <!-- Table -->
        <div class="zg-table-wrapper">
          <table class="zg-table">
            <thead>
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
                <th class="zg-th zg-th-row-num" style="width:40px">#</th>
                ${visibleCols.map((col) => {
                  const w = this._columnWidths[col.field] || col.width;
                  const pinStyle = this._getPinHeaderStyle(col.field, visibleCols);
                  const pinClass = this._isPinned(col.field) ? 'zg-th-pinned' : '';
                  return html`
                  <th
                    class="zg-th ${col.sortable ? 'zg-th-sortable' : ''} ${col.type === 'number' || col.currency ? 'zg-th-right' : ''} ${pinClass}"
                    style="${w ? `width:${w}px;` : col.flex ? `flex:${col.flex};` : ''}${pinStyle}"
                    ?draggable=${this.enableGroupDropZone && col.groupable !== false}
                    @dragstart=${this.enableGroupDropZone ? (e: DragEvent) => this._handleHeaderDragStart(e, col.field) : nothing}
                    @click=${() => this._handleSort(col.field)}
                  >
                    <span>${col.header || col.field}${this._getSortIcon(col.field)}</span>
                    ${this.enableHeaderMenu ? html`
                      <span class="zg-th-menu-trigger" @click=${(e: MouseEvent) => this._openHeaderMenu(e, col.field)} title="${this._t('Menu de columna', 'Column menu')}">${this._iconHtml('menu')}</span>
                    ` : nothing}
                    ${col.resizable !== false ? html`
                      <span class="zg-resize-handle" @mousedown=${(e: MouseEvent) => this._handleResizeStart(e, col.field)}></span>
                    ` : nothing}
                  </th>
                `})}
                ${hasActions ? html`
                  <th class="zg-th zg-th-right" style="width:${actionsWidth}px;position:sticky;right:0;z-index:3;background:var(--zg-header-bg, #f8f9fa)">
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
            <tbody>
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
                      return html`
                        <td class="zg-td ${col.type === 'number' || col.currency ? 'zg-td-right' : ''} ${isTotals ? 'zg-td-totals' : ''} ${isMatch ? 'zg-find-match' : ''} ${isCurrent ? 'zg-find-current' : ''} ${pinClass} ${editable ? 'zg-td--editable' : ''}"
                            style="${pinStyle}"
                            @contextmenu=${(e: MouseEvent) => this._handleContextMenu(e, row, col.field, val)}
                            @dblclick=${editable ? () => this._startEdit(row, col.field) : nothing}>
                          ${isEditing ? html`
                            <input type="${col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}"
                              class="zg-edit-input"
                              .value=${this._editValue}
                              @input=${(e: InputEvent) => { this._editValue = (e.target as HTMLInputElement).value; }}
                              @keydown=${(e: KeyboardEvent) => this._handleEditKeydown(e, row)}
                              @blur=${() => this._commitEdit(row)}
                              autofocus />
                          ` : this._renderCellContent(val, col, row)}
                        </td>
                      `;
                    })}
                    ${hasActions && !isTotals ? html`
                      <td class="zg-td zg-td-right zg-td-actions" style="position:sticky;right:0;z-index:1;background:var(--zg-bg, #fff);white-space:nowrap">
                        ${this.actionButtons.map(btn => html`
                          <button class="zg-btn-icon" style="${btn.color ? `color:${btn.color}` : ''}"
                                  title="${btn.label}"
                                  @click=${(e: Event) => { e.stopPropagation(); this._handleAction(btn.action, row); }}>
                            ${unsafeHTML(btn.icon)}
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
        </div>

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

  // ─── Rich Toolbar ─────────────────────────────────────────────

  private _renderToolbar(totalRows: number) {
    const filterCount = this._activeFilterCount;
    const selCount = this._selectedRows.size;
    return html`
      <div class="zg-toolbar">
        <div class="zg-toolbar-left">
          <span class="zg-row-count">${totalRows} ${this._t('filas', 'rows')}</span>
          ${selCount > 0 ? html`<span class="zg-selection-info">${selCount} ${this._t('seleccionadas', 'selected')}</span>` : nothing}

          <!-- Quick Search (global filter) -->
          ${this.enableQuickSearch ? html`
            <input type="text" class="zg-find-input" style="width:180px;margin-left:8px"
              placeholder="${this._t('Buscar en tabla...', 'Search table...')}"
              .value=${this._quickSearch}
              @input=${(e: InputEvent) => { this._quickSearch = (e.target as HTMLInputElement).value; this._page = 0; }} />
          ` : nothing}

          <!-- Filter Panel toggle -->
          ${this.filterPanel.length > 0 ? html`
            <button class="zg-btn-icon ${this._showFilterPanel ? 'zg-btn-icon--active' : ''}"
                    @click=${(e: Event) => { e.stopPropagation(); this._showFilterPanel = !this._showFilterPanel; }}
                    title="${this._t('Filtros', 'Filters')}">
              ${this._iconHtml('filter')}${filterCount > 0 ? html`<span class="zg-filter-active-count">${filterCount}</span>` : nothing}
            </button>
          ` : nothing}
        </div>

        <div class="zg-toolbar-right">
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
          <div class="zg-toolbar-dropdown" @click=${(e: Event) => e.stopPropagation()}>
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
          </div>

          <!-- Density picker -->
          <div class="zg-toolbar-dropdown" @click=${(e: Event) => e.stopPropagation()}>
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
          </div>

          <!-- Export buttons (inline) -->
          <button class="zg-btn-icon" @click=${this._exportCsv} title="CSV">${this._iconHtml('export')} <span style="font-size:11px;font-weight:600">CSV</span></button>
          <button class="zg-btn-icon" @click=${this._exportExcel} title="Excel">${this._iconHtml('export')} <span style="font-size:11px;font-weight:600;color:var(--zg-success,#0d9668)">Excel</span></button>
          <button class="zg-btn-icon" @click=${this._exportJson} title="JSON">${this._iconHtml('export')} <span style="font-size:11px;font-weight:600">JSON</span></button>

          <!-- Import button (available when enableImport or enableEditing) -->
          ${this.enableImport || this.enableEditing ? html`
            <button class="zg-btn-icon" @click=${this._handleImportClick}
                    title="${this._t('Importar Excel/CSV/JSON', 'Import Excel/CSV/JSON')}">${this._iconHtml('import')}</button>
            <input type="file" class="zg-import-file" accept=".csv,.json,.xlsx,.xls" @change=${this._handleFileImport}
                   style="display:none" />
          ` : nothing}

          <!-- Settings button (emits settings-click event) -->
          ${this.enableSettings ? html`
            <button class="zg-btn-icon" @click=${() => this._dispatchGridEvent('settings-click', {})}
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
