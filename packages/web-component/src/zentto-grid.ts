import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  sortRows,
  filterRows,
  paginateRows,
  computeTotals,
  groupRows,
  pivotRows,
  downloadCsv,
  downloadJson,
  downloadExcel,
  downloadMarkdown,
  copyToClipboard,
  copyCellValue,
  findInGrid,
} from '@zentto/datagrid-core';
import type {
  ColumnDef,
  ColumnGroup,
  GridRow,
  SortEntry,
  FilterRule,
  PaginationModel,
  GridOptions,
  PivotConfig,
  RowGroupingConfig,
  FindMatch,
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
 *   enable-clipboard
 * ></zentto-grid>
 * ```
 */
@customElement('zentto-grid')
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
  @property({ type: Boolean, attribute: 'enable-status-bar' }) enableStatusBar = false;
  @property({ type: Boolean, attribute: 'enable-header-filters' }) enableHeaderFilters = false;
  @property({ type: String, attribute: 'default-currency' }) defaultCurrency = 'USD';
  @property({ type: String, attribute: 'export-filename' }) exportFilename = 'export';
  @property({ type: Array, attribute: 'page-size-options' }) pageSizeOptions = [10, 25, 50, 100];
  @property({ type: Boolean }) loading = false;
  @property({ type: String }) density: 'compact' | 'standard' | 'comfortable' = 'standard';
  @property({ type: String }) height = '500px';

  // ─── Master-Detail ─────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-master-detail' }) enableMasterDetail = false;
  @property({ attribute: false }) detailRenderer?: (row: GridRow) => string;

  // ─── Row Grouping ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-grouping' }) enableGrouping = false;
  @property({ type: String, attribute: 'group-field' }) groupField = '';
  @property({ type: Boolean, attribute: 'group-subtotals' }) groupSubtotals = false;
  @property({ type: String, attribute: 'group-sort' }) groupSort: 'asc' | 'desc' | '' = '';

  // ─── Column Pinning ────────────────────────────────────────────
  @property({ attribute: false }) pinnedColumns: { left?: string[]; right?: string[] } = {};

  // ─── Context Menu ──────────────────────────────────────────────
  @property({ type: Boolean, attribute: 'enable-context-menu' }) enableContextMenu = false;

  // ─── Column Groups ─────────────────────────────────────────────
  @property({ attribute: false }) columnGroups: ColumnGroup[] = [];

  // ─── Internal state ───────────────────────────────────────────

  @state() private _sorts: SortEntry[] = [];
  @state() private _page = 0;
  @state() private _pageSize = 10;
  @state() private _headerFilters: Record<string, string> = {};
  @state() private _findOpen = false;
  @state() private _findQuery = '';
  @state() private _findMatches: FindMatch[] = [];
  @state() private _findIdx = 0;

  // Master-Detail state
  @state() private _expandedRows: Set<string> = new Set();

  // Row Grouping state
  @state() private _expandedGroups: Set<string> = new Set();

  // Context Menu state
  @state() private _contextMenu: { x: number; y: number; row: GridRow; field: string; value: unknown } | null = null;

  // Column Resize state
  @state() private _columnWidths: Record<string, number> = {};
  private _resizing: { field: string; startX: number; startWidth: number } | null = null;

  // ─── Computed data ────────────────────────────────────────────

  private get _filteredRows(): GridRow[] {
    let result = [...this.rows];

    // Apply header filters
    const filterRules: FilterRule[] = [];
    for (const [field, val] of Object.entries(this._headerFilters)) {
      if (!val) continue;
      const col = this.columns.find((c) => c.field === field);
      if (col?.type === 'number') {
        // Parse operator: >100, <50, =99, >=10
        const match = val.match(/^([><=!]+)?\s*(.+)$/);
        if (match) {
          const op = match[1] || '=';
          const num = match[2];
          const opMap: Record<string, string> = { '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte', '=': 'equals', '!=': 'notEquals' };
          filterRules.push({ field, operator: (opMap[op] || 'gte') as any, value: Number(num) });
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
      // Filter out rows belonging to collapsed groups
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

  private get _displayRows(): GridRow[] {
    let source: GridRow[];
    if (this.enableGrouping && this.groupField) {
      // When grouping, skip pagination (show all grouped rows)
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
    return entry.direction === 'asc' ? ' ↑' : ' ↓';
  }

  // ─── Pagination ───────────────────────────────────────────────

  private _handlePageSizeChange(e: Event) {
    this._pageSize = Number((e.target as HTMLSelectElement).value);
    this._page = 0;
  }

  private _prevPage() {
    if (this._page > 0) this._page--;
  }

  private _nextPage() {
    if (this._page < this._paginatedResult.totalPages - 1) this._page++;
  }

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

  private _exportCsv() {
    downloadCsv(this._sortedRows, this.columns, this.exportFilename);
  }

  private _exportJson() {
    downloadJson(this._sortedRows, this.columns, this.exportFilename);
  }

  // ─── Master-Detail ──────────────────────────────────────────────

  private _toggleRowExpand(row: GridRow) {
    const key = String(row['id'] ?? JSON.stringify(row));
    const next = new Set(this._expandedRows);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
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
    if (next.has(groupValue)) {
      next.delete(groupValue);
    } else {
      next.add(groupValue);
    }
    this._expandedGroups = next;
  }

  private _isGroupExpanded(groupValue: string): boolean {
    return this._expandedGroups.has(groupValue);
  }

  // ─── Context Menu ──────────────────────────────────────────────

  private _handleContextMenu(e: MouseEvent, row: GridRow, field: string, value: unknown) {
    if (!this.enableContextMenu) return;
    e.preventDefault();
    this._contextMenu = { x: e.offsetX, y: e.offsetY, row, field, value };
  }

  private _closeContextMenu() {
    this._contextMenu = null;
  }

  private async _contextCopyCell() {
    if (this._contextMenu) {
      await navigator.clipboard.writeText(String(this._contextMenu.value ?? ''));
    }
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

  private _contextExportCsv() {
    this._exportCsv();
    this._closeContextMenu();
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
      let leftOffset = 40; // account for row-num column
      for (const col of visibleCols) {
        if (col.field === field) break;
        if (leftPins.includes(col.field)) {
          leftOffset += this._columnWidths[col.field] || col.width || 120;
        }
      }
      return `position:sticky;left:${leftOffset}px;z-index:1;background:var(--zg-bg, #fff);`;
    }
    if (rightPins.includes(field)) {
      let rightOffset = 0;
      const reverseCols = [...visibleCols].reverse();
      for (const col of reverseCols) {
        if (col.field === field) break;
        if (rightPins.includes(col.field)) {
          rightOffset += this._columnWidths[col.field] || col.width || 120;
        }
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
        if (leftPins.includes(col.field)) {
          leftOffset += this._columnWidths[col.field] || col.width || 120;
        }
      }
      return `position:sticky;left:${leftOffset}px;z-index:3;`;
    }
    if (rightPins.includes(field)) {
      let rightOffset = 0;
      const reverseCols = [...visibleCols].reverse();
      for (const col of reverseCols) {
        if (col.field === field) break;
        if (rightPins.includes(col.field)) {
          rightOffset += this._columnWidths[col.field] || col.width || 120;
        }
      }
      return `position:sticky;right:${rightOffset}px;z-index:3;`;
    }
    return '';
  }

  private _isPinned(field: string): boolean {
    return (this.pinnedColumns?.left || []).includes(field) || (this.pinnedColumns?.right || []).includes(field);
  }

  // ─── Excel & Markdown Export ────────────────────────────────────

  private _exportExcel() {
    downloadExcel(this._sortedRows, this.columns, this.exportFilename);
  }

  private _exportMarkdown() {
    downloadMarkdown(this._sortedRows, this.columns, this.exportFilename);
  }

  // ─── Mobile responsive helpers ─────────────────────────────────

  private get _visibleColumns(): ColumnDef[] {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return this.columns.filter(c => {
      if (c.field.startsWith('__')) return false;
      if (isMobile && c.mobileHide) return false;
      return true;
    });
  }

  // ─── Format value ─────────────────────────────────────────────

  private _formatValue(val: unknown, col: ColumnDef): string {
    if (val == null) return '';

    if (col.currency) {
      const code = typeof col.currency === 'string' ? col.currency : this.defaultCurrency;
      try {
        return new Intl.NumberFormat(this.locale === 'es' ? 'es-VE' : 'en-US', {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 2,
        }).format(Number(val));
      } catch {
        return String(val);
      }
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
      } catch {
        return String(val);
      }
    }

    return String(val);
  }

  // ─── Render cell content ──────────────────────────────────────

  private _renderCellContent(val: unknown, col: ColumnDef, row: GridRow) {
    // Custom renderer
    if (col.renderCell) return html`<span .innerHTML=${col.renderCell(val, row)}></span>`;

    // Status chip
    if (col.statusColors && val != null) {
      const color = col.statusColors[String(val)] ?? 'default';
      const variant = col.statusVariant ?? 'filled';
      return html`<span class="zg-chip zg-chip--${color} zg-chip--${variant}">${val}</span>`;
    }

    // Progress bar
    if (col.progressMax != null) {
      const pct = Math.min(100, (Number(val) / col.progressMax) * 100);
      return html`
        <div class="zg-progress">
          <div class="zg-progress-bar" style="width:${pct}%"></div>
          <span class="zg-progress-text">${Math.round(pct)}%</span>
        </div>
      `;
    }

    // Rating
    if (col.ratingMax != null) {
      const stars = Number(val) || 0;
      const max = col.ratingMax;
      return html`<span class="zg-rating">${'★'.repeat(Math.min(stars, max))}${'☆'.repeat(Math.max(0, max - stars))}</span>`;
    }

    // Avatar
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

    // Flag (country code to emoji)
    if (col.flagField) {
      const code = String(row[col.flagField] || val || '');
      const flag = code.length === 2
        ? String.fromCodePoint(...([...code.toUpperCase()] as string[]).map(c => 0x1F1A5 + c.charCodeAt(0)))
        : '';
      return html`<span>${flag} ${this._formatValue(val, col)}</span>`;
    }

    // Image / Thumbnail
    if (col.imageField) {
      const src = String(row[col.imageField] || val || '');
      return html`<img class="zg-thumb" src="${src}" width="${col.imageWidth || 40}" height="${col.imageHeight || 40}" loading="lazy" />`;
    }

    // Link
    if (col.linkField) {
      const href = String(row[col.linkField] || val || '#');
      return html`<a class="zg-link" href="${href}" target="${col.linkTarget || '_blank'}" @click=${(e: Event) => e.stopPropagation()}>${this._formatValue(val, col)}</a>`;
    }

    // Default: formatted text
    return html`${this._formatValue(val, col)}`;
  }

  // ─── Keyboard handler ─────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
    document.addEventListener('click', this._handleDocClick);
    window.addEventListener('resize', this._handleResize);
    // Auto-expand all groups initially
    if (this.enableGrouping && this.groupField) {
      this._initGroups();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
    document.removeEventListener('click', this._handleDocClick);
    window.removeEventListener('resize', this._handleResize);
  }

  private _initGroups() {
    // All groups start expanded
    if (this.enableGrouping && this.groupField && this._expandedGroups.size === 0) {
      const groups = new Set<string>();
      for (const row of this.rows) {
        groups.add(String(row[this.groupField] ?? '(vacio)'));
      }
      this._expandedGroups = groups;
    }
  }

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('groupField') || changed.has('enableGrouping') || changed.has('rows')) {
      if (this.enableGrouping && this.groupField) {
        this._initGroups();
      }
    }
  }

  private _handleDocClick = () => {
    if (this._contextMenu) this._closeContextMenu();
  };

  private _handleResize = () => {
    this.requestUpdate();
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._contextMenu) {
      this._closeContextMenu();
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

  // ─── Density class ────────────────────────────────────────────

  private get _densityClass(): string {
    return `zg-density-${this.density}`;
  }

  private get _rowHeight(): number {
    return this.density === 'compact' ? 32 : this.density === 'comfortable' ? 52 : 40;
  }

  // ─── RENDER ───────────────────────────────────────────────────

  override render() {
    const { totalRows, totalPages } = this._paginatedResult;
    const visibleCols = this._visibleColumns;
    const displayRows = this._displayRows;
    const from = this._page * this._pageSize + 1;
    const to = Math.min(from + this._pageSize - 1, totalRows);
    const colSpanTotal = visibleCols.length + 1 + (this.enableMasterDetail ? 1 : 0);

    return html`
      <div class="zg-container ${this._densityClass} zg-theme-${this.theme}" style="height:${this.height}" tabindex="0">

        <!-- Toolbar -->
        <div class="zg-toolbar">
          <div class="zg-toolbar-left">
            <span class="zg-row-count">${totalRows} ${this.locale === 'es' ? 'filas' : 'rows'}</span>
          </div>
          <div class="zg-toolbar-right">
            ${this.enableClipboard ? html`<button class="zg-btn" @click=${this._copyAll} title="Copiar">📋</button>` : nothing}
            <button class="zg-btn" @click=${this._exportCsv} title="CSV">⬇ CSV</button>
            <button class="zg-btn" @click=${this._exportJson} title="JSON">{ } JSON</button>
            <button class="zg-btn" @click=${this._exportExcel} title="Excel">⬇ Excel</button>
            <button class="zg-btn" @click=${this._exportMarkdown} title="Markdown">📝 MD</button>
          </div>
        </div>

        <!-- Find bar -->
        ${this._findOpen ? html`
          <div class="zg-find-bar">
            <span>🔍</span>
            <input
              type="text"
              class="zg-find-input"
              placeholder="${this.locale === 'es' ? 'Buscar...' : 'Search...'}"
              .value=${this._findQuery}
              @input=${(e: InputEvent) => this._updateFind((e.target as HTMLInputElement).value)}
              @keydown=${this._handleFindKeydown}
              autofocus
            />
            <span class="zg-find-count">
              ${this._findMatches.length > 0
                ? `${this._findIdx + 1} ${this.locale === 'es' ? 'de' : 'of'} ${this._findMatches.length}`
                : this.locale === 'es' ? 'Sin resultados' : 'No results'}
            </span>
            <button class="zg-btn zg-btn-sm" @click=${() => { this._findOpen = false; this._findQuery = ''; this._findMatches = []; }}>✕</button>
          </div>
        ` : nothing}

        <!-- Loading overlay -->
        ${this.loading ? html`<div class="zg-loading"><div class="zg-spinner"></div></div>` : nothing}

        <!-- Table -->
        <div class="zg-table-wrapper">
          <table class="zg-table">
            <thead>
              <!-- Column Groups (multi-level headers) -->
              ${this.columnGroups.length > 0 ? html`
                <tr class="zg-column-group-row">
                  ${this.enableMasterDetail ? html`<th class="zg-th" style="width:32px"></th>` : nothing}
                  <th class="zg-th zg-th-row-num" style="width:40px"></th>
                  ${this._renderColumnGroupHeaders(visibleCols)}
                </tr>
              ` : nothing}
              <tr>
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
                    @click=${() => this._handleSort(col.field)}
                  >
                    <span>${col.header || col.field}${this._getSortIcon(col.field)}</span>
                    ${col.resizable !== false ? html`
                      <span class="zg-resize-handle" @mousedown=${(e: MouseEvent) => this._handleResizeStart(e, col.field)}></span>
                    ` : nothing}
                  </th>
                `})}
              </tr>
              ${this.enableHeaderFilters ? html`
                <tr class="zg-filter-row">
                  ${this.enableMasterDetail ? html`<td></td>` : nothing}
                  <td></td>
                  ${visibleCols.map((col) => html`
                    <td>
                      <input
                        type="${col.type === 'date' ? 'date' : 'text'}"
                        class="zg-filter-input"
                        placeholder="${col.header ?? col.field}..."
                        @input=${(e: InputEvent) => this._handleFilterChange(col.field, (e.target as HTMLInputElement).value)}
                      />
                    </td>
                  `)}
                </tr>
              ` : nothing}
            </thead>
            <tbody>
              ${displayRows.map((row, idx) => {
                const isTotals = row['__zentto_totals__'];
                const isGroupHeader = row['__zentto_group__'];
                const isSubtotal = row['__zentto_subtotal__'];
                const groupValue = String(row['__zentto_group_value__'] ?? '');

                // Group header row
                if (isGroupHeader) {
                  const expanded = this._isGroupExpanded(groupValue);
                  return html`
                    <tr class="zg-row zg-row-group-header" @click=${() => this._toggleGroup(groupValue)}>
                      <td class="zg-td zg-td-group-header" colspan="${colSpanTotal}">
                        <span class="zg-group-chevron ${expanded ? 'zg-group-chevron--expanded' : ''}">▶</span>
                        <strong>${row[String(row['__zentto_group_field__'])]}</strong>
                      </td>
                    </tr>
                  `;
                }

                // Subtotal row
                if (isSubtotal) {
                  return html`
                    <tr class="zg-row zg-row-subtotal">
                      ${this.enableMasterDetail ? html`<td class="zg-td"></td>` : nothing}
                      <td class="zg-td zg-td-row-num"></td>
                      ${visibleCols.map((col) => {
                        const val = row[col.field];
                        const pinStyle = this._getPinStyle(col.field, visibleCols);
                        return html`
                          <td class="zg-td zg-td-subtotal ${col.type === 'number' || col.currency ? 'zg-td-right' : ''}" style="${pinStyle}">
                            ${val != null ? this._formatValue(val, col) : ''}
                          </td>
                        `;
                      })}
                    </tr>
                  `;
                }

                // Normal row
                const expanded = this.enableMasterDetail && this._isRowExpanded(row);
                return html`
                  <tr
                    class="zg-row ${isTotals ? 'zg-row-totals' : idx % 2 ? 'zg-row-alt' : ''}"
                    @click=${() => this._dispatchGridEvent('row-click', { row, rowIndex: idx })}
                  >
                    ${this.enableMasterDetail ? html`
                      <td class="zg-td zg-td-expand" @click=${(e: Event) => { e.stopPropagation(); this._toggleRowExpand(row); }}>
                        <span class="zg-expand-chevron ${expanded ? 'zg-expand-chevron--expanded' : ''}">▶</span>
                      </td>
                    ` : nothing}
                    <td class="zg-td zg-td-row-num">${isTotals ? '' : this._page * this._pageSize + idx + 1}</td>
                    ${visibleCols.map((col) => {
                      const val = row[col.field];
                      const isMatch = this._findMatches.some((m) => m.rowIndex === idx && m.field === col.field);
                      const isCurrent = this._findMatches[this._findIdx]?.rowIndex === idx && this._findMatches[this._findIdx]?.field === col.field;
                      const pinStyle = this._getPinStyle(col.field, visibleCols);
                      const pinClass = this._isPinned(col.field) ? 'zg-td-pinned' : '';
                      return html`
                        <td
                          class="zg-td ${col.type === 'number' || col.currency ? 'zg-td-right' : ''} ${isTotals ? 'zg-td-totals' : ''} ${isMatch ? 'zg-find-match' : ''} ${isCurrent ? 'zg-find-current' : ''} ${pinClass}"
                          style="${pinStyle}"
                          @contextmenu=${(e: MouseEvent) => this._handleContextMenu(e, row, col.field, val)}
                        >
                          ${this._renderCellContent(val, col, row)}
                        </td>
                      `;
                    })}
                  </tr>
                  ${expanded && this.detailRenderer ? html`
                    <tr class="zg-row-detail">
                      <td class="zg-td-detail" colspan="${colSpanTotal}">
                        <div class="zg-detail-panel" .innerHTML=${this.detailRenderer(row)}></div>
                      </td>
                    </tr>
                  ` : nothing}
                `;
              })}
            </tbody>
          </table>
        </div>

        <!-- Context Menu -->
        ${this._contextMenu ? html`
          <div class="zg-context-menu" style="left:${this._contextMenu.x}px;top:${this._contextMenu.y}px" @click=${(e: Event) => e.stopPropagation()}>
            <div class="zg-context-item" @click=${this._contextCopyCell}>📋 ${this.locale === 'es' ? 'Copiar celda' : 'Copy cell'}</div>
            <div class="zg-context-item" @click=${this._contextCopyRow}>📄 ${this.locale === 'es' ? 'Copiar fila' : 'Copy row'}</div>
            <div class="zg-context-divider"></div>
            <div class="zg-context-item" @click=${this._contextExportCsv}>⬇ ${this.locale === 'es' ? 'Exportar CSV' : 'Export CSV'}</div>
          </div>
        ` : nothing}

        <!-- Footer -->
        <div class="zg-footer">
          <div class="zg-footer-left">
            ${this.enableStatusBar ? html`
              <span class="zg-status-count"><strong>${totalRows}</strong> ${this.locale === 'es' ? 'filas' : 'rows'}</span>
              ${this.columns.filter((c) => c.aggregation === 'sum').map((c) => {
                const sum = this._sortedRows.reduce((a, r) => a + (Number(r[c.field]) || 0), 0);
                return html`<span class="zg-status-agg"><strong>${c.header || c.field}:</strong> ${this._formatValue(sum, c)}</span>`;
              })}
            ` : nothing}
          </div>
          <div class="zg-footer-right">
            <span>${this.locale === 'es' ? 'Filas por pagina:' : 'Rows per page:'}</span>
            <select class="zg-page-size" @change=${this._handlePageSizeChange}>
              ${this.pageSizeOptions.map((n) => html`<option value=${n} ?selected=${n === this._pageSize}>${n}</option>`)}
            </select>
            <span class="zg-page-info">${from}–${to} ${this.locale === 'es' ? 'de' : 'of'} ${totalRows}</span>
            <button class="zg-btn zg-btn-sm" @click=${this._prevPage} ?disabled=${this._page === 0}>‹</button>
            <button class="zg-btn zg-btn-sm" @click=${this._nextPage} ?disabled=${this._page >= totalPages - 1}>›</button>
          </div>
        </div>
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
        // Count how many consecutive visible cols belong to this group
        let span = 0;
        for (let j = i; j < visibleCols.length; j++) {
          if (group.children.includes(visibleCols[j].field)) {
            span++;
          } else {
            break;
          }
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

declare global {
  interface HTMLElementTagNameMap {
    'zentto-grid': ZenttoGrid;
  }
}
