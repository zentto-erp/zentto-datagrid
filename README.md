[🇪🇸 Leer en Español](README.es.md)

<p align="center">
  <img src="https://zentto.net/favicon.svg" width="64" alt="Zentto Logo" />
</p>

<h1 align="center">ZenttoDataGrid</h1>

<p align="center">
  <strong>The free, open-source data grid with enterprise features.</strong><br />
  100+ features. Zero framework lock-in. React, Vue, Angular, or vanilla HTML.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/@zentto/datagrid"><img src="https://img.shields.io/npm/v/@zentto/datagrid.svg?color=orange" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/@zentto/datagrid"><img src="https://img.shields.io/bundlephobia/minzip/@zentto/datagrid?label=gzip" alt="bundle size" /></a>
  <img src="https://img.shields.io/badge/dependencies-1%20(lit)-green" alt="dependencies" />
  <img src="https://img.shields.io/badge/web%20component-%E2%9C%93-brightgreen" alt="web component" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> |
  <a href="#features">Features</a> |
  <a href="#usage-examples">Examples</a> |
  <a href="#column-definition-api">Column API</a> |
  <a href="#grid-properties-api">Grid API</a> |
  <a href="#events">Events</a> |
  <a href="docs/custom-styles.md">Custom Styles Guide</a>
</p>

---

## Why ZenttoDataGrid?

Most enterprise data grids charge hundreds or thousands of dollars per developer per year for features like pivot tables, row grouping, and multi-column sorting. ZenttoDataGrid ships **all of them for free**, as a standards-based web component that works in any framework.

| Feature | ZenttoDataGrid | MUI X Premium | AG Grid Enterprise |
|---|:---:|:---:|:---:|
| **Price** | **FREE (MIT)** | $180/dev/yr | $999/dev/yr |
| Multi-column sorting | Yes | Yes | Yes |
| Header filters | Yes | Yes | Yes |
| Row grouping + subtotals | Yes | Yes | Yes |
| Pivot tables | Yes | Yes | Yes |
| Column pinning | Yes | Yes | Yes |
| Master-detail | Yes | Yes | Yes |
| Clipboard (copy/paste) | Yes | Yes | Yes |
| Context menu | Yes | Yes | Yes |
| Find & highlight (Ctrl+F) | Yes | No | Yes |
| Export (CSV, Excel, JSON, Markdown) | Yes | Partial | Yes |
| Column resize + reorder | Yes | Yes | Yes |
| Status chips, avatars, ratings | Yes | No | No |
| Built-in theming (light/dark/custom) | Yes | Yes | Yes |
| i18n (en, es, pt) | Yes | Yes | Yes |
| Layout persistence | Yes | Yes | Yes |
| Virtual scroll (100K+ rows) | Yes | Yes | Yes |
| Sparklines (mini charts in cells) | Yes | No | Yes |
| Undo/Redo (Ctrl+Z/Y) | Yes | No | Yes |
| Excel-like range selection | Yes | No | Yes |
| Paste from Excel (Ctrl+V) | Yes | No | Yes |
| ARIA + keyboard accessibility | Yes | Yes | Yes |
| Web component (framework-agnostic) | Yes | No | No |
| React wrapper | Yes | Native | Yes |
| Vue wrapper | Yes | No | No |
| Angular wrapper | Yes | No | Yes |
| Zero external dependencies (core) | Yes | No | No |
| Bundle size (gzipped) | ~18 KB | ~200 KB | ~300 KB |

---

## Features

### Data Processing
- Multi-column sorting (ascending, descending, clear)
- Client-side filtering with 14 operators (`contains`, `equals`, `gt`, `between`, `inList`, etc.)
- Header filters with smart operator parsing for numeric columns (`>100`, `<=50`)
- Full-text search (Ctrl+F) with match highlighting and navigation
- Client-side pagination with configurable page sizes
- Server-side pagination mode

### Grouping & Aggregation
- Row grouping with collapsible groups
- Group subtotals (sum, avg, count, min, max)
- Group sort (ascending/descending)
- Pivot tables (row field, column field, value field, grand totals)
- Footer totals row with per-column aggregation
- Custom totals label

### Column Features
- Column pinning (left/right sticky columns)
- Column resizing (drag handles)
- Column reordering
- Column groups (multi-level headers)
- Responsive column hiding (`mobileHide`, `tabletHide`)
- Flex sizing and min-width constraints

### Rich Cell Templates
- **Status chips** -- color-coded badges with filled/outlined variants
- **Avatar cells** -- image + name + subtitle, circular/rounded/square
- **Progress bars** -- percentage visualization with configurable max
- **Star ratings** -- filled/empty stars with configurable max
- **Country flags** -- emoji flags from ISO 3166-1 alpha-2 codes
- **Links** -- clickable URLs with target control
- **Images/Thumbnails** -- inline images with configurable dimensions
- **Currency formatting** -- ISO 4217 with locale-aware display
- **Custom renderers** -- `renderCell(value, row)` returns HTML string

### Selection & Clipboard
- Row selection (click to select)
- **Excel-like range selection** (click+drag, Shift+Arrow) `NEW v0.2`
- Copy all data to clipboard
- **Copy selected range** (Ctrl+C on range) `NEW v0.2`
- **Paste from Excel / Google Sheets** (Ctrl+V) `NEW v0.2`
- Copy individual cell value (context menu)
- Copy entire row (context menu)

