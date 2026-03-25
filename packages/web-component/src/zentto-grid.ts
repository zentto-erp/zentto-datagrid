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
  copyToClipboard,
  findInGrid,
} from '@zentto/datagrid-core';
import type {
  ColumnDef,
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

  // ─── Internal state ───────────────────────────────────────────

  @state() private _sorts: SortEntry[] = [];
  @state() private _page = 0;
  @state() private _pageSize = 10;
  @state() private _headerFilters: Record<string, string> = {};
  @state() private _findOpen = false;
  @state() private _findQuery = '';
  @state() private _findMatches: FindMatch[] = [];
  @state() private _findIdx = 0;

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

  private get _displayRows(): GridRow[] {
    const rows = this._paginatedResult.rows;
    if (this.showTotals) {
      const totals = computeTotals(this._sortedRows, this.columns, this.totalsLabel);
      return [...rows, totals];
    }
    return rows;
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

    // Default: formatted text
    return html`${this._formatValue(val, col)}`;
  }

  // ─── Keyboard handler ─────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
  }

  private _handleKeydown = (e: KeyboardEvent) => {
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
    const visibleCols = this.columns.filter((c) => !c.field.startsWith('__'));
    const displayRows = this._displayRows;
    const from = this._page * this._pageSize + 1;
    const to = Math.min(from + this._pageSize - 1, totalRows);

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
              <tr>
                <th class="zg-th zg-th-row-num" style="width:40px">#</th>
                ${visibleCols.map((col) => html`
                  <th
                    class="zg-th ${col.sortable ? 'zg-th-sortable' : ''} ${col.type === 'number' || col.currency ? 'zg-th-right' : ''}"
                    style="${col.width ? `width:${col.width}px` : col.flex ? `flex:${col.flex}` : ''}"
                    @click=${() => this._handleSort(col.field)}
                  >
                    <span>${col.header || col.field}${this._getSortIcon(col.field)}</span>
                  </th>
                `)}
              </tr>
              ${this.enableHeaderFilters ? html`
                <tr class="zg-filter-row">
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
                return html`
                  <tr
                    class="zg-row ${isTotals ? 'zg-row-totals' : idx % 2 ? 'zg-row-alt' : ''}"
                    @click=${() => this._dispatchGridEvent('row-click', { row, rowIndex: idx })}
                  >
                    <td class="zg-td zg-td-row-num">${isTotals ? '' : this._page * this._pageSize + idx + 1}</td>
                    ${visibleCols.map((col) => {
                      const val = row[col.field];
                      const isMatch = this._findMatches.some((m) => m.rowIndex === idx && m.field === col.field);
                      const isCurrent = this._findMatches[this._findIdx]?.rowIndex === idx && this._findMatches[this._findIdx]?.field === col.field;
                      return html`
                        <td class="zg-td ${col.type === 'number' || col.currency ? 'zg-td-right' : ''} ${isTotals ? 'zg-td-totals' : ''} ${isMatch ? 'zg-find-match' : ''} ${isCurrent ? 'zg-find-current' : ''}">
                          ${this._renderCellContent(val, col, row)}
                        </td>
                      `;
                    })}
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>

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
}

declare global {
  interface HTMLElementTagNameMap {
    'zentto-grid': ZenttoGrid;
  }
}
