# @zentto/datagrid-angular

Angular 17+ wrapper for the [ZenttoDataGrid](https://github.com/zentto-erp/zentto-datagrid) web component.

## Install

```bash
npm install @zentto/datagrid-angular @zentto/datagrid @zentto/datagrid-core
```

## Usage (Standalone)

```typescript
import { Component } from '@angular/core';
import { ZenttoDataGridComponent, ZENTTO_GRID_SCHEMA } from '@zentto/datagrid-angular';
import type { ColumnDef, GridRow } from '@zentto/datagrid-angular';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ZenttoDataGridComponent],
  schemas: [ZENTTO_GRID_SCHEMA],
  template: `
    <zentto-data-grid
      [columns]="columns"
      [rows]="rows"
      [showTotals]="true"
      [enableClipboard]="true"
      (rowClick)="onRowClick($event)">
    </zentto-data-grid>
  `
})
export class ProductsComponent {
  columns: ColumnDef[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'price', header: 'Price', type: 'number', currency: 'USD' },
  ];

  rows: GridRow[] = [
    { id: 1, name: 'Widget', price: 9.99 },
    { id: 2, name: 'Gadget', price: 24.99 },
  ];

  onRowClick(detail: any) {
    console.log('Row clicked:', detail.row);
  }
}
```

## Usage (NgModule)

```typescript
import { ZenttoDataGridModule } from '@zentto/datagrid-angular';

@NgModule({
  imports: [ZenttoDataGridModule],
})
export class AppModule { }
```

## Inputs & Outputs

All props from `<zentto-grid>` are available as `@Input()`. Events are emitted as `@Output()` EventEmitters.

See the [main README](https://github.com/zentto-erp/zentto-datagrid) for the full API reference.

## License

MIT
