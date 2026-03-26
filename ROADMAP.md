# ZenttoDataGrid — Roadmap v1.0

Plan de ejecucion para completar todas las features pendientes.
Priorizado por impacto + dependencias.

---

## Fase 1: Datos y Validacion (v0.4.0)
**Estimacion: 1 sesion**

### 1.1 Conditional Formatting
Reglas que cambian estilo de celda segun valor.
```ts
{ field: 'stock', conditionalFormat: [
  { condition: 'lt', value: 10, style: { color: '#dc2626', fontWeight: 'bold' } },
  { condition: 'between', value: [10, 50], style: { backgroundColor: '#fffbeb' } },
  { condition: 'gt', value: 100, style: { color: '#0d9668' } },
]}
```
Operadores: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `contains`, `isEmpty`, `isNotEmpty`.

### 1.2 Data Validation + Error Display
Validar al editar con feedback visual inline.
```ts
{ field: 'email', validation: { type: 'email', message: 'Email invalido' } }
{ field: 'stock', validation: { type: 'number', min: 0, max: 99999 } }
{ field: 'fecha', validation: { type: 'date', after: 'today' } }
{ field: 'codigo', validation: { type: 'regex', pattern: '^[A-Z]{3}-\\d{3}$' } }
{ field: 'nombre', validation: { required: true } }
```

### 1.3 Dropdown Cells (Data Validation)
Celda con select de opciones fijas — como Data Validation de Excel.
```ts
{ field: 'estado', dropdown: ['Activo', 'Inactivo', 'Pendiente'] }
{ field: 'pais', dropdown: { source: 'api', url: '/v1/config/countries' } }
```

### 1.4 Formula Columns (live recalculation)
Mejorar formulas existentes para que recalculen en vivo al editar.
```ts
{ field: 'margen', formula: '=({precioVenta}-{precioCompra})/{precioCompra}*100', type: 'percentage' }
{ field: 'iva', formula: '={subtotal}*0.16', type: 'number', currency: 'VES' }
{ field: 'total', formula: '={subtotal}+{iva}', type: 'number', currency: 'VES' }
```

---

## Fase 2: Estructura Avanzada (v0.5.0)
**Estimacion: 1 sesion**

### 2.1 Tree Data (jerarquico)
Datos padre-hijo con indent, expand/collapse, iconos de carpeta.
```ts
<zentto-grid enable-tree-data tree-id-field="id" tree-parent-field="parentId">
```
Casos: plan de cuentas, BOM, categorias, organigramas, carpetas.

### 2.2 Row Pinning (Top/Bottom)
Fijar filas especificas arriba o abajo de la tabla.
```ts
el.pinnedRows = { top: [row1, row2], bottom: [totalRow] };
```

### 2.3 Cell Merge (Colspan/Rowspan)
Combinar celdas para reportes y facturas.
```ts
{ field: 'seccion', merge: true } // Auto-merge celdas con mismo valor consecutivo
```

### 2.4 Collapsible Column Groups
Grupos de columnas que se expanden/colapsan.
```ts
el.columnGroups = [
  { groupId: 'precios', header: 'Precios', children: ['costo', 'precio', 'margen'], collapsible: true }
];
```

### 2.5 Frozen/Split Panes
Dividir la tabla en paneles con scroll independiente.
```ts
<zentto-grid freeze-rows="2" freeze-cols="3">
```

---

## Fase 3: Server-Side y Rendimiento (v0.6.0)
**Estimacion: 1 sesion**

### 3.1 Server-Side Mode completo
Delegar sort, filter, group, search al backend.
```ts
<zentto-grid
  pagination-mode="server"
  total-rows="15000"
  @sort-change=${(e) => fetchData({ sort: e.detail.sorts })}
  @filter-change=${(e) => fetchData({ filters: e.detail.filters })}
  @page-change=${(e) => fetchData({ page: e.detail.page })}
>
```

### 3.2 Infinite Scroll
Cargar mas filas al hacer scroll (lazy loading).
```ts
<zentto-grid enable-infinite-scroll @load-more=${loadNextPage}>
```

### 3.3 Batch Edit
Seleccionar rango → editar todas las celdas a la vez.
```ts
// Seleccionar rango, luego Ctrl+D (fill down) o escribir valor
```

### 3.4 Column Auto-Size
Doble click en el borde del header → auto-ajustar ancho al contenido.

---

## Fase 4: Visualizacion y Reportes (v0.7.0)
**Estimacion: 1 sesion**

