# @zentto/datagrid-react

React wrapper for **`<zentto-grid>`** web component. All 90+ features available as React props.

## Install

```bash
npm install @zentto/datagrid-react
```

## Quick Start

```tsx
"use client";
import { useEffect, useRef } from "react";
import "@zentto/datagrid"; // Register web component

export default function MyGrid() {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.columns = [
      { field: "name", header: "Name", sortable: true },
      { field: "price", header: "Price", type: "number", currency: "USD", aggregation: "sum" },
      { field: "status", header: "Status", statusColors: { Active: "success", Inactive: "error" } },
    ];
    el.rows = [
      { id: 1, name: "Widget", price: 29.99, status: "Active" },
      { id: 2, name: "Gadget", price: 49.99, status: "Inactive" },
    ];
  }, []);

  return (
    <zentto-grid
      ref={ref}
      show-totals
      enable-toolbar
      enable-header-filters
      enable-configurator
      height="500px"
    />
  );
}
```

## With React Wrapper Component

```tsx
import { ZenttoDataGrid } from "@zentto/datagrid-react";
import type { ColumnDef } from "@zentto/datagrid-react";

const columns: ColumnDef[] = [
  { field: "name", header: "Name", sortable: true },
  { field: "price", header: "Price", type: "number", currency: "USD" },
];

export default function App() {
  return (
    <ZenttoDataGrid
      columns={columns}
      rows={data}
      showTotals
      enableClipboard
      onRowClick={(e) => console.log(e.detail.row)}
      onSelectionChange={(e) => console.log(e.detail.selectedRows)}
    />
  );
}
```

## Events

| Event | Detail |
|-------|--------|
| `onRowClick` | `{ row, rowIndex }` |
| `onCellClick` | `{ row, field, value }` |
| `onSortChange` | `{ sorts }` |
| `onFilterChange` | `{ filters }` |
| `onPageChange` | `{ page, pageSize }` |
| `onSelectionChange` | `{ selectedRows, count }` |
| `onGroupChange` | `{ groupFields, activeField }` |
| `onImportComplete` | `{ rows, count }` |

## Theming

```tsx
<zentto-grid
  style={{
    "--zg-primary": "#6366f1",
    "--zg-header-bg": "#eef2ff",
    "--zg-font-family": "'Inter', sans-serif",
  } as React.CSSProperties}
/>
```

## Re-exported Types

```typescript
import type {
  ColumnDef,
  GridRow,
  GridOptions,
  PivotConfig,
  RowGroupingConfig,
  SortEntry,
  FilterRule,
} from "@zentto/datagrid-react";
```

## License

MIT - Free for commercial and personal use.

## Links

- [GitHub](https://github.com/zentto-erp/zentto-datagrid)
- [Custom Styles Guide](https://github.com/zentto-erp/zentto-datagrid/blob/main/docs/custom-styles.md)