### Master-Detail
- Expandable rows with custom detail renderer
- Expand/collapse toggle per row
- `row-expand` event for lazy loading

### Context Menu
- Built-in right-click menu (Copy Cell, Copy Row, Export CSV)
- Extensible with custom `contextMenuItems`

### Export
- CSV download
- Excel download (HTML table format)
- JSON download
- Markdown download
- Configurable filename

### Appearance & Theming
- Three built-in themes: `light`, `dark`, `zentto`
- 20+ CSS custom properties for full customization
- Three density modes: `compact`, `standard`, `comfortable`
- Loading state with skeleton/spinner
- Configurable height

### Internationalization
- Built-in locales: `es` (Spanish), `en` (English), `pt` (Portuguese)
- Locale-aware number and date formatting

### Layout Persistence
- Save/restore column widths, sort order, and filters
- `gridId` for multi-grid pages
- LocalStorage-based persistence

### Rich Toolbar (NEW)
- Integrated column chooser (show/hide columns)
- Density picker (compact/standard/comfortable)
- Export dropdown (CSV, Excel, JSON, Markdown)
- Filter panel toggle with active count badge
- Clipboard and Find buttons
- Selection count indicator

### Declarative Filter Panel (NEW)
- Define filters from React/Vue/Angular as props
- Auto-generates select options from data
- Types: `select`, `multi-select`, `range`, `text`, `date-range`
- Active filter count badge + "Clear all" button

### Header Column Menu (NEW)
- Three-dot menu on each column header (toggleable via `enable-header-menu`)
- Sort ascending/descending
- Filter (activates header filter for that column)
- Hide column
- Manage columns (opens column chooser panel)

### Cell Context Menu (Enhanced)
- Copy cell value
- Copy row
- Pin column left/right
- Unpin column
- Filter by this value
- Export visible data

### Row Selection (NEW)
- Checkbox multi-select with "Select All" in header
- Shift+Click for range selection
- Selection count in toolbar
- `selection-change` event with selected rows
- `selectedRows` public getter

### Drag & Drop (NEW)
- Drag handle per row
- Drag selected rows between grids
- `drag-drop-group` for multi-grid scenarios
- `drag-start` and `drag-drop` events

### Action Buttons Column (NEW)
- Configurable buttons via `actionButtons` prop
- Icons, labels, colors per button
- Fixed/sticky to the right edge
- `action-click` event with action name and row

### Inline Editing & CRUD (NEW)
- Double-click to edit any cell
- Enter to commit, Escape to cancel, Tab to next cell
- `crudConfig` with API endpoint for automatic CRUD
- Auto-rollback on API error
- `addRow()` and `deleteSelected()` public methods
- Create/Update/Delete against REST API
- Import from CSV/JSON files

### Formula Engine (NEW)
- Excel-like formulas: `=SUM({field})`, `=AVG({field})`, `=MIN/MAX/COUNT`
- Per-row arithmetic: `={price} * {quantity}`
- `=ROUND({total}/1.16, 2)`
- `=IF({stock} > 100, "High", "Low")`
- Formulas defined declaratively as props

### Virtual Scroll `NEW v0.2`
- Renders only visible rows for 100K+ datasets without lag
- Configurable overscan (extra rows above/below viewport)
- Enable with `enable-virtual-scroll` attribute

### Sparklines `NEW v0.2`
- Mini charts rendered as SVG inside grid cells
- Three types: `line`, `bar`, `area`
- Configurable color, auto-detects trend (up/down/flat)
- Defined per column: `{ sparkline: 'line', sparklineField: 'history' }`

### Undo/Redo `NEW v0.2`
- Full edit history with Ctrl+Z (undo) and Ctrl+Y/Ctrl+Shift+Z (redo)
- Tracks cell edits, row additions, deletions, and paste operations
- Undo/redo buttons in toolbar with `enable-undo-redo`
- Configurable stack size (default 200)

### Range Selection `NEW v0.2`
- Excel-like click+drag to select a range of cells
- Shift+Arrow keys to extend selection
- Ctrl+C copies the selected range as tab-separated text
- `range-select` event with coordinates
- Enable with `enable-range-selection`

### Paste from Excel `NEW v0.2`
- Ctrl+V pastes tab-separated data from Excel, Google Sheets, or any spreadsheet
- Auto-converts number and boolean types based on column definitions
- Integrates with undo/redo (paste can be undone)
- Enable with `enable-paste`

### Accessibility `NEW v0.2`
- ARIA roles: `grid`, `row`, `gridcell`, `columnheader`, `rowgroup`
- `aria-sort` on sortable columns (ascending/descending/none)
- `aria-selected` on active cells and selected rows
- `aria-rowindex` and `aria-colindex` for screen reader navigation
- Full keyboard navigation (Arrow keys, Tab, Enter, F2, Escape)
- Focus-visible outlines on all interactive elements
- Screen-reader-only text for status information

---

## Quick Start

### Vanilla JS / CDN

