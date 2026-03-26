# Changelog

All notable changes to `@zentto/datagrid` will be documented in this file.

## [1.2.0] - 2026-03-26

### Added
- **Chart as full view** — Charts are now a view mode (like table, form, cards, kanban). Hides table and uses full space.
- **8 chart types** — Bar, Line, Area, Pie, Donut, Stacked, Combo, Scatter. All render correctly.
- **Chart config panel** — Type selector, X axis dropdown, Y axis multi-select buttons, aggregation, title input, legend toggle
- **Help panel** — 6 cards explaining how to create useful charts for users and developers
- **Values on bars** — Bar/Stacked/Combo show numeric values inside (white) or above (colored) each bar
- **Values on points** — Line/Area show numeric values above each data point
- **Labels on scatter** — Scatter shows category name near each point
- **Multi-series** — Select multiple Y fields to compare in the same chart
- **Filters apply to charts** — Quick search and header filters affect chart data in real time
- **Note indicator fixed** — `position: relative` on `.zg-td` makes orange triangle visible
- **Note editor context** — Shows field name and value in the edit modal title ("Nota: Harina de Trigo 1kg")
- **Notes in context menu** — Add/Edit/Delete note integrated in the main right-click menu (no separate menu)
- **Single tooltip on notes** — Removed CSS `::after` tooltip, only native `title` attribute

