[🇪🇸 Leer en Español](custom-styles.es.md)

# Custom Styles & Theming Guide

ZenttoDataGrid uses **CSS custom properties** (variables) for all visual aspects. Since it's a web component with Shadow DOM, the styling API is explicit and predictable — you override variables from the outside, and the grid respects them.

---

## Quick Override

```css
zentto-grid {
  --zg-primary: #8b5cf6;        /* violet brand */
  --zg-header-bg: #faf5ff;
  --zg-row-hover: rgba(139, 92, 246, 0.06);
  --zg-font-family: "Poppins", sans-serif;
  --zg-radius-lg: 16px;
}
```

That's it. No build step, no theme file, no provider. Just CSS.

---

## All Design Tokens

### Typography

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-font-family` | `"Inter", -apple-system, ...` | Font stack |
| `--zg-font-size` | `13.5px` | Base font size |
| `--zg-grid-size` | `8px` | Spacing unit (padding = grid-size * multiplier) |

### Colors

| Token | Default (light) | Description |
|-------|----------------|-------------|
| `--zg-primary` | `#e67e22` | Brand / accent color |
| `--zg-primary-soft` | `rgba(230,126,34,0.09)` | Light tint of primary (hovers, selections) |
| `--zg-bg` | `#ffffff` | Grid background |
| `--zg-surface` | `#f7f8fa` | Toolbar, footer, grouping backgrounds |
| `--zg-text` | `#1c1e21` | Primary text color |
| `--zg-text-secondary` | `#5f6368` | Secondary text (labels, counts) |
| `--zg-text-muted` | `#9aa0a6` | Muted text (placeholders, row numbers) |
| `--zg-border` | `rgba(0,0,0,0.1)` | Default border color |
| `--zg-border-strong` | `rgba(0,0,0,0.18)` | Stronger border (header bottom, dividers) |

### Header

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-header-bg` | `#f7f8fa` | Header background |
| `--zg-header-color` | `#1c1e21` | Header text color |
| `--zg-header-hover` | `rgba(0,0,0,0.04)` | Header hover background |
| `--zg-header-height` | `42px` | Header row height |
| `--zg-header-weight` | `600` | Header font weight |
| `--zg-header-size` | `12.5px` | Header font size |
| `--zg-header-tracking` | `0.025em` | Header letter spacing |

### Rows

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-row-height` | `40px` | Data row height |
| `--zg-row-bg` | `var(--zg-bg)` | Row background |
| `--zg-row-stripe` | `#fafbfc` | Alternating row background |
| `--zg-row-hover` | `rgba(230,126,34,0.06)` | Row hover background |
| `--zg-row-selected` | `rgba(230,126,34,0.1)` | Selected row background |

### Inputs

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-input-bg` | `#fff` | Input background |
| `--zg-input-border` | `rgba(0,0,0,0.18)` | Input border |
| `--zg-focus-ring` | `0 0 0 3px rgba(230,126,34,0.22)` | Focus ring shadow |

### Depth & Shape

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-radius` | `4px` | Small radius (buttons, inputs) |
| `--zg-radius-lg` | `10px` | Large radius (container, panels) |
| `--zg-shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Subtle shadow |
| `--zg-shadow-md` | `0 4px 14px rgba(0,0,0,0.1)` | Medium shadow |
| `--zg-shadow-lg` | `0 8px 28px rgba(0,0,0,0.14)` | Large shadow (dropdowns, modals) |

### Status Colors

| Token | Default | Description |
|-------|---------|-------------|
| `--zg-success` | `#0d9668` | Success chip/status |
| `--zg-error` | `#d63031` | Error chip/status |
| `--zg-warning` | `#e67e22` | Warning chip/status |
| `--zg-info` | `#2d7dd2` | Info chip/status |

---

## Built-in Themes

### Light (default)
No extra config needed. Clean white background with warm accents.

### Dark
```html
<zentto-grid theme="dark"></zentto-grid>
```

### Zentto (amber brand)
```html
<zentto-grid theme="zentto"></zentto-grid>
```

---

## Framework-Specific Overrides

### React / Next.js

```tsx
<zentto-grid
  ref={gridRef}
  style={{
    '--zg-primary': '#6366f1',
    '--zg-header-bg': '#eef2ff',
    '--zg-row-hover': 'rgba(99, 102, 241, 0.06)',
    '--zg-font-family': '"Inter", sans-serif',
  } as React.CSSProperties}
/>
```