```html
<script type="module">
  import 'https://unpkg.com/@zentto/datagrid@latest/dist/zentto-grid.js';
</script>

<zentto-grid
  columns='[{"field":"name","header":"Name","sortable":true},{"field":"price","header":"Price","type":"number","currency":"USD","aggregation":"sum"}]'
  rows='[{"name":"Widget","price":9.99},{"name":"Gadget","price":24.50}]'
  show-totals
  enable-clipboard
></zentto-grid>
```

### npm (Vanilla / Lit / Svelte / etc.)

```bash
npm install @zentto/datagrid
```

```js
import '@zentto/datagrid';
```

### React

```bash
npm install @zentto/datagrid-react
```

```tsx
import { ZenttoDataGrid } from '@zentto/datagrid-react';
import type { ColumnDef } from '@zentto/datagrid-react';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'price', header: 'Price', type: 'number', currency: 'USD', aggregation: 'sum' },
];

const rows = [
  { name: 'Widget', price: 9.99 },
  { name: 'Gadget', price: 24.50 },
];

export default function App() {
  return (
    <ZenttoDataGrid
      columns={columns}
      rows={rows}
      showTotals
      enableClipboard
      onRowClick={(e) => console.log('Clicked:', e.detail.row)}
    />
  );
}
```

### Vue 3

```bash
npm install @zentto/datagrid-vue
```

```vue
<template>
  <ZenttoDataGrid :columns="columns" :rows="rows" show-totals @row-click="onRowClick" />
</template>

<script setup lang="ts">
import { ZenttoDataGrid } from '@zentto/datagrid-vue';
import type { ColumnDef } from '@zentto/datagrid-vue';

const columns: ColumnDef[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'price', header: 'Price', type: 'number', currency: 'USD' },
];
const rows = [{ name: 'Widget', price: 9.99 }];
const onRowClick = (detail: any) => console.log(detail.row);
</script>
```

### Angular 17+

```bash
npm install @zentto/datagrid-angular
```

```typescript
import { ZenttoDataGridComponent, ZENTTO_GRID_SCHEMA } from '@zentto/datagrid-angular';

@Component({
  standalone: true,
  imports: [ZenttoDataGridComponent],
  schemas: [ZENTTO_GRID_SCHEMA],
  template: `
    <zentto-data-grid
      [columns]="columns"
      [rows]="rows"
      [showTotals]="true"
      (rowClick)="onRowClick($event)">
    </zentto-data-grid>
  `
})
export class MyComponent { ... }
```

> `<zentto-grid>` is a standard web component -- it also works natively in Svelte, Solid, or vanilla HTML without any wrapper.

---

## Usage Examples

### Basic Table

```html
<zentto-grid
  columns='[
    {"field":"id","header":"#","width":60,"sortable":true},
    {"field":"name","header":"Customer","sortable":true},
    {"field":"email","header":"Email"},
    {"field":"total","header":"Total","type":"number","currency":"USD"}
  ]'
  rows='[
    {"id":1,"name":"Acme Corp","email":"hello@acme.com","total":1250.00},
    {"id":2,"name":"Globex Inc","email":"info@globex.com","total":3400.75}
  ]'
></zentto-grid>
```

### With Header Filters + Totals + Clipboard

```html
<zentto-grid
  columns='[
    {"field":"product","header":"Product","sortable":true,"filterable":true},
    {"field":"qty","header":"Qty","type":"number","aggregation":"sum"},
    {"field":"price","header":"Price","type":"number","currency":"USD","aggregation":"sum"}
  ]'
  .rows=${data}
  enable-header-filters
  show-totals
  totals-label="Grand Total"
  enable-clipboard
  enable-find
  enable-status-bar
></zentto-grid>
```

> Header filters support smart operators for numeric columns: type `>100`, `<=50`, `!=0` directly in the filter input.

### Master-Detail (Expandable Rows)

```html
<zentto-grid
  .columns=${columns}
  .rows=${orders}
  enable-master-detail
  .detailRenderer=${(row) => `
    <div style="padding: 16px;">
      <h4>Order #${row.id} Details</h4>
      <p>Ship to: ${row.address}</p>
      <p>Items: ${row.itemCount}</p>
    </div>
  `}
></zentto-grid>
```

```tsx
// React
<ZenttoDataGrid
  columns={columns}
  rows={orders}
  enableMasterDetail
  detailRenderer={(row) => `
    <div style="padding: 16px;">
      <h4>Order #${row.id} Details</h4>
      <ul>${row.items.map(i => `<li>${i.name} x${i.qty}</li>`).join('')}</ul>
    </div>
  `}
/>
```

### Pivot Table

```html
<zentto-grid
  .columns=${[
    { field: 'region', header: 'Region' },
    { field: 'product', header: 'Product' },
    { field: 'sales', header: 'Sales', type: 'number' }
  ]}
  .rows=${salesData}
  enable-pivot
  .pivotConfig=${{
    rowField: 'region',
    columnField: 'product',
    valueField: 'sales',
    aggregation: 'sum',
    showGrandTotals: true,
    showRowTotals: true
  }}
></zentto-grid>
```

The pivot engine dynamically creates columns from distinct values in `columnField` and aggregates the `valueField` using the specified function.

### Row Grouping with Subtotals

