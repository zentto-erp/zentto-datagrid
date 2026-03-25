[Read in English](README.md)

<p align="center">
  <img src="https://zentto.net/favicon.svg" width="64" alt="Zentto Logo" />
</p>

<h1 align="center">ZenttoDataGrid</h1>

<p align="center">
  <strong>El data grid gratuito y open-source con funcionalidades enterprise.</strong><br />
  100+ funcionalidades. Sin dependencia de framework. React, Vue, Angular o HTML vanilla.
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
  <a href="#api-de-propiedades-del-grid">API del Grid</a> |
  <a href="#eventos">Eventos</a> |
  <a href="docs/custom-styles.es.md">Guia de Estilos</a>
</p>

---

## Por que ZenttoDataGrid?

La mayoria de los data grids enterprise cobran cientos o miles de dolares por desarrollador al ano. ZenttoDataGrid incluye **todas las funcionalidades enterprise gratis**, como un web component estandar que funciona en React, Vue, Angular, Vanilla JS y .NET Blazor.

| Funcionalidad | ZenttoDataGrid | MUI X Premium | AG Grid Enterprise |
|---|:---:|:---:|:---:|
| **Precio** | **GRATIS (MIT)** | $600/dev/ano | $999/dev/ano |
| Ordenamiento multi-columna | Si | Si | Si |
| Filtros en cabecera + panel de filtros | Si | Si | Si |
| Agrupacion de filas + subtotales | Si | Premium | Enterprise |
| Tablas pivote | Si | Premium | Enterprise |
| Columnas fijas (pinning) | Si | Pro | Enterprise |
| Master-detail expandible | Si | Pro | Enterprise |
| Menu contextual completo | Si | No | Enterprise |
| Buscar y resaltar (Ctrl+F) | Si | No | Enterprise |
| Exportar (CSV, Excel, JSON, Markdown) | Si | Parcial | Enterprise |
| Multiseleccion checkbox + Shift | Si | Pro | Community |
| Drag & Drop entre grids | Si | No | Enterprise |
| Edicion inline CRUD con API | Si | Community | Community |
| Formulas tipo Excel | Si | No | No |
| Importar CSV/JSON | Si | No | No |
| Columna de acciones configurable | Si | No | No |
| Menu de columna (3 puntitos) | Si | Pro | Enterprise |
| 7 plantillas de celda (avatar, chip, flag...) | Si | No | No |
| Motor de formulas (SUM, IF, ROUND) | Si | No | No |
| Virtual scroll (100K+ filas) | Si | Si | Si |
| Sparklines (mini graficos en celdas) | Si | No | Si |
| Deshacer/Rehacer (Ctrl+Z/Y) | Si | No | Si |
| Seleccion de rango tipo Excel | Si | No | Si |
| Pegar desde Excel (Ctrl+V) | Si | No | Si |
| Accesibilidad ARIA + teclado | Si | Si | Si |
| Wrapper Vue 3 | Si | No | No |
| Wrapper Angular 17+ | Si | No | Si |
| Shadow DOM (estilos aislados) | Si | No | No |
| Tamano del bundle (gzipped) | ~18 KB | ~200 KB | ~300 KB |

---

## Funcionalidades

### Procesamiento de Datos
- Ordenamiento multi-columna (ascendente, descendente, limpiar)
- Filtrado del lado del cliente con 14 operadores (`contains`, `equals`, `gt`, `between`, `inList`, etc.)
- Filtros en cabecera con parseo inteligente para columnas numericas (`>100`, `<=50`)
- Busqueda de texto completo (Ctrl+F) con resaltado y navegacion
- Paginacion del lado del cliente con tamanos configurables
- Modo de paginacion del lado del servidor

### Toolbar Rica (integrada al grid)
- Selector de columnas (mostrar/ocultar columnas)
- Selector de densidad (compacto/normal/amplio)
- Menu de exportacion (CSV, Excel, JSON, Markdown)
- Boton de filtros con badge de filtros activos
- Portapapeles y busqueda
- Indicador de filas seleccionadas

### Panel de Filtros Declarativo
- Definir filtros desde React/Vue/Angular como props
- Opciones auto-generadas desde los datos
- Tipos: `select`, `multi-select`, `range`, `text`, `date-range`
- Badge de filtros activos + boton "Limpiar todo"

