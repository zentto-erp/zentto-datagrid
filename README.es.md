[🇬🇧 Read in English](README.md)

<p align="center">
  <img src="https://zentto.net/favicon.svg" width="64" alt="Zentto Logo" />
</p>

<h1 align="center">ZenttoDataGrid</h1>

<p align="center">
  <strong>El data grid gratuito y open-source con funcionalidades enterprise.</strong><br />
  90+ funcionalidades. Sin dependencia de framework. Un solo web component.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://www.npmjs.com/package/@zentto/datagrid"><img src="https://img.shields.io/npm/v/@zentto/datagrid.svg?color=orange" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/@zentto/datagrid"><img src="https://img.shields.io/bundlephobia/minzip/@zentto/datagrid?label=gzip" alt="bundle size" /></a>
  <img src="https://img.shields.io/badge/dependencies-1%20(lit)-green" alt="dependencies" />
  <img src="https://img.shields.io/badge/web%20component-%E2%9C%93-brightgreen" alt="web component" />
</p>

<p align="center">
  <a href="#inicio-rapido">Inicio rapido</a> |
  <a href="#funcionalidades">Funcionalidades</a> |
  <a href="#ejemplos-de-uso">Ejemplos</a> |
  <a href="#api-de-definicion-de-columnas">API de Columnas</a> |
  <a href="#api-de-propiedades-del-grid">API del Grid</a> |
  <a href="#eventos">Eventos</a>
</p>

---

## Por que ZenttoDataGrid?

La mayoria de los data grids enterprise cobran cientos o miles de dolares por desarrollador al ano por funcionalidades como tablas pivote, agrupacion de filas y ordenamiento multi-columna. ZenttoDataGrid incluye **todas estas funcionalidades gratis**, como un web component basado en estandares que funciona en cualquier framework.

| Funcionalidad | ZenttoDataGrid | MUI X Premium | AG Grid Enterprise |
|---|:---:|:---:|:---:|
| **Precio** | **GRATIS (MIT)** | $180/dev/ano | $999/dev/ano |
| Ordenamiento multi-columna | Si | Si | Si |
| Filtros en cabecera | Si | Si | Si |
| Agrupacion de filas + subtotales | Si | Si | Si |
| Tablas pivote | Si | Si | Si |
| Columnas fijas (pinning) | Si | Si | Si |
| Master-detail | Si | Si | Si |
| Portapapeles (copiar/pegar) | Si | Si | Si |
| Menu contextual | Si | Si | Si |
| Buscar y resaltar (Ctrl+F) | Si | No | Si |
| Exportar (CSV, Excel, JSON, Markdown) | Si | Parcial | Si |
| Redimensionar + reordenar columnas | Si | Si | Si |
| Chips de estado, avatares, ratings | Si | No | No |
| Temas integrados (claro/oscuro/personalizado) | Si | Si | Si |
| i18n (en, es, pt) | Si | Si | Si |
| Persistencia de layout | Si | Si | Si |
| Web component (agnositco de framework) | Si | No | No |
| Wrapper para React | Si | Nativo | Si |
| Cero dependencias externas (core) | Si | No | No |
| Tamano del bundle (gzipped) | ~15 KB | ~200 KB | ~300 KB |

---

## Funcionalidades

### Procesamiento de Datos
- Ordenamiento multi-columna (ascendente, descendente, limpiar)
- Filtrado del lado del cliente con 14 operadores (`contains`, `equals`, `gt`, `between`, `inList`, etc.)
- Filtros en cabecera con parseo inteligente de operadores para columnas numericas (`>100`, `<=50`)
- Busqueda de texto completo (Ctrl+F) con resaltado de coincidencias y navegacion
- Paginacion del lado del cliente con tamanos de pagina configurables
- Modo de paginacion del lado del servidor

### Agrupacion y Agregacion
- Agrupacion de filas con grupos colapsables
- Subtotales por grupo (sum, avg, count, min, max)
- Ordenamiento de grupos (ascendente/descendente)
- Tablas pivote (campo de fila, campo de columna, campo de valor, totales generales)
- Fila de totales en el pie con agregacion por columna
- Etiqueta de totales personalizable

### Funcionalidades de Columnas
- Columnas fijas (sticky a izquierda/derecha)
- Redimensionamiento de columnas (arrastrar bordes)
- Reordenamiento de columnas
- Grupos de columnas (cabeceras multi-nivel)
- Ocultamiento responsivo de columnas (`mobileHide`, `tabletHide`)
- Tamano flexible y restricciones de ancho minimo