### Vue 3

```vue
<zentto-grid
  ref="gridRef"
  :style="{
    '--zg-primary': '#10b981',
    '--zg-header-bg': '#ecfdf5',
  }"
/>
```

### Angular

```html
<zentto-grid
  #grid
  [style.--zg-primary]="'#f43f5e'"
  [style.--zg-header-bg]="'#fff1f2'"
></zentto-grid>
```

### Plain HTML / CSS

```css
zentto-grid {
  --zg-primary: #0ea5e9;
  --zg-header-bg: #f0f9ff;
  --zg-font-family: "Roboto", sans-serif;
  --zg-row-height: 48px;
}

/* Dark mode override */
@media (prefers-color-scheme: dark) {
  zentto-grid {
    --zg-bg: #0f172a;
    --zg-surface: #1e293b;
    --zg-text: #e2e8f0;
    --zg-border: rgba(255,255,255,0.1);
  }
}
```

---

## Custom Icon Overrides

All toolbar and menu icons are SVG strings. Override any icon via the `icons` property:

```js
grid.icons = {
  search: '<svg ...>...</svg>',    // Replace search icon
  export: '<svg ...>...</svg>',    // Replace export icon
  settings: '<svg ...>...</svg>',  // Replace settings gear
};
```

Action buttons also accept SVG strings:

```js
grid.actionButtons = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ...><path d="..."/></svg>',
    label: 'View',
    action: 'view',
  },
];
```

---

## Density Modes

Control row spacing with the `density` property:

| Mode | Row Height | Header Height | Best For |
|------|-----------|---------------|----------|
| `compact` | 30px | 34px | Dense data, many rows |
| `standard` | 40px | 42px | Default balance |
| `comfortable` | 48px | 46px | Touch-friendly, readability |

```html
<zentto-grid density="compact"></zentto-grid>
```

---

## Creating a Custom Theme

Combine multiple tokens to create a complete brand theme:

```css
/* Stripe-inspired theme */
zentto-grid.stripe-theme {
  --zg-primary: #635bff;
  --zg-primary-soft: rgba(99, 91, 255, 0.08);
  --zg-bg: #ffffff;
  --zg-surface: #f6f9fc;
  --zg-text: #1a1f36;
  --zg-text-secondary: #697386;
  --zg-border: #e3e8ee;
  --zg-header-bg: #f6f9fc;
  --zg-header-color: #1a1f36;
  --zg-header-height: 44px;
  --zg-row-height: 44px;
  --zg-row-hover: rgba(99, 91, 255, 0.04);
  --zg-row-selected: rgba(99, 91, 255, 0.08);
  --zg-radius: 6px;
  --zg-radius-lg: 12px;
  --zg-font-family: "-apple-system", "Segoe UI", sans-serif;
  --zg-focus-ring: 0 0 0 3px rgba(99, 91, 255, 0.2);
}
```

```html
<zentto-grid class="stripe-theme" ...></zentto-grid>
```

---

## Responsive Overrides

The grid automatically adapts at `< 768px`:

```
--zg-font-size: 12px
--zg-grid-size: 6px
--zg-row-height: 34px
--zg-header-height: 34px
```

Override mobile-specific values with a media query on the host:

```css
@media (max-width: 767px) {
  zentto-grid {
    --zg-row-height: 36px;
    --zg-font-size: 11px;
  }
}
```

---

## CSS Class Reference

All internal classes use the `zg-` prefix. While you can't directly style Shadow DOM children from outside, the CSS variables control every visual aspect. For advanced cases, the `::part()` selector can be added in future versions.

| Class | Purpose |
|-------|---------|
| `.zg-container` | Root grid container |
| `.zg-toolbar` | Toolbar area |
| `.zg-th` | Header cell |
| `.zg-td` | Data cell |
| `.zg-row` | Data row |
| `.zg-row-alt` | Alternating row |
| `.zg-footer` | Footer / pagination |
| `.zg-chip` | Status chip |
| `.zg-btn-icon` | Icon button |
| `.zg-context-menu` | Context menu |
| `.zg-bottom-sheet` | Mobile detail drawer |
