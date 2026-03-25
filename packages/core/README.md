# @zentto/datagrid-core

Pure logic engine for **ZenttoDataGrid** — sort, filter, group, pivot, aggregate, export. Zero UI dependencies.

## Install

```bash
npm install @zentto/datagrid-core
```

## Features

- **Sort** — multi-column stable sort
- **Filter** — 14+ operators (contains, equals, gt, lt, between, inList...)
- **Quick Search** — full-text search across all columns
- **Group** — row grouping with subtotals
- **Pivot** — dynamic pivot tables with aggregation
- **Aggregate** — sum, avg, count, min, max
- **Formula** — Excel-like formulas (=SUM, =AVG, =IF, =ROUND)
- **Export** — CSV, Excel, JSON, Markdown
- **Find** — search with match highlighting
- **Clipboard** — copy to clipboard
- **Persistence** — save/load layout via IndexedDB

## Usage

```typescript
import { sortRows, filterRows, groupRows, pivotRows } from '@zentto/datagrid-core';
import type { ColumnDef, GridRow, PivotConfig } from '@zentto/datagrid-core';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'total', header: 'Total', type: 'number', aggregation: 'sum' },
];

const rows: GridRow[] = [
  { id: 1, name: 'Item A', total: 100 },
  { id: 2, name: 'Item B', total: 250 },
];

// Sort
const sorted = sortRows(rows, [{ field: 'total', direction: 'desc' }]);

// Filter
const filtered = filterRows(rows, [{ field: 'name', operator: 'contains', value: 'Item' }]);

// Pivot
const pivot = pivotRows(rows, {
  rowField: 'category',
  columnField: 'status',
  valueField: 'total',
  aggregation: 'sum',
  showGrandTotals: true,
});
```

## License

MIT - Free for commercial and personal use.

## Links

- [GitHub](https://github.com/zentto-erp/zentto-datagrid)
- [Full Documentation](https://github.com/zentto-erp/zentto-datagrid#readme)
- [Custom Styles Guide](https://github.com/zentto-erp/zentto-datagrid/blob/main/docs/custom-styles.md)