### Plantillas de Celda Enriquecidas
- **Chips de estado** -- insignias con colores y variantes rellenas/delineadas
- **Celdas con avatar** -- imagen + nombre + subtitulo, circular/redondeado/cuadrado
- **Barras de progreso** -- visualizacion porcentual con maximo configurable
- **Puntuacion con estrellas** -- estrellas llenas/vacias con maximo configurable
- **Banderas de pais** -- banderas emoji a partir de codigos ISO 3166-1 alpha-2
- **Enlaces** -- URLs clicables con control de destino
- **Imagenes/Miniaturas** -- imagenes en linea con dimensiones configurables
- **Formato de moneda** -- ISO 4217 con visualizacion adaptada al locale
- **Renderizadores personalizados** -- `renderCell(value, row)` retorna un string HTML

### Seleccion y Portapapeles
- Seleccion de filas (clic para seleccionar)
- Copiar todos los datos al portapapeles
- Copiar valor de celda individual (menu contextual)
- Copiar fila completa (menu contextual)

### Master-Detail
- Filas expandibles con renderizador de detalle personalizado
- Alternar expandir/colapsar por fila
- Evento `row-expand` para carga diferida (lazy loading)

### Menu Contextual
- Menu integrado con clic derecho (Copiar Celda, Copiar Fila, Exportar CSV)
- Extensible con `contextMenuItems` personalizados

### Exportacion
- Descarga CSV
- Descarga Excel (formato tabla HTML)
- Descarga JSON
- Descarga Markdown
- Nombre de archivo configurable

### Apariencia y Temas
- Tres temas integrados: `light`, `dark`, `zentto`
- 20+ propiedades CSS personalizables para customizacion total
- Tres modos de densidad: `compact`, `standard`, `comfortable`
- Estado de carga con skeleton/spinner
- Altura configurable

### Internacionalizacion
- Locales integrados: `es` (espanol), `en` (ingles), `pt` (portugues)
- Formato de numeros y fechas adaptado al locale

### Persistencia de Layout
- Guardar/restaurar anchos de columna, orden y filtros
- `gridId` para paginas con multiples grids
- Persistencia basada en LocalStorage

---

## Inicio Rapido

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

### Vue (proximamente)

```bash
npm install @zentto/datagrid-vue   # planificado
```

### Angular (proximamente)

```bash
npm install @zentto/datagrid-angular   # planificado
```

> Como `<zentto-grid>` es un web component estandar, ya funciona en Vue y Angular sin necesidad de wrapper. Los paquetes especificos de cada framework agregaran bindings con tipado seguro.

---

## Ejemplos de Uso

### Tabla Basica

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

### Con Filtros en Cabecera + Totales + Portapapeles

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

> Los filtros de cabecera soportan operadores inteligentes para columnas numericas: escribe `>100`, `<=50`, `!=0` directamente en el campo de filtro.

### Master-Detail (Filas Expandibles)

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

### Tabla Pivote

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

El motor de pivote crea columnas dinamicamente a partir de los valores distintos en `columnField` y agrega el `valueField` usando la funcion especificada.

### Agrupacion de Filas con Subtotales

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

Los grupos son colapsables. Los subtotales usan la `aggregation` definida en cada columna.

### Plantillas de Columna

**Chips de Estado:**

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

**Avatar con Subtitulo:**

```js
{
  field: 'name',
  header: 'Employee',
  avatarField: 'photoUrl',    // row[photoUrl] = image URL
  subtitleField: 'role',      // row[role] = subtitle text
  avatarVariant: 'circular'   // 'circular' | 'rounded' | 'square'
}
```

**Bandera de Pais:**

```js
{
  field: 'country',
  header: 'Country',
  flagField: 'countryCode'    // row[countryCode] = 'US', 'ES', 'CO', etc.
}
```

**Barra de Progreso:**

```js
{
  field: 'progress',
  header: 'Completion',
  progressMax: 100,
  progressColor: '#4caf50'
}
```

**Puntuacion con Estrellas:**

```js
{
  field: 'rating',
  header: 'Rating',
  ratingMax: 5
}
```

**Enlace:**

```js
{
  field: 'website',
  header: 'Website',
  linkField: 'url',           // row[url] = 'https://...'
  linkTarget: '_blank'
}
```

**Renderizador Personalizado:**

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

### Menu Contextual + Buscar (Ctrl+F)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-context-menu
  enable-find
  enable-clipboard
