/**
 * @zentto/datagrid-vue — Vue 3 wrapper for <zentto-grid> web component.
 *
 * @example
 * ```vue
 * <template>
 *   <ZenttoDataGrid
 *     :columns="columns"
 *     :rows="rows"
 *     show-totals
 *     enable-clipboard
 *     @row-click="onRowClick"
 *     @sort-change="onSort"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ZenttoDataGrid } from '@zentto/datagrid-vue';
 * import type { ColumnDef, GridRow } from '@zentto/datagrid-vue';
 * </script>
 * ```
 */

import {
  defineComponent,
  h,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  type PropType,
} from 'vue';
import '@zentto/datagrid';
import type {
  ColumnDef,
  GridRow,
  SortEntry,
  FilterRule,
  PivotConfig,
  ColumnGroup,
  ContextMenuItem,
  FilterPanelField,
  CrudConfig,
  FormulaDefinition,
  GridTheme,
  GridLocale,
  AggregationType,
} from '@zentto/datagrid-core';

// Re-export core types for convenience
export type {
  ColumnDef,
  GridRow,
  SortEntry,
  FilterRule,
  PivotConfig,
  ColumnGroup,
  ContextMenuItem,
  FilterPanelField,
  CrudConfig,
  FormulaDefinition,
  GridTheme,
  GridLocale,
  AggregationType,
};

/** All events emitted by <zentto-grid> as CustomEvents */
const GRID_EVENTS = [
  'row-click',
  'cell-click',
  'sort-change',
  'filter-change',
  'page-change',
  'selection-change',
  'column-resize',
  'column-reorder',
  'row-expand',
  'drag-start',
  'drag-drop',
  'group-change',
  'import-complete',
  'import-error',
  'cell-edit',
  'crud-update',
  'crud-create',
  'crud-delete',
  'crud-error',
  'action-click',
  'header-menu-action',
  'column-visibility-change',
  'filter-panel-change',
  'undo',
  'redo',
  'paste',
  'range-select',
] as const;

type GridEventName = (typeof GRID_EVENTS)[number];

/**
 * Vue 3 component wrapping <zentto-grid> web component.
 *
 * All props are forwarded as properties (not attributes) to the underlying
 * custom element, so complex objects (columns, rows, etc.) work correctly.
 */
