# @zentto/datagrid

**The free, open-source data grid with enterprise features.**
90+ features. Zero framework lock-in. One web component.

## Install

```bash
npm install @zentto/datagrid @zentto/datagrid-core
```

## Quick Start

```html
<zentto-grid
  show-totals
  enable-toolbar
  enable-header-filters
  enable-clipboard
  enable-configurator
  height="500px"
></zentto-grid>

<script type="module">
  import '@zentto/datagrid';

  const grid = document.querySelector('zentto-grid');
  grid.columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'price', header: 'Price', type: 'number', currency: 'USD', aggregation: 'sum' },
    { field: 'status', header: 'Status', statusColors: { Active: 'success', Inactive: 'error' } },
  ];
  grid.rows = [
    { id: 1, name: 'Widget', price: 29.99, status: 'Active' },
    { id: 2, name: 'Gadget', price: 49.99, status: 'Inactive' },
  ];
</script>
```

## Features

| Category | Features |
|----------|----------|
| **Data** | Multi-sort, 14+ filter operators, quick search, pagination (client/server) |
| **Grouping** | Row grouping with subtotals, drag-to-group drop zone |
| **Pivot** | Dynamic pivot tables with configurable rows, columns, values, aggregation |
| **Columns** | Pinning (left/right), resize, reorder, hide/show, column groups |
| **Templates** | Status chips, avatars, progress bars, ratings, flags, links, images |
| **Selection** | Checkbox multi-select, Shift+Click ranges, Excel-like cell navigation |
| **Editing** | Inline editing, Excel-like keyboard (Enter, Tab, F2, arrows), date picker |
| **Master-Detail** | Expandable rows with nested grid or custom HTML, mobile bottom sheet |
| **Export** | CSV, Excel, JSON (inline buttons in toolbar) |
| **Import** | Excel (.xlsx), CSV, JSON file import |
| **Find** | Ctrl+F search with match highlighting |
| **Theming** | Light/Dark/Zentto themes, 40+ CSS custom properties |
| **i18n** | Spanish, English (built-in), extensible |
| **Configurator** | Built-in settings panel (Features, Pivot, Groups, Theme, Code generator) |
| **Code Gen** | Generates copyable code for React, HTML, and Vue |

## Theming

Override any visual aspect with CSS custom properties:

```css
zentto-grid {
  --zg-primary: #8b5cf6;
  --zg-header-bg: #faf5ff;
  --zg-row-hover: rgba(139, 92, 246, 0.06);
  --zg-font-family: "Poppins", sans-serif;
  --zg-radius-lg: 16px;
}
```

## Works Everywhere

- **React / Next.js** — `import '@zentto/datagrid'` + `<zentto-grid ref={ref} />`
- **Vue 3** — `import '@zentto/datagrid'` + `<zentto-grid ref="grid" />`
- **Angular** — `import '@zentto/datagrid'` + `<zentto-grid #grid />`
- **Svelte** — `import '@zentto/datagrid'` + `<zentto-grid bind:this={grid} />`
- **Plain HTML** — `<script type="module" src="@zentto/datagrid"></script>`

## Bundle Size

~38 KB gzipped (including Lit). Compare: MUI X ~200 KB, AG Grid ~300 KB.

## License

MIT - Free for commercial and personal use.

## Links

- [GitHub](https://github.com/zentto-erp/zentto-datagrid)
- [Custom Styles Guide](https://github.com/zentto-erp/zentto-datagrid/blob/main/docs/custom-styles.md)
- [API Reference](https://github.com/zentto-erp/zentto-datagrid#column-definition-api)