></zentto-grid>
```

Haz clic derecho en cualquier celda para acceder a: **Copiar Celda**, **Copiar Fila**, **Exportar CSV**.

Presiona `Ctrl+F` para abrir la barra de busqueda dentro del grid. Navega entre coincidencias con `Enter`. Presiona `Escape` para cerrar.

### Columnas Fijas (Pinning)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  .pinnedColumns=${{ left: ['id', 'name'], right: ['actions'] }}
></zentto-grid>
```

Las columnas fijas permanecen visibles mientras el resto del grid se desplaza horizontalmente.

### Temas con CSS Custom Properties

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  theme="dark"
></zentto-grid>
```

Sobreescribe cualquier variable para una personalizacion completa:

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

**Temas integrados:** `light` (por defecto), `dark`, `zentto` (acento ambar).

---

## API de Definicion de Columnas

Cada columna se describe con un objeto `ColumnDef`:

| Propiedad | Tipo | Por defecto | Descripcion |
|---|---|---|---|
| `field` | `string` | **(requerido)** | Clave en el objeto de datos de la fila |
| `header` | `string` | nombre del campo | Texto de la cabecera |
| `width` | `number` | `120` | Ancho de la columna en pixeles |
| `flex` | `number` | -- | Factor de crecimiento flexible |
| `minWidth` | `number` | -- | Ancho minimo en pixeles |
| `type` | `'string' \| 'number' \| 'date' \| 'datetime' \| 'boolean'` | `'string'` | Tipo de dato (afecta el formato y los operadores de filtro) |
| `sortable` | `boolean` | `false` | Permitir ordenar por esta columna |
| `filterable` | `boolean` | `false` | Permitir filtrar por esta columna |
| `resizable` | `boolean` | `false` | Permitir redimensionar esta columna |
| `reorderable` | `boolean` | `false` | Permitir reordenar esta columna |
| `pin` | `'left' \| 'right'` | -- | Fijar columna al borde izquierdo o derecho |
| `mobileHide` | `boolean` | `false` | Ocultar en pantallas < 768px |
| `tabletHide` | `boolean` | `false` | Ocultar en pantallas < 1024px |
| `aggregation` | `'sum' \| 'avg' \| 'count' \| 'min' \| 'max'` | -- | Agregacion para la fila de totales/subtotales |
| `currency` | `string \| true` | -- | Codigo de moneda ISO 4217 (ej. `'USD'`), o `true` para usar el valor por defecto del grid |
| `groupable` | `boolean` | `false` | Permitir agrupar por esta columna |
| `columnGroupId` | `string` | -- | ID del grupo de columnas padre |
| `renderCell` | `(value, row) => string` | -- | Renderizador personalizado de celda (retorna string HTML) |
| `renderHeader` | `() => string` | -- | Renderizador personalizado de cabecera |

### Propiedades de Plantilla

| Propiedad | Tipo | Descripcion |
|---|---|---|
| `statusColors` | `Record<string, string>` | Mapa de colores para chips de estado: `{ 'Active': 'success', 'Inactive': 'error' }` |
| `statusVariant` | `'filled' \| 'outlined'` | Variante de estilo del chip de estado |
| `avatarField` | `string` | Campo de la fila que contiene la URL de la imagen del avatar |
| `subtitleField` | `string` | Campo de la fila para el texto del subtitulo debajo del valor principal |
| `avatarVariant` | `'circular' \| 'rounded' \| 'square'` | Forma del avatar |
| `progressMax` | `number` | Valor maximo para la barra de progreso (habilita la plantilla de progreso) |
| `progressColor` | `string` | Color CSS para el relleno de la barra de progreso |
| `ratingMax` | `number` | Maximo de estrellas para la puntuacion (habilita la plantilla de rating) |
| `flagField` | `string` | Campo de la fila que contiene el codigo de pais ISO 3166-1 alpha-2 |
| `linkField` | `string` | Campo de la fila que contiene la URL para la plantilla de enlace |
| `linkTarget` | `'_blank' \| '_self'` | Atributo target del enlace |
| `imageField` | `string` | Campo de la fila que contiene la URL de la imagen para miniatura |
| `imageWidth` | `number` | Ancho de la miniatura en pixeles |
| `imageHeight` | `number` | Alto de la miniatura en pixeles |

---

## API de Propiedades del Grid

Todas las propiedades se pueden establecer como atributos HTML (kebab-case) o propiedades JavaScript (camelCase).

| Atributo | Propiedad | Tipo | Por defecto | Descripcion |
|---|---|---|---|---|
| `columns` | `columns` | `ColumnDef[]` | `[]` | Definiciones de columnas |
| `rows` | `rows` | `GridRow[]` | `[]` | Datos de las filas |
| `theme` | `theme` | `'light' \| 'dark' \| 'zentto'` | `'light'` | Tema de color |
| `locale` | `locale` | `'es' \| 'en' \| 'pt'` | `'es'` | Locale de visualizacion |
| `density` | `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Densidad de filas |
| `height` | `height` | `string` | `'500px'` | Altura del contenedor del grid |
| `loading` | `loading` | `boolean` | `false` | Mostrar estado de carga |
| `show-totals` | `showTotals` | `boolean` | `false` | Mostrar fila de totales con agregacion |
| `totals-label` | `totalsLabel` | `string` | `'Totales'` | Etiqueta para la fila de totales |
| `default-currency` | `defaultCurrency` | `string` | `'USD'` | Moneda ISO 4217 por defecto |
| `enable-clipboard` | `enableClipboard` | `boolean` | `false` | Habilitar boton de copiar todo |
| `enable-find` | `enableFind` | `boolean` | `false` | Habilitar busqueda con Ctrl+F |
| `enable-header-filters` | `enableHeaderFilters` | `boolean` | `false` | Mostrar campos de filtro debajo de las cabeceras |
| `enable-status-bar` | `enableStatusBar` | `boolean` | `false` | Mostrar barra de estado con conteo de filas |
| `enable-context-menu` | `enableContextMenu` | `boolean` | `false` | Habilitar menu contextual con clic derecho |
| `enable-master-detail` | `enableMasterDetail` | `boolean` | `false` | Habilitar filas expandibles con detalle |
| -- | `detailRenderer` | `(row) => string` | -- | Renderizador HTML para el panel de detalle |
| `enable-grouping` | `enableGrouping` | `boolean` | `false` | Habilitar agrupacion de filas |
| `group-field` | `groupField` | `string` | `''` | Campo por el cual agrupar filas |
| `group-subtotals` | `groupSubtotals` | `boolean` | `false` | Mostrar subtotales por grupo |
| `group-sort` | `groupSort` | `'asc' \| 'desc' \| ''` | `''` | Direccion de ordenamiento de grupos |
| -- | `pinnedColumns` | `{ left?: string[]; right?: string[] }` | `{}` | Configuracion de columnas fijas |
| -- | `columnGroups` | `ColumnGroup[]` | `[]` | Grupos de cabeceras multi-nivel |
| `export-filename` | `exportFilename` | `string` | `'export'` | Nombre base del archivo para exportaciones |
| `page-size-options` | `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Opciones del selector de tamano de pagina |

---

## Eventos

Todos los eventos se emiten como `CustomEvent` con `detail` tipado. Puedes escucharlos con `addEventListener` o con las props de eventos del wrapper de React.

| Nombre del Evento | Prop en React | Detail | Descripcion |
|---|---|---|---|
| `row-click` | `onRowClick` | `{ row: GridRow, rowIndex: number }` | Se hizo clic en una fila |
| `cell-click` | `onCellClick` | `{ row: GridRow, field: string, value: unknown }` | Se hizo clic en una celda |
| `sort-change` | `onSortChange` | `{ sorts: SortEntry[] }` | El modelo de ordenamiento cambio |
| `filter-change` | `onFilterChange` | `{ filters: FilterRule[] }` | El modelo de filtros cambio |
| `page-change` | `onPageChange` | `{ page: number, pageSize: number }` | La pagina o tamano de pagina cambio |
| `selection-change` | `onSelectionChange` | `{ selectedRows: GridRow[] }` | La seleccion de filas cambio |
| `column-resize` | -- | `{ field: string, width: number }` | Se redimensiono una columna |
| `column-reorder` | -- | `{ fields: string[] }` | Se reordenaron las columnas |
| `row-expand` | -- | `{ row: GridRow, expanded: boolean }` | Se expandio/colapso una fila de detalle |

```js
// Vanilla JS
document.querySelector('zentto-grid').addEventListener('row-click', (e) => {
  console.log('Clicked row:', e.detail.row);
});