### 4.1 Charts Integrados
Seleccionar rango → generar grafico embebido.
```ts
<zentto-grid enable-charts>
// Toolbar: boton Chart que abre selector (bar, line, pie, area, scatter)
// Se renderiza encima o al lado de la tabla
```
Tipos: Bar, Line, Pie, Area, Scatter, Donut.
Libreria: SVG propio (sin dependencias).

### 4.2 Print/PDF Layout
Boton de imprimir con layout optimizado para papel.
```ts
<zentto-grid enable-print>
// Toolbar: boton Print
// Headers repetidos en cada pagina
// Totales al final
// Orientacion auto (landscape si >5 columnas)
```

### 4.3 Column Summary Footer personalizable
No solo sum — poder configurar por columna.
```ts
{ field: 'precio', aggregation: 'avg', aggregationLabel: 'Promedio' }
{ field: 'stock', aggregation: 'count', aggregationLabel: 'Registros' }
{ field: 'fecha', aggregation: 'max', aggregationLabel: 'Mas reciente' }
```

### 4.4 Cell Comments/Notes
Click derecho → agregar nota. Triangulo naranja en la esquina.
```ts
el.cellNotes = { 'row1_stock': 'Pendiente verificar con almacen' };
```
Persistencia en IndexedDB o emitir evento para guardar en BD.

---

## Fase 5: Features Premium (v0.8.0)
**Estimacion: 1 sesion**

### 5.1 Audit Trail
Tracking de cambios: quien, cuando, que valor anterior.
```ts
<zentto-grid enable-audit>
// Celdas editadas muestran indicador visual
// Tooltip con historial: "Cambiado por Juan el 15/03 — Valor anterior: 100"
```

### 5.2 QR/Barcode en celda
```ts
{ field: 'codigo', barcode: 'qr' }     // QR code
{ field: 'sku', barcode: 'code128' }    // Barcode
```

### 5.3 Status Timeline
Mini timeline en la celda mostrando progresion de estados.
```ts
{ field: 'estado', timeline: true, timelineField: 'historialEstados' }
// historialEstados: [{ estado: 'Emitida', fecha: '...' }, { estado: 'Pagada', fecha: '...' }]
```

### 5.4 AI Column (generativa)
Columna que usa IA para clasificar, resumir o predecir.
```ts
{ field: 'aiSummary', ai: { prompt: 'Clasifica este producto en alta/media/baja prioridad', fields: ['stock', 'ventas30d', 'margen'] } }
```
Requiere API key de OpenAI/Anthropic configurada.

### 5.5 Real-time Collaboration
Multiples usuarios editando la misma tabla en tiempo real.
WebSocket connection, cursor sharing, conflict resolution.

---

## Fase 6: Polish y v1.0 (v1.0.0)
**Estimacion: 1 sesion**

### 6.1 Documentacion interactiva
Sitio web con playground (como AG Grid example page).
- Storybook o Astro docs
- Cada feature con demo en vivo
- Code sandbox embebido

### 6.2 Test Suite
- Unit tests con Vitest para core
- Component tests con Web Test Runner
- E2E tests con Playwright
- Coverage > 80%

### 6.3 CI/CD para npm
- GitHub Actions: test + build + publish on tag
- Semantic versioning automatico
- Changelog generado automaticamente

### 6.4 Performance Benchmarks
- Benchmark vs AG Grid, MUI X
- Publicar resultados en README
- Lighthouse scores

### 6.5 Accessibility Audit
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation audit

---

## Resumen de Versiones

| Version | Nombre | Features |
|---------|--------|----------|
| v0.3.x | **Current** | Multi-view, actions column, boolean, radio, color, percentage, create button |
| v0.4.0 | **Data & Validation** | Conditional formatting, validation, dropdowns, live formulas |
| v0.5.0 | **Structure** | Tree data, row pinning, cell merge, collapsible groups, freeze panes |
| v0.6.0 | **Server & Performance** | Server-side mode, infinite scroll, batch edit, auto-size |
| v0.7.0 | **Visualization** | Charts, print/PDF, custom summaries, cell comments |
| v0.8.0 | **Premium** | Audit trail, QR/barcode, status timeline, AI column, real-time collab |
| v1.0.0 | **Release** | Docs site, test suite, CI/CD, benchmarks, accessibility audit |

---

## Prioridad por demanda del ERP Zentto

1. **Conditional Formatting** — contabilidad, inventario (stock bajo)
2. **Tree Data** — plan de cuentas, BOM, categorias
3. **Dropdowns** — todos los modulos con CRUD
4. **Server-Side** — tablas grandes (articulos, asientos)
5. **Print/PDF** — reportes contables, fiscal
6. **Validation** — todos los formularios
7. **Charts** — dashboards, reportes
8. **Cell Comments** — auditoria, notas de trabajo
