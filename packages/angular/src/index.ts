/**
 * @zentto/datagrid-angular — Angular wrapper for <zentto-grid> web component.
 *
 * @example
 * ```typescript
 * // In your module or standalone component:
 * import { ZenttoDataGridComponent, ZENTTO_GRID_SCHEMA } from '@zentto/datagrid-angular';
 *
 * @Component({
 *   standalone: true,
 *   imports: [ZenttoDataGridComponent],
 *   schemas: [ZENTTO_GRID_SCHEMA],
 *   template: `
 *     <zentto-data-grid
 *       [columns]="columns"
 *       [rows]="rows"
 *       [showTotals]="true"
 *       (rowClick)="onRowClick($event)">
 *     </zentto-data-grid>
 *   `
 * })
 * export class MyComponent { ... }
 * ```
 */

// Re-export the Angular component and module
export { ZenttoDataGridComponent } from './zentto-grid.component';
export { ZenttoDataGridModule, ZENTTO_GRID_SCHEMA } from './zentto-grid.module';

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
  FilterPanelField,
  CrudConfig,
  FormulaDefinition,
} from '@zentto/datagrid-core';