```html
<zentto-grid
  .columns=${[
    { field: 'department', header: 'Department', groupable: true },
    { field: 'employee', header: 'Employee', sortable: true },
    { field: 'salary', header: 'Salary', type: 'number', currency: 'USD', aggregation: 'sum' }
  ]}
  .rows=${employees}
  enable-grouping
  group-field="department"
  group-subtotals
  group-sort="asc"
></zentto-grid>
```

Groups are collapsible. Subtotals use the `aggregation` defined on each column.

### Column Templates

**Status Chips:**

```js
{
  field: 'status',
  header: 'Status',
  statusColors: {
    'Active': 'success',
    'Pending': 'warning',
    'Inactive': 'error',
    'Draft': 'default'
  },
  statusVariant: 'filled' // or 'outlined'
}
```

**Avatar with Subtitle:**

```js
{
  field: 'name',
  header: 'Employee',
  avatarField: 'photoUrl',    // row[photoUrl] = image URL
  subtitleField: 'role',      // row[role] = subtitle text
  avatarVariant: 'circular'   // 'circular' | 'rounded' | 'square'
}
```

**Country Flag:**

```js
{
  field: 'country',
  header: 'Country',
  flagField: 'countryCode'    // row[countryCode] = 'US', 'ES', 'CO', etc.
}
```

**Progress Bar:**

```js
{
  field: 'progress',
  header: 'Completion',
  progressMax: 100,
  progressColor: '#4caf50'
}
```

**Star Rating:**

```js
{
  field: 'rating',
  header: 'Rating',
  ratingMax: 5
}
```

**Link:**

```js
{
  field: 'website',
  header: 'Website',
  linkField: 'url',           // row[url] = 'https://...'
  linkTarget: '_blank'
}
```

**Custom Renderer:**

```js
{
  field: 'tags',
  header: 'Tags',
  renderCell: (value, row) => {
    const tags = Array.isArray(value) ? value : [value];
    return tags.map(t => `<span class="tag">${t}</span>`).join(' ');
  }
}
```

### Context Menu + Find (Ctrl+F)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-context-menu
  enable-find
  enable-clipboard
></zentto-grid>
```

Right-click any cell to access: **Copy Cell**, **Copy Row**, **Pin Column**, **Filter by Value**, **Export Visible**.

Press `Ctrl+F` to open the in-grid search bar. Navigate matches with `Enter`. Press `Escape` to close.

### Rich Toolbar with Column Chooser

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-toolbar
  enable-header-menu
  enable-find
  enable-clipboard
  enable-status-bar
  locale="es"
></zentto-grid>
```

The toolbar includes: row count, filter toggle, clipboard, find, column chooser, density picker, and export dropdown -- all integrated inside the grid.

### Declarative Filter Panel (auto-generated from data)

```tsx
// React — filters are declared as props, options auto-generated
const gridRef = useRef(null);

useEffect(() => {
  const el = gridRef.current;
  el.filterPanel = [
    { field: 'categoria', type: 'select', label: 'Category' },
    { field: 'marca', type: 'select', label: 'Brand' },
    { field: 'precio', type: 'range', label: 'Price' },
    { field: 'fecha', type: 'date-range', label: 'Date' },
    { field: 'nombre', type: 'text', label: 'Search', placeholder: 'Product name...' },
  ];
  el.enableFilterPanel = true;
}, []);

<zentto-grid ref={gridRef} />
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" enable-filter-panel></zentto-grid>
<script>
  document.getElementById('grid').filterPanel = [
    { field: 'status', type: 'select', label: 'Status' },
    { field: 'amount', type: 'range', label: 'Amount' },
  ];
</script>
```

### Header Column Menu (three dots)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-header-menu
></zentto-grid>
```

Hover over any column header to see the three-dot menu. Options: Sort Asc/Desc, Filter, Hide Column, Manage Columns. Disable with `enable-header-menu="false"`.

### Row Selection with Checkbox

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-row-selection
></zentto-grid>
```

```js
// Access selected rows
const grid = document.querySelector('zentto-grid');
grid.addEventListener('selection-change', (e) => {
  console.log('Selected:', e.detail.selectedRows);
  console.log('Count:', e.detail.count);
});

// Or read directly
const selected = grid.selectedRows;
```

Supports Shift+Click for range selection.

### Action Buttons (pinned right)

```tsx
// React
useEffect(() => {
  gridRef.current.actionButtons = [
    { icon: '👁', label: 'View', action: 'view' },
    { icon: '✏️', label: 'Edit', action: 'edit', color: '#f59e0b' },
    { icon: '🗑️', label: 'Delete', action: 'delete', color: '#dc2626' },
  ];
}, []);

// Listen for actions
gridRef.current.addEventListener('action-click', (e) => {
  const { action, row } = e.detail;
  if (action === 'view') openModal(row);
  if (action === 'edit') navigate(`/edit/${row.id}`);
  if (action === 'delete') confirmDelete(row.id);
});
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid"></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.actionButtons = [
    { icon: '👁', label: 'Ver', action: 'view' },
    { icon: '✏️', label: 'Editar', action: 'edit', color: '#f59e0b' },
    { icon: '🗑️', label: 'Eliminar', action: 'delete', color: '#dc2626' },
  ];
  grid.addEventListener('action-click', (e) => {
    alert(`Action: ${e.detail.action} on row ${e.detail.row.id}`);
  });
</script>
```