### Menu de Columna (3 puntitos en cabecera)
- Ordenar ascendente/descendente
- Filtrar (activa el filtro de esa columna)
- Ocultar columna
- Administrar columnas (abre el selector)
- Activar/desactivar via `enable-header-menu`

### Menu Contextual (clic derecho en celda)
- Copiar valor de celda
- Copiar fila completa
- Fijar columna a la izquierda/derecha
- Desfijar columna
- Filtrar por este valor
- Exportar datos visibles

### Agrupacion y Agregacion
- Agrupacion de filas con grupos colapsables
- Subtotales por grupo (sum, avg, count, min, max)
- Ordenamiento de grupos
- Tablas pivote interactivas
- Fila de totales con agregacion por columna

### Funcionalidades de Columnas
- Columnas fijas (sticky izquierda/derecha)
- Redimensionamiento por arrastre
- Grupos de columnas (cabeceras multi-nivel)
- Ocultamiento responsivo (`mobileHide`, `tabletHide`)

### Plantillas de Celda Enriquecidas
- **Chips de estado** -- insignias con colores (filled/outlined)
- **Avatar** -- imagen + nombre + subtitulo
- **Barras de progreso** -- visualizacion porcentual
- **Estrellas** -- puntuacion con estrellas
- **Banderas** -- emoji flags desde codigo ISO
- **Enlaces** -- URLs clicables
- **Imagenes** -- miniaturas inline
- **Moneda** -- formato ISO 4217 adaptado al locale
- **Renderizador personalizado** -- `renderCell(value, row)` retorna HTML

### Seleccion de Filas y Clipboard
- Checkbox con multiseleccion
- Select All en cabecera
- Shift+Click para seleccion de rango
- **Seleccion de rango tipo Excel** (click+arrastrar, Shift+Flechas) `NUEVO v0.2`
- **Copiar rango seleccionado** (Ctrl+C) `NUEVO v0.2`
- **Pegar desde Excel / Google Sheets** (Ctrl+V) `NUEVO v0.2`
- Getter publico `selectedRows`
- Evento `selection-change`

### Drag & Drop
- Handle de arrastre por fila
- Arrastrar filas seleccionadas entre grids
- `drag-drop-group` para escenarios multi-grid
- Eventos `drag-start` y `drag-drop`

### Columna de Acciones
- Botones configurables via `actionButtons` prop
- Iconos, etiquetas, colores por boton
- Fija al borde derecho (sticky)
- Evento `action-click`

### Edicion Inline y CRUD
- Doble clic para editar cualquier celda
- Enter para confirmar, Escape para cancelar, Tab para siguiente
- `crudConfig` con endpoint API para CRUD automatico
- Rollback automatico si la API falla
- Metodos publicos `addRow()` y `deleteSelected()`
- Crear/Actualizar/Eliminar contra API REST

### Importar Archivos
- Importar desde CSV y JSON
- Si `crudConfig` esta definido, POSTea cada fila al API
- Eventos `import-complete` e `import-error`

### Motor de Formulas (tipo Excel)
- Formulas: `=SUM({campo})`, `=AVG({campo})`, `=MIN/MAX/COUNT`
- Aritmetica por fila: `={precio} * {cantidad}`
- `=ROUND({total}/1.16, 2)`
- `=IF({stock} > 100, "Alto", "Bajo")`
- Se definen declarativamente como props

### Virtual Scroll `NUEVO v0.2`
- Renderiza solo las filas visibles para datasets de 100K+ sin lag
- Overscan configurable (filas extra arriba/abajo del viewport)
- Activar con `enable-virtual-scroll`

### Sparklines `NUEVO v0.2`
- Mini graficos SVG dentro de las celdas del grid
- Tres tipos: `line`, `bar`, `area`
- Color configurable, detecta tendencia automaticamente (sube/baja/plano)
- Se define por columna: `{ sparkline: 'line', sparklineField: 'historial' }`

### Deshacer/Rehacer `NUEVO v0.2`
- Historial completo de ediciones con Ctrl+Z (deshacer) y Ctrl+Y (rehacer)
- Registra ediciones de celda, agregar/eliminar filas y pegar
- Botones en toolbar con `enable-undo-redo`
- Stack configurable (por defecto 200 acciones)

### Seleccion de Rango tipo Excel `NUEVO v0.2`
- Click+arrastrar para seleccionar un rango de celdas
- Shift+Flechas para extender la seleccion
- Ctrl+C copia el rango como texto tabulado
- Evento `range-select` con coordenadas
- Activar con `enable-range-selection`

