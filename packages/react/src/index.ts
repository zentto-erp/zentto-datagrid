import { createComponent } from '@lit/react';
import { ZenttoGrid } from '@zentto/datagrid';
import React from 'react';

/**
 * React wrapper for <zentto-grid> web component.
 *
 * @example
 * ```tsx
 * import { ZenttoDataGrid } from '@zentto/datagrid-react';
 *
 * <ZenttoDataGrid
 *   columns={[{ field: 'name', header: 'Nombre' }]}
 *   rows={[{ name: 'Widget' }]}
 *   showTotals
 *   enableClipboard
 * />
 * ```
 */
export const ZenttoDataGrid = createComponent({
  tagName: 'zentto-grid',
  elementClass: ZenttoGrid,
  react: React,
  events: {
    onRowClick: 'row-click',
    onCellClick: 'cell-click',
    onSortChange: 'sort-change',
    onFilterChange: 'filter-change',
    onPageChange: 'page-change',
    onSelectionChange: 'selection-change',
  } as any,
});

// Re-export core types for convenience
export type {
  ColumnDef,
  GridRow,
  GridOptions,
  PivotConfig,
  RowGroupingConfig,
  ColumnGroup,
  ContextMenuItem,
  SortEntry,
  FilterRule,
  AggregationType,
  GridTheme,
  GridLocale,
} from '@zentto/datagrid-core';
