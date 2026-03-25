/**
 * Virtual scroll engine — calculates which rows to render for a given scroll position.
 * Pure math, no DOM dependency.
 */

export interface VirtualScrollConfig {
  totalRows: number;
  rowHeight: number;
  viewportHeight: number;
  overscan?: number; // extra rows to render above/below viewport (default 5)
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  totalHeight: number;
  offsetY: number; // translateY for the visible slice
}

export function calculateVirtualScroll(
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollResult {
  const { totalRows, rowHeight, viewportHeight, overscan = 5 } = config;
  const totalHeight = totalRows * rowHeight;
  const visibleCount = Math.ceil(viewportHeight / rowHeight);

  let startIndex = Math.floor(scrollTop / rowHeight) - overscan;
  startIndex = Math.max(0, startIndex);

  let endIndex = startIndex + visibleCount + overscan * 2;
  endIndex = Math.min(totalRows, endIndex);

  const offsetY = startIndex * rowHeight;

  return { startIndex, endIndex, visibleCount, totalHeight, offsetY };
}

/**
 * Dynamic row height virtual scroll (for grouped/expanded rows).
 * Uses a cumulative height map.
 */
export function calculateDynamicVirtualScroll(
  scrollTop: number,
  rowHeights: number[],
  viewportHeight: number,
  overscan = 5
): VirtualScrollResult {
  const totalRows = rowHeights.length;

  // Build cumulative heights
  let totalHeight = 0;
  const cumulative: number[] = [];
  for (let i = 0; i < totalRows; i++) {
    cumulative.push(totalHeight);
    totalHeight += rowHeights[i];
  }

  // Binary search for start index
  let lo = 0, hi = totalRows - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cumulative[mid] + rowHeights[mid] <= scrollTop) lo = mid + 1;
    else hi = mid;
  }

  let startIndex = Math.max(0, lo - overscan);

  // Find end index
  let endIndex = startIndex;
  let accHeight = cumulative[startIndex] || 0;
  while (endIndex < totalRows && accHeight < scrollTop + viewportHeight) {
    accHeight += rowHeights[endIndex];
    endIndex++;
  }
  endIndex = Math.min(totalRows, endIndex + overscan);

  const offsetY = cumulative[startIndex] || 0;
  const visibleCount = endIndex - startIndex;

  return { startIndex, endIndex, visibleCount, totalHeight, offsetY };
}