### Pegar desde Excel `NUEVO v0.2`
- Ctrl+V pega datos tabulados desde Excel, Google Sheets o cualquier hoja de calculo
- Auto-convierte tipos numericos y booleanos segun la definicion de columna
- Se integra con deshacer/rehacer (el pegado se puede deshacer)
- Activar con `enable-paste`

### Accesibilidad `NUEVO v0.2`
- Roles ARIA: `grid`, `row`, `gridcell`, `columnheader`, `rowgroup`
- `aria-sort` en columnas ordenables (ascending/descending/none)
- `aria-selected` en celdas activas y filas seleccionadas
- `aria-rowindex` y `aria-colindex` para navegacion con lector de pantalla
- Navegacion completa por teclado (Flechas, Tab, Enter, F2, Escape)
- Outlines focus-visible en todos los elementos interactivos

### Master-Detail
- Filas expandibles con renderizador personalizado
- Evento `row-expand` para carga diferida

### Exportacion
- CSV, Excel, JSON, Markdown
- Nombre de archivo configurable

### Apariencia y Temas
- Tres temas: `light`, `dark`, `zentto`
- 20+ CSS custom properties
- Tres densidades: `compact`, `standard`, `comfortable`
- Estado de carga con spinner
- **Shadow DOM** -- los estilos del grid estan completamente aislados. Ningun framework externo (MUI, Tailwind, Bootstrap) puede interferir.

### Internacionalizacion
- Locales: `es` (espanol), `en` (ingles), `pt` (portugues)
- Todos los textos del grid (toolbar, menus, footer) se adaptan al `locale`
- Formato de numeros y fechas adaptado

### Persistencia de Layout
- Guardar/restaurar anchos, orden y filtros
- `gridId` para paginas con multiples grids

---

## Inicio Rapido

### Vanilla JS / CDN

```html
<script type="module">
  import 'https://unpkg.com/@zentto/datagrid@latest/dist/zentto-grid.js';
</script>

<zentto-grid
  columns='[{"field":"nombre","header":"Nombre","sortable":true},{"field":"precio","header":"Precio","type":"number","currency":"USD","aggregation":"sum"}]'
  rows='[{"nombre":"Widget","precio":9.99},{"nombre":"Gadget","precio":24.50}]'
  show-totals
  enable-toolbar
  enable-context-menu
  locale="es"
></zentto-grid>
```

### npm

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

const columns = [
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'precio', header: 'Precio', type: 'number', currency: 'USD', aggregation: 'sum' },
];

