[🇬🇧 Read in English](custom-styles.md)

# Guia de Estilos Personalizados y Temas

ZenttoDataGrid usa **CSS custom properties** (variables) para todos los aspectos visuales. Al ser un web component con Shadow DOM, la API de estilos es explicita y predecible — sobreescribes variables desde afuera, y el grid las respeta.

---

## Override Rapido

```css
zentto-grid {
  --zg-primary: #8b5cf6;        /* violeta */
  --zg-header-bg: #faf5ff;
  --zg-row-hover: rgba(139, 92, 246, 0.06);
  --zg-font-family: "Poppins", sans-serif;
  --zg-radius-lg: 16px;
}
```

Eso es todo. Sin build, sin archivo de tema, sin provider. Solo CSS.

---

## Todos los Design Tokens

### Tipografia

| Token | Default | Descripcion |
|-------|---------|-------------|
| `--zg-font-family` | `"Inter", -apple-system, ...` | Stack de fuentes |
| `--zg-font-size` | `13.5px` | Tamano base |
| `--zg-grid-size` | `8px` | Unidad de spacing |

### Colores

| Token | Default (light) | Descripcion |
|-------|----------------|-------------|
| `--zg-primary` | `#e67e22` | Color de marca / acento |
| `--zg-primary-soft` | `rgba(230,126,34,0.09)` | Tinte suave (hovers, selecciones) |
| `--zg-bg` | `#ffffff` | Fondo del grid |
| `--zg-surface` | `#f7f8fa` | Fondo toolbar, footer, agrupaciones |
| `--zg-text` | `#1c1e21` | Color de texto principal |
| `--zg-text-secondary` | `#5f6368` | Texto secundario |
| `--zg-text-muted` | `#9aa0a6` | Texto opaco (placeholders) |
| `--zg-border` | `rgba(0,0,0,0.1)` | Borde por defecto |
| `--zg-border-strong` | `rgba(0,0,0,0.18)` | Borde fuerte (header, divisores) |

### Cabecera

| Token | Default | Descripcion |
|-------|---------|-------------|
| `--zg-header-bg` | `#f7f8fa` | Fondo del header |
| `--zg-header-color` | `#1c1e21` | Color texto header |
| `--zg-header-hover` | `rgba(0,0,0,0.04)` | Hover del header |
| `--zg-header-height` | `42px` | Altura del header |
| `--zg-header-weight` | `600` | Peso de fuente |
| `--zg-header-size` | `12.5px` | Tamano de fuente |

### Filas

| Token | Default | Descripcion |
|-------|---------|-------------|
| `--zg-row-height` | `40px` | Altura de fila |
| `--zg-row-stripe` | `#fafbfc` | Fila alternada |
| `--zg-row-hover` | `rgba(230,126,34,0.06)` | Hover de fila |
| `--zg-row-selected` | `rgba(230,126,34,0.1)` | Fila seleccionada |

### Profundidad y Forma

| Token | Default | Descripcion |
|-------|---------|-------------|
| `--zg-radius` | `4px` | Radio pequeno (botones, inputs) |
| `--zg-radius-lg` | `10px` | Radio grande (contenedor, paneles) |
| `--zg-shadow-sm/md/lg` | Sombras suaves | Profundidad visual |

---

## Temas Incluidos

- **Light** (default) — Fondo blanco, acentos calidos
- **Dark** — `theme="dark"`
- **Zentto** — `theme="zentto"` (amber)

---

## Overrides por Framework

### React / Next.js

```tsx
<zentto-grid
  ref={gridRef}
  style={{
    '--zg-primary': '#6366f1',
    '--zg-header-bg': '#eef2ff',
  } as React.CSSProperties}
/>
```

### Vue 3

```vue
<zentto-grid :style="{ '--zg-primary': '#10b981' }" />
```

### Angular

```html
<zentto-grid [style.--zg-primary]="'#f43f5e'"></zentto-grid>
```

### HTML / CSS puro

```css
zentto-grid {
  --zg-primary: #0ea5e9;
  --zg-font-family: "Roboto", sans-serif;
}
```

---

## Crear un Tema Completo

```css
zentto-grid.mi-tema {
  --zg-primary: #635bff;
  --zg-bg: #ffffff;
  --zg-surface: #f6f9fc;
  --zg-text: #1a1f36;
  --zg-header-bg: #f6f9fc;
  --zg-row-hover: rgba(99, 91, 255, 0.04);
  --zg-radius-lg: 12px;
  --zg-font-family: "Inter", sans-serif;
}
```

```html
<zentto-grid class="mi-tema" ...></zentto-grid>
```

---

## Iconos Personalizados

Todos los iconos son SVG strings. Sobreescribe cualquiera via `icons`:

```js
grid.icons = {
  search: '<svg ...>...</svg>',
  export: '<svg ...>...</svg>',
};
```

---

## Modos de Densidad

| Modo | Altura Fila | Ideal Para |
|------|------------|------------|
| `compact` | 30px | Datos densos |
| `standard` | 40px | Balance (default) |
| `comfortable` | 48px | Touch, legibilidad |

---

## Responsive

El grid se adapta automaticamente en `< 768px`. Override con media query:

```css
@media (max-width: 767px) {
  zentto-grid {
    --zg-row-height: 36px;
    --zg-font-size: 11px;
  }
}
```