export const ZenttoDataGrid = defineComponent({
  name: 'ZenttoDataGrid',

  props: {
    columns: { type: Array as PropType<ColumnDef[]>, required: true },
    rows: { type: Array as PropType<GridRow[]>, required: true },
    theme: { type: String as PropType<GridTheme>, default: 'light' },
    locale: { type: String as PropType<GridLocale>, default: 'es' },
    showTotals: { type: Boolean, default: false },
    totalsLabel: { type: String, default: 'Totales' },
    enableClipboard: { type: Boolean, default: false },
    enableFind: { type: Boolean, default: false },
    enableQuickSearch: { type: Boolean, default: true },
    enableStatusBar: { type: Boolean, default: false },
    enableHeaderFilters: { type: Boolean, default: false },
    defaultCurrency: { type: String, default: 'USD' },
    exportFilename: { type: String, default: 'export' },
    gridId: { type: String, default: '' },
    pageSizeOptions: { type: Array as PropType<number[]>, default: () => [10, 25, 50, 100] },
    loading: { type: Boolean, default: false },
    density: { type: String as PropType<'compact' | 'standard' | 'comfortable'>, default: 'standard' },
    height: { type: [String, Number], default: '500px' },
    enableToolbar: { type: Boolean, default: true },
    showToolbarSearch: { type: Boolean, default: true },
    showToolbarColumns: { type: Boolean, default: true },
    showToolbarDensity: { type: Boolean, default: true },
    showToolbarExport: { type: Boolean, default: true },
    showToolbarFilter: { type: Boolean, default: true },
    enableGrouping: { type: Boolean, default: false },
    groupField: { type: String, default: '' },
    groupSubtotals: { type: Boolean, default: false },
    groupSort: { type: String, default: '' },
    enableGroupDropZone: { type: Boolean, default: false },
    enablePivot: { type: Boolean, default: false },
    pivotConfig: { type: Object as PropType<PivotConfig>, default: undefined },
    pinnedColumns: { type: Object as PropType<{ left?: string[]; right?: string[] }>, default: () => ({}) },
    enableContextMenu: { type: Boolean, default: false },
    enableHeaderMenu: { type: Boolean, default: true },
    columnGroups: { type: Array as PropType<ColumnGroup[]>, default: () => [] },
    enableRowSelection: { type: Boolean, default: false },
    enableDragDrop: { type: Boolean, default: false },
    dragDropGroup: { type: String, default: '' },
    actionButtons: { type: Array as PropType<{ icon: string; label: string; action: string; color?: string }[]>, default: () => [] },
    icons: { type: Object as PropType<Partial<Record<string, string>>>, default: () => ({}) },
    enableEditing: { type: Boolean, default: false },
    crudConfig: { type: Object as PropType<CrudConfig>, default: undefined },
    enableImport: { type: Boolean, default: false },
    enableConfigurator: { type: Boolean, default: false },
    formulas: { type: Array as PropType<FormulaDefinition[]>, default: () => [] },
    filterPanel: { type: Array as PropType<FilterPanelField[]>, default: () => [] },
    enableFilterPanel: { type: Boolean, default: false },
    enableMasterDetail: { type: Boolean, default: false },
    detailRenderer: { type: Function as PropType<(row: GridRow) => string>, default: undefined },
    detailColumns: { type: Array as PropType<ColumnDef[]>, default: undefined },
    detailRowsAccessor: { type: Function as PropType<(row: GridRow) => GridRow[]>, default: undefined },
    // New v0.2 features
    enableVirtualScroll: { type: Boolean, default: false },
    enableUndoRedo: { type: Boolean, default: false },
    enableRangeSelection: { type: Boolean, default: false },
    enablePaste: { type: Boolean, default: false },
  },

  emits: [...GRID_EVENTS],

  setup(props, { emit, expose }) {
    const gridRef = ref<HTMLElement | null>(null);
    const listeners = new Map<string, EventListener>();

    // Sync all props to the web component as JS properties
    const syncProps = () => {
      const el = gridRef.value as any;
      if (!el) return;

      // Set every prop as a JS property (not attribute) for complex types
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) {
          el[key] = value;
        }
      }
    };

    onMounted(() => {
      const el = gridRef.value;
      if (!el) return;

      // Listen to all grid events and re-emit as Vue events
      for (const eventName of GRID_EVENTS) {
        const handler = (e: Event) => {
          emit(eventName as any, (e as CustomEvent).detail);
        };
        el.addEventListener(eventName, handler);
        listeners.set(eventName, handler);
      }

      syncProps();
    });

    onBeforeUnmount(() => {
      const el = gridRef.value;
      if (!el) return;
      for (const [eventName, handler] of listeners) {
        el.removeEventListener(eventName, handler);
      }
      listeners.clear();
    });

    // Watch all props for changes
    watch(() => props, syncProps, { deep: true });

    // Expose imperative methods
    expose({
      /** Get the underlying <zentto-grid> element */
      getGridElement: () => gridRef.value,
      /** Add a new row */
      addRow: (defaults?: GridRow) => (gridRef.value as any)?.addRow(defaults),
      /** Delete selected rows */
      deleteSelected: () => (gridRef.value as any)?.deleteSelected(),
      /** Get selected rows */
      getSelectedRows: () => (gridRef.value as any)?.selectedRows ?? [],
      /** Undo last action */
      undo: () => (gridRef.value as any)?.undo?.(),
      /** Redo last undone action */
      redo: () => (gridRef.value as any)?.redo?.(),
    });

    return () => h('zentto-grid', { ref: gridRef });
  },
});

export default ZenttoDataGrid;