export default function App() {
  return (
    <ZenttoDataGrid
      columns={columns}
      rows={data}
      showTotals
      enableToolbar
      enableContextMenu
      locale="es"
      onRowClick={(e) => console.log('Clic:', e.detail.row)}
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
  <ZenttoDataGrid :columns="columns" :rows="rows" show-totals locale="es" @row-click="onRowClick" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ZenttoDataGrid } from '@zentto/datagrid-vue';
import type { ColumnDef } from '@zentto/datagrid-vue';

const columns: ColumnDef[] = [
  { field: 'nombre', header: 'Nombre', sortable: true },
  { field: 'precio', header: 'Precio', type: 'number', currency: 'USD' },
];
const rows = ref([{ nombre: 'Widget', precio: 9.99 }]);
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
      locale="es"
      (rowClick)="onRowClick($event)">
    </zentto-data-grid>
  `
})
export class ProductosComponent { ... }
```

> `<zentto-grid>` es un web component estandar. Tambien funciona en **Svelte**, **Solid** y **.NET Blazor** sin wrapper.

---

## Ejemplos de Uso

### Tabla Basica

```html
<zentto-grid
  columns='[
    {"field":"id","header":"#","width":60,"sortable":true},
    {"field":"cliente","header":"Cliente","sortable":true},
    {"field":"email","header":"Email"},
    {"field":"total","header":"Total","type":"number","currency":"USD"}
  ]'
  rows='[
    {"id":1,"cliente":"Acme Corp","email":"info@acme.com","total":1250.00},
    {"id":2,"cliente":"Globex Inc","email":"info@globex.com","total":3400.75}
  ]'
  enable-toolbar
  locale="es"
></zentto-grid>
```

### Filtros en Cabecera + Totales + Portapapeles

```html
<zentto-grid
  .columns=${columns}
  .rows=${data}
  enable-header-filters
  show-totals
  totals-label="Gran Total"
  enable-clipboard
  enable-find
  enable-status-bar
  locale="es"
></zentto-grid>
```

> Los filtros soportan operadores inteligentes para columnas numericas: `>100`, `<=50`, `!=0`.

### Toolbar Rica con Selector de Columnas

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

La toolbar incluye: conteo de filas, toggle de filtros, portapapeles, busqueda, selector de columnas, selector de densidad y menu de exportacion.

### Panel de Filtros Declarativo (opciones auto-generadas)

```tsx
// React — los filtros se declaran como props, opciones auto-generadas
const gridRef = useRef(null);

useEffect(() => {
  const el = gridRef.current;
  el.filterPanel = [
    { field: 'categoria', type: 'select', label: 'Categoria' },
    { field: 'marca', type: 'select', label: 'Marca' },
    { field: 'precio', type: 'range', label: 'Precio' },
    { field: 'fecha', type: 'date-range', label: 'Fecha' },
    { field: 'nombre', type: 'text', label: 'Buscar', placeholder: 'Nombre del producto...' },
  ];
  el.enableFilterPanel = true;
}, []);

<zentto-grid ref={gridRef} locale="es" />
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" enable-filter-panel locale="es"></zentto-grid>
<script>
  document.getElementById('grid').filterPanel = [
    { field: 'estado', type: 'select', label: 'Estado' },
    { field: 'monto', type: 'range', label: 'Monto' },
  ];
</script>
```

### Menu de Columna (3 puntitos)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-header-menu
  locale="es"
></zentto-grid>
```

Pasa el mouse sobre la cabecera para ver el menu. Opciones: Ordenar Asc/Desc, Filtrar, Ocultar columna, Administrar columnas. Desactivar con `enable-header-menu="false"`.

### Seleccion de Filas con Checkbox

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  enable-row-selection
  locale="es"
></zentto-grid>
```

```js
// Acceder a las filas seleccionadas
const grid = document.querySelector('zentto-grid');
grid.addEventListener('selection-change', (e) => {
  console.log('Seleccionadas:', e.detail.selectedRows);
  console.log('Cantidad:', e.detail.count);
});

// O leer directamente
const seleccionadas = grid.selectedRows;
```

Soporta Shift+Click para seleccion de rango.

### Botones de Acciones (fijos a la derecha)

```tsx
// React
useEffect(() => {
  gridRef.current.actionButtons = [
    { icon: '\uD83D\uDC41', label: 'Ver', action: 'view' },
    { icon: '\u270F\uFE0F', label: 'Editar', action: 'edit', color: '#f59e0b' },
    { icon: '\uD83D\uDDD1\uFE0F', label: 'Eliminar', action: 'delete', color: '#dc2626' },
  ];
}, []);

// Escuchar acciones
gridRef.current.addEventListener('action-click', (e) => {
  const { action, row } = e.detail;
  if (action === 'view') abrirModal(row);
  if (action === 'edit') navegar(`/editar/${row.id}`);
  if (action === 'delete') confirmarEliminar(row.id);
});
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" locale="es"></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.actionButtons = [
    { icon: '\uD83D\uDC41', label: 'Ver', action: 'view' },
    { icon: '\u270F\uFE0F', label: 'Editar', action: 'edit', color: '#f59e0b' },
    { icon: '\uD83D\uDDD1\uFE0F', label: 'Eliminar', action: 'delete', color: '#dc2626' },
  ];
  grid.addEventListener('action-click', (e) => {
    alert(`Accion: ${e.detail.action} en fila ${e.detail.row.id}`);
  });
</script>
```

### Drag & Drop Entre Grids

```html
<!-- Grid origen -->
<zentto-grid id="disponibles"
  .columns=${columns}
  .rows=${itemsDisponibles}
  enable-row-selection
  enable-drag-drop
  drag-drop-group="items"
  locale="es"
></zentto-grid>

<!-- Grid destino -->
<zentto-grid id="seleccionados"
  .columns=${columns}
  .rows=${itemsSeleccionados}
  enable-row-selection
  enable-drag-drop
  drag-drop-group="items"
  locale="es"
></zentto-grid>

<script>
  document.getElementById('seleccionados').addEventListener('drag-drop', (e) => {
    const { rows, sourceGroup, targetGroup } = e.detail;
    console.log(`Se soltaron ${rows.length} filas de ${sourceGroup} a ${targetGroup}`);
  });
</script>
```

### Edicion Inline con CRUD API

```tsx
// React — CRUD completo contra API REST
useEffect(() => {
  const el = gridRef.current;
  el.enableEditing = true;
  el.enableRowSelection = true;
  el.crudConfig = {
    baseUrl: '/api/v1/productos',
    idField: 'id',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': '1',
    },
    editableFields: ['nombre', 'precio', 'stock', 'categoria'],
  };

  el.addEventListener('crud-update', (e) => {
    toast.success(`Actualizado: ${e.detail.field}`);
  });
  el.addEventListener('crud-error', (e) => {
    toast.error(`Error: ${e.detail.error.message}`);
  });
}, []);

// Agregar fila nueva
<button onClick={() => gridRef.current.addRow({ categoria: 'General' })}>
  + Agregar Producto
</button>

// Eliminar seleccionadas
<button onClick={() => gridRef.current.deleteSelected()}>
  Eliminar Seleccionadas
</button>
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" enable-editing enable-row-selection locale="es"></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.crudConfig = {
    baseUrl: 'https://api.ejemplo.com/items',
    idField: 'id',
    headers: { 'Authorization': 'Bearer token123' },
  };

  // Doble clic en cualquier celda para editar
  // Enter para guardar, Escape para cancelar
  // Los cambios se sincronizan automaticamente con la API

  grid.addRow({ nombre: 'Nuevo Item', precio: 0 });
  grid.deleteSelected();
</script>
```

### Importar desde CSV/JSON

```html
<zentto-grid id="grid"
  enable-editing
  locale="es"
  .crudConfig=${{ baseUrl: '/api/v1/items', idField: 'id' }}
></zentto-grid>
```

Cuando la edicion esta habilitada, la barra CRUD muestra un boton "Importar". Sube un archivo `.csv` o `.json`. El grid:
1. Parsea el archivo
2. Agrega las filas a los datos locales
3. Si `crudConfig` esta definido, hace POST de cada fila al API

### Motor de Formulas (tipo Excel)

```tsx
// React
useEffect(() => {
  gridRef.current.formulas = [
    // Por fila: calcular subtotal
    { field: 'subtotal', formula: '={precio} * {cantidad}' },
    // Por fila: impuesto
    { field: 'impuesto', formula: '=ROUND({subtotal} * 0.16, 2)' },
    // Por fila: total
    { field: 'total', formula: '={subtotal} + {impuesto}' },
    // Condicional
    { field: 'nivel', formula: '=IF({stock} > 100, "Alto", "Bajo")' },
  ];
}, []);
```

```html
<!-- Vanilla JS -->
<zentto-grid id="grid" locale="es"></zentto-grid>
<script>
  const grid = document.getElementById('grid');
  grid.formulas = [
    { field: 'margen', formula: '={precioVenta} - {precioCompra}' },
    { field: 'margenPct', formula: '=ROUND({margen} / {precioVenta} * 100, 1)' },
    { field: 'estado', formula: '=IF({stock} > 0, "Disponible", "Agotado")' },
  ];
</script>
```

**Funciones soportadas:**
- `SUM({campo})` -- suma de todas las filas
- `AVG({campo})` -- promedio
- `MIN({campo})`, `MAX({campo})`, `COUNT({campo})`
- `ROUND(expr, decimales)`
- `IF(condicion, valorSi, valorNo)`
- Aritmetica: `+`, `-`, `*`, `/` con referencias `{campo}`

### Master-Detail (Filas Expandibles)

```html
<zentto-grid
  .columns=${columns}
  .rows=${pedidos}
  enable-master-detail
  locale="es"
  .detailRenderer=${(row) => `
    <div style="padding: 16px;">
      <h4>Pedido #${row.id}</h4>
      <p>Enviar a: ${row.direccion}</p>
      <p>Items: ${row.cantidadItems}</p>
    </div>
  `}
></zentto-grid>
```

### Agrupacion de Filas con Subtotales

```html
<zentto-grid
  .columns=${[
    { field: 'departamento', header: 'Departamento', groupable: true },
    { field: 'empleado', header: 'Empleado', sortable: true },
    { field: 'salario', header: 'Salario', type: 'number', currency: 'USD', aggregation: 'sum' }
  ]}
  .rows=${empleados}
  enable-grouping
  group-field="departamento"
  group-subtotals
  group-sort="asc"
  locale="es"
></zentto-grid>
```

### Plantillas de Columna

**Chips de Estado:**
```js
{ field: 'estado', header: 'Estado',
  statusColors: { 'Activo': 'success', 'Pendiente': 'warning', 'Inactivo': 'error' },
  statusVariant: 'filled' }
```

**Avatar con Subtitulo:**
```js
{ field: 'nombre', header: 'Empleado',
  avatarField: 'fotoUrl', subtitleField: 'cargo', avatarVariant: 'circular' }
```

**Bandera de Pais:**
```js
{ field: 'pais', header: 'Pais', flagField: 'codigoPais' }  // 'VE', 'ES', 'CO'
```

**Barra de Progreso:**
```js
{ field: 'progreso', header: 'Avance', progressMax: 100 }
```

**Estrellas:**
```js
{ field: 'rating', header: 'Calificacion', ratingMax: 5 }
```

**Enlace:**
```js
{ field: 'sitio', header: 'Web', linkField: 'url', linkTarget: '_blank' }
```

### Columnas Fijas (Pinning)

```html
<zentto-grid
  .columns=${columns}
  .rows=${rows}
  .pinnedColumns=${{ left: ['id', 'nombre'], right: ['acciones'] }}
  locale="es"
></zentto-grid>
```

### Temas con CSS Custom Properties

```css
zentto-grid {
  --zg-font-family: 'IBM Plex Sans', sans-serif;
  --zg-primary: #6366f1;
  --zg-header-bg: #f1f5f9;
  --zg-row-alt-bg: #f8fafc;
  --zg-row-hover-bg: #e0f2fe;
}
```

**Temas integrados:** `light` (por defecto), `dark`, `zentto` (acento ambar).

> **Shadow DOM**: los estilos estan completamente encapsulados. Ni MUI, ni Tailwind, ni Bootstrap pueden interferir con el grid. Solo las CSS custom properties `--zg-*` penetran el Shadow DOM (es intencional).

### Ejemplo Vue

```html
<template>
  <zentto-grid ref="grid" locale="es" enable-toolbar enable-header-menu
    enable-row-selection enable-context-menu height="600px" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@zentto/datagrid';

const grid = ref(null);

onMounted(() => {
  grid.value.columns = [
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'precio', header: 'Precio', type: 'number', currency: 'VES' },
  ];
  grid.value.rows = [...];
  grid.value.actionButtons = [
    { icon: '\uD83D\uDC41', label: 'Ver', action: 'view' },
  ];
});
</script>
```

### Ejemplo Angular

```typescript
import '@zentto/datagrid';

@Component({
  template: `<zentto-grid #grid locale="es" enable-toolbar enable-row-selection height="500px" />`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('grid') grid!: ElementRef;

  ngAfterViewInit() {
    const el = this.grid.nativeElement;
    el.columns = [...];
    el.rows = this.data;
    el.actionButtons = [{ icon: '\u270F\uFE0F', label: 'Editar', action: 'edit' }];
    el.addEventListener('action-click', (e: any) => this.onAccion(e.detail));
  }
}
```

### Ejemplo .NET Blazor

```razor
<zentto-grid @ref="grid" locale="es" enable-toolbar enable-editing height="600px" />

