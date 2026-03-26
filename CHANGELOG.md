# Changelog

All notable changes to `@zentto/datagrid` will be documented in this file.

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
