# @zentto/datagrid-vue

Vue 3 wrapper for the [ZenttoDataGrid](https://github.com/zentto-erp/zentto-datagrid) web component.

## Install

```bash
npm install @zentto/datagrid-vue @zentto/datagrid @zentto/datagrid-core
```

## Usage

```vue
<template>
  <ZenttoDataGrid
    :columns="columns"
    :rows="rows"
    show-totals
    enable-clipboard
    theme="light"
    @row-click="handleRowClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ZenttoDataGrid } from '@zentto/datagrid-vue';
import type { ColumnDef, GridRow } from '@zentto/datagrid-vue';

const columns = ref<ColumnDef[]>([
  { field: 'name', header: 'Name', sortable: true },
  { field: 'price', header: 'Price', type: 'number', currency: 'USD' },
]);

const rows = ref<GridRow[]>([
  { id: 1, name: 'Widget', price: 9.99 },
  { id: 2, name: 'Gadget', price: 24.99 },
]);

function handleRowClick(detail: any) {
  console.log('Row clicked:', detail.row);
}
</script>
```

## Props

All props from `<zentto-grid>` are available. See the [main README](https://github.com/zentto-erp/zentto-datagrid) for the full API reference.

## Events

All events are re-emitted as Vue events: `@row-click`, `@sort-change`, `@selection-change`, etc.

## License

MIT