### Drag & Drop Between Grids

```html
<!-- Source grid -->
<zentto-grid id="available"
  .columns=${columns}
  .rows=${availableItems}
  enable-row-selection
  enable-drag-drop
  drag-drop-group="items"
></zentto-grid>

<!-- Target grid -->
<zentto-grid id="selected"
  .columns=${columns}
  .rows=${selectedItems}
  enable-row-selection
  enable-drag-drop
  drag-drop-group="items"
></zentto-grid>

<script>
  document.getElementById('selected').addEventListener('drag-drop', (e) => {
    const { rows, sourceGroup, targetGroup } = e.detail;
    console.log(`Dropped ${rows.length} rows from ${sourceGroup} to ${targetGroup}`);
    // Move rows from source to target
  });
</script>
```

### Inline Editing with CRUD API

```tsx
// React — Full CRUD against REST API
useEffect(() => {
  const el = gridRef.current;
  el.enableEditing = true;
  el.enableRowSelection = true;  // needed for delete
  el.crudConfig = {
    baseUrl: '/api/v1/productos',
    idField: 'id',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': '1',
    },
    editableFields: ['nombre', 'precio', 'stock', 'categoria'],
    methods: {
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE',
    },
  };

  // Listen for CRUD events
  el.addEventListener('crud-update', (e) => {
    toast.success(`Updated ${e.detail.field}`);
  });
  el.addEventListener('crud-error', (e) => {
    toast.error(`Error: ${e.detail.error.message}`);
  });
}, []);

// Add new row programmatically
<button onClick={() => gridRef.current.addRow({ categoria: 'Default' })}>
  + Add Product
</button>

// Delete selected rows
<button onClick={() => gridRef.current.deleteSelected()}>
  Delete Selected
</button>
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" enable-editing enable-row-selection></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.crudConfig = {
    baseUrl: 'https://api.example.com/items',
    idField: 'id',
    headers: { 'Authorization': 'Bearer token123' },
  };

  // Double-click any cell to edit
  // Press Enter to save, Escape to cancel
  // Changes auto-sync to API

  // Public methods
  grid.addRow({ name: 'New Item', price: 0 });
  grid.deleteSelected();
</script>
```

### Import from CSV/JSON

```html
<zentto-grid id="grid"
  enable-editing
  .crudConfig=${{ baseUrl: '/api/v1/items', idField: 'id' }}
></zentto-grid>
```

When editing is enabled, the CRUD bar shows an "Import" button. Click to upload a `.csv` or `.json` file. The grid:
1. Parses the file
2. Adds rows to the local data
3. If `crudConfig` is set, POSTs each row to the API

### Formula Engine (Excel-like)

```tsx
// React
useEffect(() => {
  gridRef.current.formulas = [
    // Per-row: calculate subtotal
    { field: 'subtotal', formula: '={price} * {quantity}' },
    // Per-row: tax
    { field: 'tax', formula: '=ROUND({subtotal} * 0.16, 2)' },
    // Per-row: total
    { field: 'total', formula: '={subtotal} + {tax}' },
    // Conditional
    { field: 'level', formula: '=IF({stock} > 100, "High", "Low")' },
  ];
}, []);
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid"></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.formulas = [
    { field: 'margin', formula: '={sellPrice} - {costPrice}' },
    { field: 'marginPct', formula: '=ROUND({margin} / {sellPrice} * 100, 1)' },
    { field: 'status', formula: '=IF({stock} > 0, "Available", "Out of stock")' },
  ];
</script>
```

**Supported functions:**
- `SUM({field})` -- sum across all rows
- `AVG({field})` -- average across all rows
- `MIN({field})`, `MAX({field})`, `COUNT({field})`
- `ROUND(expr, decimals)`
- `IF(condition, trueValue, falseValue)`
- Arithmetic: `+`, `-`, `*`, `/` with `{field}` references

### Vue Example

```html
<template>
  <zentto-grid
    ref="grid"
    locale="es"
    enable-toolbar
    enable-header-menu
    enable-row-selection
    enable-context-menu
    height="600px"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@zentto/datagrid';

const grid = ref(null);

onMounted(() => {
  grid.value.columns = [
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'price', header: 'Precio', type: 'number', currency: 'USD' },
  ];
  grid.value.rows = [{ name: 'Widget', price: 9.99 }];
  grid.value.actionButtons = [
    { icon: '👁', label: 'Ver', action: 'view' },
  ];
  grid.value.addEventListener('action-click', (e) => {
    console.log(e.detail);
  });
});
</script>
```

### Angular Example

```typescript
// app.component.ts
import '@zentto/datagrid';

@Component({
  template: `
    <zentto-grid #grid
      locale="en"
      enable-toolbar
      enable-row-selection
      height="500px"
    ></zentto-grid>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('grid') grid!: ElementRef;

  ngAfterViewInit() {
    const el = this.grid.nativeElement;
    el.columns = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'price', header: 'Price', type: 'number', currency: 'USD' },
    ];
    el.rows = this.data;
    el.actionButtons = [
      { icon: '✏️', label: 'Edit', action: 'edit' },
    ];
    el.addEventListener('action-click', (e: any) => {
      this.onAction(e.detail);
    });
  }
}
```

### .NET Blazor Example

```razor
@* Blazor WebAssembly / Server *@
<zentto-grid @ref="grid" locale="es" enable-toolbar enable-editing height="600px" />