@code {
    private ElementReference grid;

    protected override async Task OnAfterRenderAsync(bool firstRender) {
        if (firstRender)
            await JS.InvokeVoidAsync("setupGrid", grid);
    }
}
```

```html
<script>
  window.setupGrid = (el) => {
    el.columns = [...];
    el.rows = [...];
    el.crudConfig = { baseUrl: '/api/items', idField: 'id' };
  };
</script>
```

---

## API de Propiedades del Grid

Todas las propiedades se pueden establecer como atributos HTML (kebab-case) o propiedades JavaScript (camelCase).

| Atributo | Propiedad | Tipo | Por defecto | Descripcion |
|---|---|---|---|---|
| `columns` | `columns` | `ColumnDef[]` | `[]` | Definiciones de columnas |
| `rows` | `rows` | `GridRow[]` | `[]` | Datos de las filas |
| `theme` | `theme` | `'light' \| 'dark' \| 'zentto'` | `'light'` | Tema de color |
| `locale` | `locale` | `'es' \| 'en' \| 'pt'` | `'es'` | Idioma del grid |
| `density` | `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Densidad de filas |
| `height` | `height` | `string` | `'500px'` | Altura del grid |
| `loading` | `loading` | `boolean` | `false` | Estado de carga |
| `show-totals` | `showTotals` | `boolean` | `false` | Fila de totales |
| `totals-label` | `totalsLabel` | `string` | `'Totales'` | Etiqueta de totales |
| `default-currency` | `defaultCurrency` | `string` | `'USD'` | Moneda por defecto |
| `enable-toolbar` | `enableToolbar` | `boolean` | `true` | Toolbar rica |
| `enable-header-menu` | `enableHeaderMenu` | `boolean` | `true` | Menu de 3 puntitos en cabecera |
| `enable-clipboard` | `enableClipboard` | `boolean` | `false` | Boton copiar |
| `enable-find` | `enableFind` | `boolean` | `false` | Busqueda Ctrl+F |
| `enable-header-filters` | `enableHeaderFilters` | `boolean` | `false` | Filtros en cabecera |
| `enable-status-bar` | `enableStatusBar` | `boolean` | `false` | Barra de estado |
| `enable-context-menu` | `enableContextMenu` | `boolean` | `false` | Menu contextual (clic derecho) |
| `enable-filter-panel` | `enableFilterPanel` | `boolean` | `false` | Panel de filtros declarativo |
| -- | `filterPanel` | `FilterPanelField[]` | `[]` | Definiciones de filtros |
| `enable-master-detail` | `enableMasterDetail` | `boolean` | `false` | Filas expandibles |
| -- | `detailRenderer` | `(row) => string` | -- | Renderizador de detalle |
| `enable-grouping` | `enableGrouping` | `boolean` | `false` | Agrupacion |
| `group-field` | `groupField` | `string` | `''` | Campo de agrupacion |
| `group-subtotals` | `groupSubtotals` | `boolean` | `false` | Subtotales por grupo |
| `enable-row-selection` | `enableRowSelection` | `boolean` | `false` | Multiseleccion checkbox |
| `enable-drag-drop` | `enableDragDrop` | `boolean` | `false` | Drag & Drop |
| `drag-drop-group` | `dragDropGroup` | `string` | `''` | Grupo de drag & drop |
| -- | `actionButtons` | `ActionButtonDef[]` | `[]` | Botones de acciones |
| `enable-editing` | `enableEditing` | `boolean` | `false` | Edicion inline |
| -- | `crudConfig` | `CrudConfig` | -- | Config de API CRUD |
| -- | `formulas` | `FormulaDefinition[]` | `[]` | Formulas tipo Excel |
| -- | `pinnedColumns` | `{ left?, right? }` | `{}` | Columnas fijas |
| -- | `columnGroups` | `ColumnGroup[]` | `[]` | Grupos de cabecera |
| `export-filename` | `exportFilename` | `string` | `'export'` | Nombre de archivo |
| `page-size-options` | `pageSizeOptions` | `number[]` | `[10,25,50,100]` | Opciones de paginacion |
| `enable-virtual-scroll` | `enableVirtualScroll` | `boolean` | `false` | Virtual scroll (100K+ filas) |
| `enable-undo-redo` | `enableUndoRedo` | `boolean` | `false` | Deshacer/Rehacer (Ctrl+Z/Y) |
| `enable-range-selection` | `enableRangeSelection` | `boolean` | `false` | Seleccion de rango tipo Excel |
| `enable-paste` | `enablePaste` | `boolean` | `false` | Pegar desde Excel (Ctrl+V) |

