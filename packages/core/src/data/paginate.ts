import type { GridRow, PaginationModel } from '../types';

export interface PaginationResult {
  rows: GridRow[];
  page: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

/**
 * Client-side pagination. Returns a slice of rows for the current page.
 */
export function paginateRows(rows: GridRow[], model: PaginationModel): PaginationResult {
  const { page, pageSize } = model;
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;

  return {
    rows: rows.slice(start, end),
    page,
    pageSize,
    totalRows,
    totalPages,
  };
}
