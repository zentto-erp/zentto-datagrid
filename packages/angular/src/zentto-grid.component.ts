import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import '@zentto/datagrid';
import type {
  ColumnDef,
  GridRow,
  PivotConfig,
  ColumnGroup,
  ContextMenuItem,
  FilterPanelField,
  CrudConfig,
  FormulaDefinition,
  GridTheme,
  GridLocale,
} from '@zentto/datagrid-core';

/**
 * Angular wrapper component for <zentto-grid>.
 *
 * Uses a thin wrapper that forwards all inputs as JS properties
 * to the underlying web component, and re-emits all CustomEvents
 * as Angular EventEmitters.
 */
@Component({
  selector: 'zentto-data-grid',
  standalone: true,
  template: `<zentto-grid #grid></zentto-grid>`,
  styles: [`:host { display: block; } zentto-grid { display: block; width: 100%; }`],
})
export class ZenttoDataGridComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('grid', { static: true }) gridRef!: ElementRef<HTMLElement>;

  // ─── Inputs ─────────────────────────────────────────
  @Input() columns: ColumnDef[] = [];
  @Input() rows: GridRow[] = [];
  @Input() theme: GridTheme = 'light';
  @Input() locale: GridLocale = 'es';
  @Input() showTotals = false;
  @Input() totalsLabel = 'Totales';
  @Input() enableClipboard = false;
  @Input() enableFind = false;
  @Input() enableQuickSearch = true;
  @Input() enableStatusBar = false;
  @Input() enableHeaderFilters = false;
  @Input() defaultCurrency = 'USD';
  @Input() exportFilename = 'export';
  @Input() gridId = '';
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() loading = false;
  @Input() density: 'compact' | 'standard' | 'comfortable' = 'standard';
  @Input() height: string | number = '500px';
  @Input() enableToolbar = true;
  @Input() showToolbarSearch = true;
  @Input() showToolbarColumns = true;
  @Input() showToolbarDensity = true;
  @Input() showToolbarExport = true;
  @Input() showToolbarFilter = true;
  @Input() enableGrouping = false;
  @Input() groupField = '';
  @Input() groupSubtotals = false;
  @Input() groupSort = '';
  @Input() enableGroupDropZone = false;
  @Input() enablePivot = false;
  @Input() pivotConfig?: PivotConfig;
  @Input() pinnedColumns: { left?: string[]; right?: string[] } = {};
  @Input() enableContextMenu = false;
  @Input() enableHeaderMenu = true;
  @Input() columnGroups: ColumnGroup[] = [];
  @Input() enableRowSelection = false;
  @Input() enableDragDrop = false;
  @Input() dragDropGroup = '';
  @Input() actionButtons: { icon: string; label: string; action: string; color?: string }[] = [];
  @Input() icons: Partial<Record<string, string>> = {};
  @Input() enableEditing = false;
  @Input() crudConfig?: CrudConfig;
  @Input() enableImport = false;
  @Input() enableConfigurator = false;
  @Input() formulas: FormulaDefinition[] = [];
  @Input() filterPanel: FilterPanelField[] = [];
  @Input() enableFilterPanel = false;
  @Input() enableMasterDetail = false;
  @Input() detailRenderer?: (row: GridRow) => string;
  @Input() detailColumns?: ColumnDef[];
  @Input() detailRowsAccessor?: (row: GridRow) => GridRow[];
  // New v0.2 features
  @Input() enableVirtualScroll = false;
  @Input() enableUndoRedo = false;
  @Input() enableRangeSelection = false;
  @Input() enablePaste = false;

  // ─── Outputs ────────────────────────────────────────
  @Output() rowClick = new EventEmitter<any>();
  @Output() cellClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() columnResize = new EventEmitter<any>();
  @Output() columnReorder = new EventEmitter<any>();
  @Output() rowExpand = new EventEmitter<any>();
  @Output() dragStart = new EventEmitter<any>();
  @Output() dragDrop = new EventEmitter<any>();
  @Output() groupChange = new EventEmitter<any>();
  @Output() importComplete = new EventEmitter<any>();
  @Output() importError = new EventEmitter<any>();
  @Output() cellEdit = new EventEmitter<any>();
  @Output() crudUpdate = new EventEmitter<any>();
  @Output() crudCreate = new EventEmitter<any>();
  @Output() crudDelete = new EventEmitter<any>();
  @Output() crudError = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<any>();
  @Output() headerMenuAction = new EventEmitter<any>();
  @Output() undoAction = new EventEmitter<any>();
  @Output() redoAction = new EventEmitter<any>();
  @Output() pasteAction = new EventEmitter<any>();
  @Output() rangeSelect = new EventEmitter<any>();

  private _listeners: Array<[string, EventListener]> = [];

  /** Event name → output emitter mapping */
  private get _eventMap(): Record<string, EventEmitter<any>> {
    return {
      'row-click': this.rowClick,
      'cell-click': this.cellClick,
      'sort-change': this.sortChange,
      'filter-change': this.filterChange,
      'page-change': this.pageChange,
      'selection-change': this.selectionChange,
      'column-resize': this.columnResize,
      'column-reorder': this.columnReorder,
      'row-expand': this.rowExpand,
      'drag-start': this.dragStart,
      'drag-drop': this.dragDrop,
      'group-change': this.groupChange,
      'import-complete': this.importComplete,
      'import-error': this.importError,
      'cell-edit': this.cellEdit,
      'crud-update': this.crudUpdate,
      'crud-create': this.crudCreate,
      'crud-delete': this.crudDelete,
      'crud-error': this.crudError,
      'action-click': this.actionClick,
      'header-menu-action': this.headerMenuAction,
      'undo': this.undoAction,
      'redo': this.redoAction,
      'paste': this.pasteAction,
      'range-select': this.rangeSelect,
    };
  }

  ngOnInit(): void {
    const el = this._gridElement;
    if (!el) return;

    // Attach event listeners
    const eventMap = this._eventMap;
    for (const [eventName, emitter] of Object.entries(eventMap)) {
      const handler = (e: Event) => emitter.emit((e as CustomEvent).detail);
      el.addEventListener(eventName, handler);
      this._listeners.push([eventName, handler]);
    }

    this._syncAllProps();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this._syncAllProps();
  }

  ngOnDestroy(): void {
    const el = this._gridElement;
    if (!el) return;
    for (const [name, handler] of this._listeners) {
      el.removeEventListener(name, handler);
    }
    this._listeners = [];
  }

  // ─── Public API ─────────────────────────────────────

  /** Get the underlying <zentto-grid> element */
  get gridElement(): HTMLElement | null {
    return this._gridElement;
  }

  /** Add a new row */
  addRow(defaults?: GridRow): void {
    (this._gridElement as any)?.addRow(defaults);
  }

  /** Delete selected rows */
  deleteSelected(): void {
    (this._gridElement as any)?.deleteSelected();
  }

  /** Get currently selected rows */
  get selectedRows(): GridRow[] {
    return (this._gridElement as any)?.selectedRows ?? [];
  }

  /** Undo last action */
  undo(): void {
    (this._gridElement as any)?.undo?.();
  }

  /** Redo last undone action */
  redo(): void {
    (this._gridElement as any)?.redo?.();
  }

  // ─── Private ────────────────────────────────────────

  private get _gridElement(): HTMLElement | null {
    return this.gridRef?.nativeElement?.querySelector('zentto-grid') ?? this.gridRef?.nativeElement ?? null;
  }

  private _syncAllProps(): void {
    const el = this._gridElement as any;
    if (!el) return;

    // Forward all inputs as JS properties
    const props: Record<string, any> = {
      columns: this.columns,
      rows: this.rows,
      theme: this.theme,
      locale: this.locale,
      showTotals: this.showTotals,
      totalsLabel: this.totalsLabel,
      enableClipboard: this.enableClipboard,
      enableFind: this.enableFind,
      enableQuickSearch: this.enableQuickSearch,
      enableStatusBar: this.enableStatusBar,
      enableHeaderFilters: this.enableHeaderFilters,
      defaultCurrency: this.defaultCurrency,
      exportFilename: this.exportFilename,
      gridId: this.gridId,
      pageSizeOptions: this.pageSizeOptions,
      loading: this.loading,
      density: this.density,
      height: this.height,
      enableToolbar: this.enableToolbar,
      showToolbarSearch: this.showToolbarSearch,
      showToolbarColumns: this.showToolbarColumns,
      showToolbarDensity: this.showToolbarDensity,
      showToolbarExport: this.showToolbarExport,
      showToolbarFilter: this.showToolbarFilter,
      enableGrouping: this.enableGrouping,
      groupField: this.groupField,
      groupSubtotals: this.groupSubtotals,
      groupSort: this.groupSort,
      enableGroupDropZone: this.enableGroupDropZone,
      enablePivot: this.enablePivot,
      pivotConfig: this.pivotConfig,
      pinnedColumns: this.pinnedColumns,
      enableContextMenu: this.enableContextMenu,
      enableHeaderMenu: this.enableHeaderMenu,
      columnGroups: this.columnGroups,
      enableRowSelection: this.enableRowSelection,
      enableDragDrop: this.enableDragDrop,
      dragDropGroup: this.dragDropGroup,
      actionButtons: this.actionButtons,
      icons: this.icons,
      enableEditing: this.enableEditing,
      crudConfig: this.crudConfig,
      enableImport: this.enableImport,
      enableConfigurator: this.enableConfigurator,
      formulas: this.formulas,
      filterPanel: this.filterPanel,
      enableFilterPanel: this.enableFilterPanel,
      enableMasterDetail: this.enableMasterDetail,
      detailRenderer: this.detailRenderer,
      detailColumns: this.detailColumns,
      detailRowsAccessor: this.detailRowsAccessor,
      enableVirtualScroll: this.enableVirtualScroll,
      enableUndoRedo: this.enableUndoRedo,
      enableRangeSelection: this.enableRangeSelection,
      enablePaste: this.enablePaste,
    };

    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        el[key] = value;
      }
    }
  }
}