---

## Eventos

| Evento | Detail | Descripcion |
|---|---|---|
| `row-click` | `{ row, rowIndex }` | Clic en una fila |
| `sort-change` | `{ sorts }` | Cambio de ordenamiento |
| `filter-change` | `{ filters }` | Cambio de filtros |
| `page-change` | `{ page, pageSize }` | Cambio de pagina |
| `selection-change` | `{ selectedRows, count }` | Cambio de seleccion |
| `action-click` | `{ action, row }` | Clic en boton de accion |
| `header-menu-action` | `{ field, action }` | Accion del menu de cabecera |
| `column-visibility-change` | `{ hiddenColumns }` | Columna mostrada/ocultada |
| `filter-panel-change` | `{ field, value, allFilters }` | Cambio en panel de filtros |
| `drag-start` | `{ rows, group }` | Inicio de drag |
| `drag-drop` | `{ rows, sourceGroup, targetGroup }` | Drop de filas |
| `cell-edit` | `{ row, field, oldValue, newValue }` | Celda editada (sin CRUD) |
| `crud-update` | `{ row, field, oldValue, newValue }` | Update exitoso via API |
| `crud-create` | `{ row, success }` | Create exitoso via API |
| `crud-delete` | `{ rows, count }` | Delete exitoso via API |
| `crud-error` | `{ action, row, error }` | Error de CRUD |
| `row-expand` | `{ row, expanded }` | Fila expandida/colapsada |
| `column-resize` | `{ field, width }` | Columna redimensionada |
| `import-complete` | `{ rows, count }` | Importacion completada |
| `import-error` | `{ error }` | Error de importacion |
| `undo` | `{ action }` | Accion deshecha |
| `redo` | `{ action }` | Accion rehecha |
| `paste` | `{ changes, rows, cols }` | Datos pegados desde clipboard |
| `range-select` | `{ startRow, endRow, startCol, endCol }` | Rango de celdas seleccionado |