### Fixed
- **ChildPart error resolved** — Replaced `unsafeHTML()` in chart SVGs with `.innerHTML` directive to avoid Lit DOM tracking issues
- **Chart SVG rendering** — Line, Area, Pie, Donut, Scatter now use string-based SVG injected via `.innerHTML` instead of Lit `html` template (which doesn't support SVG elements)
- **Removed download PNG** — Feature removed temporarily due to SVG-to-canvas limitations in Shadow DOM

## [1.1.0] - 2026-03-26

### Added
- **Chart view (initial)** — First implementation with SVG rendering (replaced in 1.2.0)

## [1.0.2] - 2026-03-26

### Fixed
- **Enter key in edit mode** — now moves right (next column) instead of down, so user sees the committed value
- **Duplicate create button removed** — CRUD bar no longer shows "Agregar" button when `enable-create` is active in toolbar
- **QR in Cards view** — only shows QR for columns explicitly marked with `barcode: 'qr'`, not by field name guessing
- **QR double-click zoom** — QR in Cards view opens full-size modal on double-click (same as table view)

### Improved
- **Form view** — QR of first field in header, hover lift effect on field cards, larger title, navigation buttons with scale animation
- **Cards view** — hover `translateY(-4px) scale(1.01)` with deep shadow, QR per card for barcode columns, dashed separators, 12px radius
- **Kanban view** — hover lift on cards and columns, group total sum displayed in column header, subtitle field, primary color for values, max-height scroll

## [1.0.1] - 2026-03-26

### Fixed
- Enter key in edit mode moves right instead of down
- Removed duplicate create button from CRUD bar

## [1.0.0] - 2026-03-26

### Added
- **129 unit tests** — Vitest test suite covering sort, filter, aggregate, group, paginate, formula, pivot, clipboard, find
- **CI/CD** — GitHub Actions workflow: test on PR, auto-publish to npm on version bump
- **Performance benchmarks** — Sort/filter/group/pivot benchmarks at 1K/10K/100K rows
- **Accessibility audit** — ARIA roles (grid, row, columnheader, gridcell), aria-sort, aria-selected, aria-expanded, aria-level, aria-colcount, focus-visible styles
- **QR codes now scannable** — Replaced custom QR implementation with `qrcode-generator` library (2KB, ISO 18004 compliant)
- **Conditional Formatting** — `conditionalFormat` rules: 10 operators (eq, gt, lt, between, etc)
- **Data Validation** — `validation` rules: email, number, date, regex, custom
- **Dropdown Cells** — `dropdown` for select-in-cell editing
- **Live Formula Recalculation** — formulas auto-recalculate on cell edit
- **Tree Data** — `enable-tree-data` with parent-child hierarchy
- **Row Pinning** — `pinnedRows: { top, bottom }`
- **Cell Merge** — `merge: true` for auto-merge consecutive same values
- **Collapsible Column Groups** — `collapsible: true` on groups
- **Frozen/Split Panes** — `freeze-rows` and `freeze-cols`
- **Server-Side Mode** — `pagination-mode="server"` with `server-request` event
- **Infinite Scroll** — `enable-infinite-scroll` with `load-more` event
- **Batch Edit** — Ctrl+D fill-down on selected range
- **Column Auto-Size** — Double-click resize handle
- **Charts (SVG)** — 5 types: bar, line, pie, area, donut
- **Print/PDF** — `enable-print` with optimized layout
- **Custom Summary Footer** — `aggregationLabel` per column
- **Cell Comments/Notes** — `enable-comments` with orange triangle indicator
- **Audit Trail** — `enable-audit` tracks changes with visual indicators
- **QR/Barcode in cell** — `barcode: 'qr' | 'code128'`
- **Status Timeline** — `timeline: true` for mini timelines
- **AI Column** — `ai: { prompt, fields }` for generative columns
- **Cell Hyperlinks** — `hyperlink: true` with URL patterns
- **Create Button** — `enable-create` emits `create-click` event
- **View Toggles** — `show-view-table/form/cards/kanban` configurable
- **Boolean rendering** — `type: 'boolean'` with check/X icons
- **Radio Options** — `radioOptions` for multi-state visual selectors
- **Color type** — `type: 'color'` with swatch circle
- **Percentage type** — `type: 'percentage'` with progress bar
- **Actions as column** — `type: 'actions'` with named icon resolution (30+ icons)

## [0.8.0] - 2026-03-25

### Added
- **Audit Trail** — `enable-audit` tracks who changed what, when. Blue dot indicator, hover tooltip with history
- **QR/Barcode in cell** — `barcode: 'qr' | 'code128'` renders SVG QR codes and Code 128 barcodes inline
- **Status Timeline** — `timeline: true` + `timelineField` renders horizontal mini-timeline in cell
- **AI Column** — `ai: { prompt, fields }` for generative columns. Event-driven, with cache and loading states
- **Cell Hyperlinks** — `hyperlink: true` + `hyperlinkPattern` for clickable cell links with URL templates

## [0.7.0] - 2026-03-25

### Added
- **Charts (SVG, zero deps)** — `enable-charts` adds toolbar button. 5 types: bar, line, pie, area, donut. Pure SVG, responsive
- **Print/PDF** — `enable-print` adds toolbar button. Opens print-optimized window with repeated headers, page breaks, auto landscape
- **Custom Summary Footer** — `aggregationLabel` per column. `computeTotals()` now supports avg, count, min, max per column
- **Cell Comments/Notes** — `enable-comments` + `cellNotes`. Orange triangle indicator, hover tooltip, right-click add/edit/delete

## [0.6.0] - 2026-03-25

### Added
- **Server-Side Mode** — `pagination-mode="server"` delegates sort/filter/search/group/pagination to backend. `server-request` event
- **Infinite Scroll** — `enable-infinite-scroll` with IntersectionObserver sentinel. `load-more` event, loading/done states
- **Batch Edit** — Ctrl+D fill-down from selected range. Applies value to all selected cells with `batch-edit` event
- **Column Auto-Size** — Double-click resize handle auto-fits to content. Also in header menu

## [0.5.0] - 2026-03-25

### Added
- **Tree Data** — `enable-tree-data` with `tree-id-field` and `tree-parent-field`. Indent, expand/collapse, folder icons
- **Row Pinning** — `pinnedRows: { top: [...], bottom: [...] }` keeps rows fixed during scroll
- **Cell Merge** — `merge: true` on column auto-merges consecutive cells with same value (rowspan)
- **Collapsible Column Groups** — `collapsible: true` on column groups. Toggle to show/hide children
- **Frozen/Split Panes** — `freeze-rows` and `freeze-cols` for sticky rows/columns during scroll

## [0.4.0] - 2026-03-25

### Added
- **Conditional Formatting** — `conditionalFormat` rules on columns. 10 operators (eq, gt, lt, between, etc). Style cells by value
- **Data Validation** — `validation` rules: email, number, date, regex, custom. Red border + error tooltip on invalid
- **Dropdown Cells** — `dropdown` on columns renders select in edit mode. Supports string[] or {value, label, color}[]
- **Live Formula Recalculation** — `formula` on columns auto-recalculates when cells are edited

## [0.3.6] - 2026-03-26

### Added
- **Boolean rendering** — `type: 'boolean'` renders check (green) or X (muted) icon. Supports `true/false`, `1/0`, `-1/0`, `'S'/'N'`, `'yes'/'no'`
- **Radio options** — `radioOptions` on ColumnDef renders visual radio buttons for multi-state fields. Clickable in edit mode, emits `cell-edit`
  ```ts
  { field: 'priority', header: 'Prioridad', radioOptions: [
    { value: 'high', label: 'Alta', color: '#dc2626' },
    { value: 'medium', label: 'Media', color: '#e67e22' },
    { value: 'low', label: 'Baja', color: '#0d9668' },
  ]}
  ```
- **Color type** — `type: 'color'` renders a circle swatch + hex text
- **Percentage type** — `type: 'percentage'` renders a progress bar (green >75%, orange >50%, red <25%) + number

## [0.3.5] - 2026-03-26

### Added
- **Create button** — `enable-create` shows a "Nuevo" button in the toolbar, emits `create-click` event. Customizable with `create-label` and `create-icon` props
- **View toggles in configurator** — Each view (table, form, cards, kanban) can be toggled on/off individually from the settings panel
- View buttons in toolbar conditioned by `show-view-table`, `show-view-form`, `show-view-cards`, `show-view-kanban` props

## [0.3.4] - 2026-03-26

### Fixed
- **[object Object] in cells** — Values that are objects now extract `.label`, `.name`, `.text`, or `.value` instead of showing `[object Object]`
- `_formatValue` handles object values gracefully

## [0.3.3] - 2026-03-26

### Added
- **`type: 'actions'` column** — Actions are now a regular column in the columns array with full control over width, pin, header, and N buttons. No more separate `actionButtons` prop needed.
  ```ts
  { field: 'actions', header: 'Acciones', type: 'actions', width: 130, pin: 'right',
    actions: [
      { icon: 'view', label: 'Ver', action: 'view' },
      { icon: 'edit', label: 'Editar', action: 'edit', color: '#e67e22' },
      { icon: 'delete', label: 'Eliminar', action: 'delete', color: '#dc2626' },
    ]
  }
  ```

## [0.3.2] - 2026-03-26

### Fixed
- Action column width now scales dynamically: `length * 40 + 16` px

## [0.3.1] - 2026-03-26

### Added
- **Named action icons** — Use `icon: "view"` instead of SVG strings. 30+ built-in icons: view, edit, delete, approve, reject, cancel, check, save, print, download, upload, refresh, lock, unlock, send, mail, phone, calendar, clock, star, money, user, info, warning, attachment, link
- `_resolveActionIcon()` method accepts icon names, SVG strings, and emojis

## [0.3.0] - 2026-03-26

### Added
- **Multi-view mode** — 4 views switchable from toolbar:
  - **Table** (default) — classic rows/columns
  - **Form** — one record at a time with prev/next navigation, responsive grid layout
  - **Cards** — grid of cards with title, subtitle, key fields
  - **Kanban** — columns by status field (auto-detected from `statusColors`)
- View mode buttons in toolbar with SVG icons
- `viewMode` prop: `'table' | 'form' | 'cards' | 'kanban'`
- `kanbanField` prop for Kanban column grouping

## [0.2.4] - 2026-03-25

### Fixed
- **Locale is now global** — `locale` prop accepts any BCP 47 tag (`es`, `en`, `pt`, `fr`, `de`, `es-VE`, `en-GB`, etc.)
- Dates formatted with `Intl.DateTimeFormat` using locale directly (dd/mm/yyyy for es, mm/dd/yyyy for en)
- Currency formatted with `Intl.NumberFormat` using locale directly
- Numbers without currency: no forced decimals (integers show as 301, not 301,00)

## [0.2.3] - 2026-03-25

### Fixed
- Date format respects locale: `day: '2-digit', month: '2-digit', year: 'numeric'`
- DateTime includes hours/minutes

## [0.2.2] - 2026-03-25

### Changed
- **Default density: compact** (was standard) — 30px row height
- Wider action column: `length * 36 + 16` px

## [0.2.1] - 2026-03-25

### Added
- **Auto-detect dark mode** — Grid detects dark theme from:
  - `data-theme="dark"` on html/body
  - `prefers-color-scheme: dark` media query
  - Body background color (RGB average < 100)
  - MutationObserver watches for theme changes in real-time
- `_themeSetExplicitly` flag prevents override when theme is set via prop

## [0.2.0] - 2026-03-25

### Added
- **Virtual Scroll (100K+)** — `enable-virtual-scroll` renders only visible rows
- **Sparklines** — `sparkline: 'line' | 'bar' | 'area'` in ColumnDef renders mini charts
- **Undo/Redo** — `enable-undo-redo` with Ctrl+Z/Y support
- **Range Selection** — `enable-range-selection` with mouse drag and Shift+Arrow
- **Paste from Excel** — `enable-paste` with Ctrl+V, auto-parses tabs/CSV
- **Vue wrapper** — `@zentto/datagrid-vue` package
- **Angular wrapper** — `@zentto/datagrid-angular` package
- **Accessibility** — ARIA roles (grid, row, gridcell, columnheader), aria-sort, aria-selected, focus-visible

## [0.1.2] - 2026-03-25

### Fixed
- Totals row: no currency symbol (only number with 2 decimals)
- Totals row: `overflow: visible` to prevent truncation of large numbers
- Numbers without `currency`: show decimals only when needed (301 not 301,00)

## [0.1.1] - 2026-03-25

### Added
- README files for all 3 npm packages
- Keywords and repository links in package.json

## [0.1.0] - 2026-03-25

### Added (initial release)
- **Built-in Configurator** — 5-tab settings panel (Features, Pivot, Groups, Theme, Code)
- **Row Group Drop Zone** — drag headers to group, removable chips
- **Pivot Mode** — `enablePivot` + `pivotConfig` with auto-initialization
- **Master-Detail** — nested `<zentto-grid>` with `detailColumns` + `detailRowsAccessor`
- **Mobile Bottom Sheet** — slide-up drawer for master-detail on mobile
- **Quick Search** — global text filter across all columns
- **Import** — Excel (.xlsx), CSV, JSON file import with `enableImport`
- **Date Picker** — inline calendar for date fields with clear button
- **Excel-like Navigation** — click cell, arrows, Tab, Enter, F2, type-to-edit
- **SVG Icons** — all icons are inline SVG (Lucide-style), overrideable via `icons` prop
- **Export Buttons Inline** — CSV (download icon), Excel (table icon, green), JSON (braces icon, orange)
- **Settings Button** — `enableConfigurator` renders gear icon in toolbar
- **Layout Persistence** — IndexedDB save/restore via `gridId` prop
- **Dark Mode** — full dark theme with explicit CSS overrides for all elements
- **3 Themes** — light (default), dark, zentto (amber)
- **3 Density Modes** — compact (30px), standard (40px), comfortable (48px)
- **Zentto Design Language** — warm palette, Inter font, 30+ CSS custom properties
- **i18n** — Spanish/English built-in, extensible
- **Zero framework lock-in** — works in React, Vue, Angular, Svelte, plain HTML
- **~38 KB gzipped** — vs MUI X ~200 KB, AG Grid ~300 KB