// React
<ZenttoDataGrid onRowClick={(e) => console.log(e.detail.row)} />
```

---

## Paquetes

Este es un monorepo gestionado con [Turborepo](https://turbo.build/):

| Paquete | npm | Descripcion |
|---|---|---|
| [`@zentto/datagrid-core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-core.svg)](https://www.npmjs.com/package/@zentto/datagrid-core) | Motor de logica pura -- ordenar, filtrar, agrupar, pivotear, agregar, exportar. **Sin dependencias de UI.** Usalo para construir tu propia UI de grid o ejecutar del lado del servidor. |
| [`@zentto/datagrid`](./packages/web-component) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid.svg)](https://www.npmjs.com/package/@zentto/datagrid) | Web component `<zentto-grid>` construido con [Lit](https://lit.dev/). Listo para usar en cualquier pagina HTML. |
| [`@zentto/datagrid-react`](./packages/react) | [![npm](https://img.shields.io/npm/v/@zentto/datagrid-react.svg)](https://www.npmjs.com/package/@zentto/datagrid-react) | Wrapper para React via `@lit/react`. Provee `<ZenttoDataGrid>` con props tipadas y manejadores de eventos. |

### Arquitectura

```
@zentto/datagrid-core          Funciones puras (ordenar, filtrar, agrupar, pivotear, exportar)
        |
@zentto/datagrid               Web component (<zentto-grid>) — usa Lit para el renderizado
        |
@zentto/datagrid-react         Wrapper para React — createComponent() de @lit/react
```

El paquete core no tiene **ninguna dependencia** y se puede usar de forma independiente para procesamiento de datos headless, testing o renderizado del lado del servidor.

---

## Desarrollo

### Prerrequisitos

- Node.js >= 20
- npm >= 10

### Configuracion

```bash
git clone https://github.com/zentto-erp/zentto-datagrid.git
cd zentto-datagrid
npm install
```

### Compilar

```bash
npm run build          # Compila todos los paquetes (via Turborepo)
```

### Modo de Desarrollo

```bash
npm run dev            # Modo watch para todos los paquetes
```

### Tests

```bash
npm run test           # Ejecuta todos los tests (Vitest)
```

### Limpiar

```bash
npm run clean          # Elimina todas las carpetas dist/
```

### Estructura del Proyecto

```
zentto-datagrid/
  packages/
    core/              # @zentto/datagrid-core — logica pura, sin dependencias
      src/
        types.ts       # Todos los tipos publicos (ColumnDef, GridOptions, etc.)
        data/          # sort, filter, aggregate, group, pivot, paginate
        export/        # csv, json, excel, markdown
        search/        # busqueda dentro del grid
        selection/     # utilidades de portapapeles
        layout/        # persistencia (guardar/cargar en localStorage)
    web-component/     # @zentto/datagrid — elemento Lit <zentto-grid>
      src/
        zentto-grid.ts # Web component principal
        styles/        # Estilos CSS-in-JS con CSS custom properties
    react/             # @zentto/datagrid-react — wrapper para React
      src/
        index.ts       # createComponent + tipos re-exportados
```

---

## Hoja de Ruta

- [ ] **Virtualizacion de filas** -- renderizar solo las filas visibles para datasets de 100K+
- [ ] **Edicion de celdas** -- edicion en linea con validacion y confirmar/cancelar
- [ ] **Columnas sparkline** -- graficos en linea (linea, barra, area)
- [ ] **Deshacer/Rehacer** -- pila de historial para ediciones
- [ ] **Datos en arbol** -- filas jerarquicas con expandir/colapsar
- [ ] **Menu de columna** -- desplegable por columna (ocultar, fijar, agrupar por)
- [ ] **Arrastrar y soltar filas** -- reordenar filas arrastrando
- [ ] **Wrapper para Vue** -- `@zentto/datagrid-vue`
- [ ] **Wrapper para Angular** -- `@zentto/datagrid-angular`
- [ ] **Operaciones del lado del servidor** -- adaptadores para backends REST/GraphQL
- [ ] **Accesibilidad** -- roles ARIA, navegacion por teclado, soporte para lectores de pantalla
- [ ] **Modo de impresion** -- hoja de estilos optimizada para impresion

---

## Contribuir

Las contribuciones son bienvenidas. Por favor sigue estas pautas:

1. Haz un **fork** del repositorio y crea una rama para tu funcionalidad.
2. **Instala** las dependencias: `npm install`
3. **Compila** todos los paquetes: `npm run build`
4. **Prueba** tus cambios: `npm run test`
5. **Envia** un pull request con una descripcion clara del cambio.

### Pautas

- Manten el paquete core libre de dependencias.
- Todas las funcionalidades nuevas deben incluir tests en el paquete `core`.
- Los cambios en el web component deben ser retrocompatibles.
- Sigue el estilo de codigo existente (TypeScript strict mode, convenciones de Lit).

---

## Licencia

[MIT](./LICENSE) -- libre para uso personal y comercial.

Construido con dedicacion por el equipo de [Zentto](https://zentto.net).