```js
// Vanilla JS
document.querySelector('zentto-grid').addEventListener('row-click', (e) => {
  console.log('Fila:', e.detail.row);
});

// React
<ZenttoDataGrid onRowClick={(e) => console.log(e.detail.row)} />
```

---

## Metodos Publicos

| Metodo | Descripcion |
|---|---|
| `addRow(defaults?)` | Agrega una fila nueva (inicia edicion automaticamente) |
| `deleteSelected()` | Elimina las filas seleccionadas (con API si esta configurado) |
| `saveNewRow(row)` | Guarda una fila nueva en la API |
| `selectedRows` (getter) | Retorna array de filas seleccionadas |
| `undo()` | Deshace la ultima edicion (requiere `enableUndoRedo`) |
| `redo()` | Rehace la ultima accion deshecha |

```js
const grid = document.querySelector('zentto-grid');
grid.addRow({ categoria: 'General' });
grid.deleteSelected();
console.log(grid.selectedRows);
```

---

## Paquetes

| Paquete | Descripcion |
|---|---|
| `@zentto/datagrid-core` | Motor de logica pura -- ordenar, filtrar, agrupar, pivotear, formulas, virtual scroll, undo/redo, sparklines. Sin dependencias. |
| `@zentto/datagrid` | Web component `<zentto-grid>` con Lit. Funciona en cualquier pagina HTML. |
| `@zentto/datagrid-react` | Wrapper React con props tipadas y eventos. |
| `@zentto/datagrid-vue` | Wrapper Vue 3 con props reactivas y eventos. |
| `@zentto/datagrid-angular` | Wrapper Angular 17+ standalone + NgModule. |