@code {
    private ElementReference grid;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await JS.InvokeVoidAsync("setupGrid", grid);
        }
    }
}

@* wwwroot/js/grid-setup.js *@
<script>
  window.setupGrid = (el) => {
    el.columns = [
      { field: 'name', header: 'Nombre', sortable: true },
      { field: 'price', header: 'Precio', type: 'number', currency: 'VES' },
    ];
    el.rows = [...];
    el.crudConfig = { baseUrl: '/api/items', idField: 'id' };
  };
</script>
```

### Column Pinning

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  .pinnedColumns=${{ left: ['id', 'name'], right: ['actions'] }}
></zentto-grid>
```

Pinned columns stay fixed while the rest of the grid scrolls horizontally.

### Theming with CSS Custom Properties

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  theme="dark"
></zentto-grid>
```

Override any variable for full customization:

```css
zentto-grid {
  --zg-font-family: 'IBM Plex Sans', sans-serif;
  --zg-font-size: 0.8rem;
  --zg-primary: #6366f1;
  --zg-bg: #fafafa;
  --zg-text-color: #1a1a1a;
  --zg-border-color: #e5e7eb;
  --zg-header-bg: #f1f5f9;
  --zg-row-bg: #ffffff;
  --zg-row-alt-bg: #f8fafc;
  --zg-row-hover-bg: #e0f2fe;
  --zg-footer-bg: #f1f5f9;
  --zg-input-bg: #ffffff;
  --zg-input-border: #d1d5db;
}
```

**Built-in themes:** `light` (default), `dark`, `zentto` (amber accent).

---

## Column Definition API

Every column is described by a `ColumnDef` object:

| Property | Type | Default | Description |
|---|---|---|---|
| `field` | `string` | **(required)** | Key in the row data object |
| `header` | `string` | field name | Display header text |
| `width` | `number` | `120` | Column width in pixels |
| `flex` | `number` | -- | Flex grow factor |
| `minWidth` | `number` | -- | Minimum width in pixels |
| `type` | `'string' \| 'number' \| 'date' \| 'datetime' \| 'boolean'` | `'string'` | Data type (affects formatting and filter operators) |
| `sortable` | `boolean` | `false` | Allow sorting by this column |
| `filterable` | `boolean` | `false` | Allow filtering by this column |
| `resizable` | `boolean` | `false` | Allow resizing this column |
| `reorderable` | `boolean` | `false` | Allow reordering this column |
| `pin` | `'left' \| 'right'` | -- | Pin column to left or right edge |
| `mobileHide` | `boolean` | `false` | Hide on screens < 768px |
| `tabletHide` | `boolean` | `false` | Hide on screens < 1024px |
| `aggregation` | `'sum' \| 'avg' \| 'count' \| 'min' \| 'max'` | -- | Aggregation for totals/subtotals row |
| `currency` | `string \| true` | -- | ISO 4217 currency code (e.g. `'USD'`), or `true` to use grid default |
| `groupable` | `boolean` | `false` | Allow grouping by this column |
| `columnGroupId` | `string` | -- | ID of parent column group |
| `renderCell` | `(value, row) => string` | -- | Custom cell renderer (returns HTML string) |
| `renderHeader` | `() => string` | -- | Custom header renderer |

### Template Properties

| Property | Type | Description |
|---|---|---|
| `statusColors` | `Record<string, string>` | Color map for status chips: `{ 'Active': 'success', 'Inactive': 'error' }` |
| `statusVariant` | `'filled' \| 'outlined'` | Status chip style variant |
| `avatarField` | `string` | Row field containing avatar image URL |
| `subtitleField` | `string` | Row field for subtitle text below the main value |
| `avatarVariant` | `'circular' \| 'rounded' \| 'square'` | Avatar shape |
| `progressMax` | `number` | Maximum value for progress bar (enables progress template) |
| `progressColor` | `string` | CSS color for progress bar fill |
| `ratingMax` | `number` | Maximum stars for rating display (enables rating template) |
| `flagField` | `string` | Row field containing ISO 3166-1 alpha-2 country code |
| `linkField` | `string` | Row field containing URL for link template |
| `linkTarget` | `'_blank' \| '_self'` | Link target attribute |
| `imageField` | `string` | Row field containing image URL for thumbnail |
| `imageWidth` | `number` | Thumbnail width in pixels |
| `imageHeight` | `number` | Thumbnail height in pixels |

---

## Grid Properties API

All properties can be set as HTML attributes (kebab-case) or JavaScript properties (camelCase).

| Attribute | Property | Type | Default | Description |
|---|---|---|---|---|
| `columns` | `columns` | `ColumnDef[]` | `[]` | Column definitions |
| `rows` | `rows` | `GridRow[]` | `[]` | Row data |
| `theme` | `theme` | `'light' \| 'dark' \| 'zentto'` | `'light'` | Color theme |
| `locale` | `locale` | `'es' \| 'en' \| 'pt'` | `'es'` | Display locale |
| `density` | `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Row density |
| `height` | `height` | `string` | `'500px'` | Grid container height |
| `loading` | `loading` | `boolean` | `false` | Show loading state |
| `show-totals` | `showTotals` | `boolean` | `false` | Show aggregation totals row |
| `totals-label` | `totalsLabel` | `string` | `'Totales'` | Label for totals row |
| `default-currency` | `defaultCurrency` | `string` | `'USD'` | Default ISO 4217 currency |
| `enable-clipboard` | `enableClipboard` | `boolean` | `false` | Enable copy-all button |
| `enable-find` | `enableFind` | `boolean` | `false` | Enable Ctrl+F search |
| `enable-header-filters` | `enableHeaderFilters` | `boolean` | `false` | Show filter inputs below headers |
| `enable-status-bar` | `enableStatusBar` | `boolean` | `false` | Show status bar with row count |
| `enable-context-menu` | `enableContextMenu` | `boolean` | `false` | Enable right-click context menu |
| `enable-master-detail` | `enableMasterDetail` | `boolean` | `false` | Enable expandable detail rows |
| -- | `detailRenderer` | `(row) => string` | -- | HTML renderer for detail panel |
| `enable-grouping` | `enableGrouping` | `boolean` | `false` | Enable row grouping |
| `group-field` | `groupField` | `string` | `''` | Field to group rows by |
| `group-subtotals` | `groupSubtotals` | `boolean` | `false` | Show subtotals per group |
| `group-sort` | `groupSort` | `'asc' \| 'desc' \| ''` | `''` | Sort direction for groups |
| -- | `pinnedColumns` | `{ left?: string[]; right?: string[] }` | `{}` | Pinned column configuration |
| -- | `columnGroups` | `ColumnGroup[]` | `[]` | Multi-level header groups |
| `enable-toolbar` | `enableToolbar` | `boolean` | `true` | Show rich toolbar |
| `enable-header-menu` | `enableHeaderMenu` | `boolean` | `true` | Show three-dot menu on column headers |
| `enable-filter-panel` | `enableFilterPanel` | `boolean` | `false` | Show filter panel below toolbar |
| -- | `filterPanel` | `FilterPanelField[]` | `[]` | Declarative filter definitions |
| `enable-row-selection` | `enableRowSelection` | `boolean` | `false` | Enable checkbox multi-select |
| `enable-drag-drop` | `enableDragDrop` | `boolean` | `false` | Enable row drag & drop |
| `drag-drop-group` | `dragDropGroup` | `string` | `''` | Group name for cross-grid drag |
| -- | `actionButtons` | `ActionButtonDef[]` | `[]` | Action buttons column (pinned right) |
| `enable-editing` | `enableEditing` | `boolean` | `false` | Enable inline cell editing |
| -- | `crudConfig` | `CrudConfig` | -- | API config for auto CRUD |
| -- | `formulas` | `FormulaDefinition[]` | `[]` | Excel-like formula definitions |
| `export-filename` | `exportFilename` | `string` | `'export'` | Base filename for exports |
| `page-size-options` | `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Page size dropdown options |

---

## Events

All events are dispatched as `CustomEvent` with typed `detail`. Listen using `addEventListener` or the React wrapper's event props.

| Event Name | React Prop | Detail | Description |
|---|---|---|---|
| `row-click` | `onRowClick` | `{ row: GridRow, rowIndex: number }` | A row was clicked |
| `cell-click` | `onCellClick` | `{ row: GridRow, field: string, value: unknown }` | A cell was clicked |
| `sort-change` | `onSortChange` | `{ sorts: SortEntry[] }` | Sort model changed |
| `filter-change` | `onFilterChange` | `{ filters: FilterRule[] }` | Filter model changed |
| `page-change` | `onPageChange` | `{ page: number, pageSize: number }` | Page or page size changed |
| `selection-change` | `onSelectionChange` | `{ selectedRows: GridRow[] }` | Row selection changed |
| `column-resize` | -- | `{ field: string, width: number }` | A column was resized |
| `column-reorder` | -- | `{ fields: string[] }` | Columns were reordered |
| `row-expand` | -- | `{ row: GridRow, expanded: boolean }` | A detail row was expanded/collapsed |
| `action-click` | -- | `{ action: string, row: GridRow }` | An action button was clicked |
| `header-menu-action` | -- | `{ field: string, action: string }` | Header menu action performed |
| `column-visibility-change` | -- | `{ hiddenColumns: string[] }` | Column visibility changed |
| `filter-panel-change` | -- | `{ field, value, allFilters }` | Filter panel value changed |
| `drag-start` | -- | `{ rows: GridRow[], group: string }` | Row drag started |
| `drag-drop` | -- | `{ rows, sourceGroup, targetGroup }` | Rows dropped on grid |
| `cell-edit` | -- | `{ row, field, oldValue, newValue }` | Cell edited (no CRUD) |
| `crud-update` | -- | `{ row, field, oldValue, newValue }` | CRUD update succeeded |
| `crud-create` | -- | `{ row, success: boolean }` | CRUD create succeeded |
| `crud-delete` | -- | `{ rows, count }` | CRUD delete succeeded |
| `crud-error` | -- | `{ action, row, error }` | CRUD operation failed |
| `import-complete` | -- | `{ rows, count }` | File import completed |
| `import-error` | -- | `{ error \| message }` | File import failed |

```js
// Vanilla JS
document.querySelector('zentto-grid').addEventListener('row-click', (e) => {
  console.log('Clicked row:', e.detail.row);
});

