import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ZenttoDataGridComponent } from './zentto-grid.component';

/**
 * Schema that allows Angular to recognize <zentto-grid> custom element.
 * Use in standalone components: `schemas: [ZENTTO_GRID_SCHEMA]`
 */
export const ZENTTO_GRID_SCHEMA = CUSTOM_ELEMENTS_SCHEMA;

/**
 * NgModule for non-standalone usage.
 *
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [ZenttoDataGridModule],
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  imports: [ZenttoDataGridComponent],
  exports: [ZenttoDataGridComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ZenttoDataGridModule {}