```
@zentto/datagrid-core          Funciones puras (sort, filter, group, pivot, formula, virtual scroll, undo/redo, sparklines)
        |
@zentto/datagrid               Web component (<zentto-grid>) — Lit + Shadow DOM
        |
   ┌────┼────┬────────┐
   |    |    |        |
 react  vue  angular  vanilla / svelte / blazor
```

---

## Hoja de Ruta

### v0.1 (completado)
- [x] Edicion inline CRUD
- [x] Menu de columna (3 puntitos)
- [x] Drag & Drop
- [x] Motor de formulas
- [x] Importar CSV/JSON/Excel
- [x] Multiseleccion checkbox
- [x] Columna de acciones

### v0.2 (completado)
- [x] Virtualizacion de filas (100K+ sin lag)
- [x] Sparklines (mini graficos line/bar/area)
- [x] Deshacer/Rehacer (Ctrl+Z/Y)
- [x] Seleccion de rango tipo Excel
- [x] Pegar desde Excel (Ctrl+V)
- [x] Wrapper Vue 3 -- `@zentto/datagrid-vue`
- [x] Wrapper Angular 17+ -- `@zentto/datagrid-angular`
- [x] Accesibilidad ARIA + teclado + lectores de pantalla

### Proximo
- [ ] Server-side virtual scroll con scroll infinito
- [ ] Exportar a PDF
- [ ] Temas personalizados (JSON theme builder)
- [ ] Column auto-size (doble clic en resize handle)
- [ ] Frozen rows (filas fijas arriba/abajo)

---

## Licencia

[MIT](./LICENSE) -- libre para uso personal y comercial.

Construido con dedicacion por el equipo de [Zentto](https://zentto.net).