// React
<ZenttoDataGrid onRowClick={(e) => console.log(e.detail.row)} />
```

---

## Packages

This is a monorepo managed with [Turborepo](https://turbo.build/):

| Package | npm | Description |
|---|---|---|
| [`@zentto/datagrid-core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-core.svg)](https://www.npmjs.com/package/@zentto/datagrid-core) | Pure logic engine -- sort, filter, group, pivot, virtual scroll, undo/redo, sparklines. **Zero UI dependencies.** |
| [`@zentto/datagrid`](./packages/web-component) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid.svg)](https://www.npmjs.com/package/@zentto/datagrid) | `<zentto-grid>` web component built with [Lit](https://lit.dev/). Drop-in for any HTML page. |
| [`@zentto/datagrid-react`](./packages/react) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-react.svg)](https://www.npmjs.com/package/@zentto/datagrid-react) | React wrapper via `@lit/react`. Provides `<ZenttoDataGrid>` with typed props and event handlers. |
| [`@zentto/datagrid-vue`](./packages/vue) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-vue.svg)](https://www.npmjs.com/package/@zentto/datagrid-vue) | Vue 3 wrapper with reactive props, events, and exposed methods. |
| [`@zentto/datagrid-angular`](./packages/angular) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-angular.svg)](https://www.npmjs.com/package/@zentto/datagrid-angular) | Angular 17+ wrapper -- standalone component + NgModule. |

### Architecture

```
@zentto/datagrid-core          Pure functions (sort, filter, group, pivot, virtual scroll, undo/redo, sparklines)
        |
@zentto/datagrid               Web component (<zentto-grid>) — Lit + Shadow DOM
        |
   ┌────┼────┬────────┐
   |    |    |        |
 react  vue  angular  vanilla / svelte / blazor
```

The core package has **zero dependencies** and can be used standalone for headless data processing, testing, or server-side rendering.

---

## Development

### Prerequisites

- Node.js >= 20
- npm >= 10

### Setup

```bash
git clone https://github.com/zentto-erp/zentto-datagrid.git
cd zentto-datagrid
npm install
```

### Build

```bash
npm run build          # Build all packages (via Turborepo)
```

### Dev Mode

```bash
npm run dev            # Watch mode for all packages
```

### Test

```bash
npm run test           # Run all tests (Vitest)
```

### Clean

```bash
npm run clean          # Remove all dist/ folders
```

### Project Structure

```
zentto-datagrid/
  packages/
    core/              # @zentto/datagrid-core — pure logic, zero deps
      src/
        types.ts       # All public types (ColumnDef, GridOptions, etc.)
        data/          # sort, filter, aggregate, group, pivot, paginate
        export/        # csv, json, excel, markdown
        search/        # find-in-grid
        selection/     # clipboard utilities
        layout/        # persistence (save/load to localStorage)
    web-component/     # @zentto/datagrid — <zentto-grid> Lit element
      src/
        zentto-grid.ts # Main web component
        styles/        # CSS-in-JS styles with CSS custom properties
    react/             # @zentto/datagrid-react — React wrapper
      src/
        index.ts       # createComponent + re-exported types
```

---

## Roadmap

### v0.1 (completed)
- [x] Cell editing -- inline edit with validation and commit/cancel
- [x] Column menu -- dropdown per column (hide, pin, group by)
- [x] Drag-and-drop rows -- reorder rows by dragging
- [x] Formula engine -- Excel-like formulas
- [x] CRUD integration -- auto REST API
- [x] File import -- CSV/JSON/Excel
- [x] Row selection -- checkbox multi-select
- [x] Action buttons column

### v0.2 (completed)
- [x] Row virtualization -- 100K+ rows without lag
- [x] Sparkline columns -- inline charts (line, bar, area)
- [x] Undo/Redo -- history stack with Ctrl+Z/Y
- [x] Cell range selection -- select range like Excel
- [x] Clipboard paste -- paste from Excel/Google Sheets
- [x] Vue wrapper -- `@zentto/datagrid-vue`
- [x] Angular wrapper -- `@zentto/datagrid-angular`
- [x] Accessibility -- ARIA roles, keyboard navigation, screen reader support

### Next
- [ ] Server-side virtual scroll with infinite scrolling
- [ ] Tree data -- hierarchical rows with expand/collapse
- [ ] Export to PDF
- [ ] Custom theme builder (JSON themes)
- [ ] Column auto-size (double-click resize handle)
- [ ] Frozen rows (pinned top/bottom)
- [ ] Print mode -- optimized print stylesheet

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. **Fork** the repository and create a feature branch.
2. **Install** dependencies: `npm install`
3. **Build** all packages: `npm run build`
4. **Test** your changes: `npm run test`
5. **Submit** a pull request with a clear description of the change.

### Guidelines

- Keep the core package dependency-free.
- All new features should include tests in the `core` package.
- Web component changes should be backward-compatible.
- Follow the existing code style (TypeScript strict mode, Lit conventions).

---

## License

[MIT](./LICENSE) -- free for personal and commercial use.

Built with care by the [Zentto](https://zentto.net) team.
