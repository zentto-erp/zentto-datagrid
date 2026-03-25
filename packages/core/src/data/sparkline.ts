/**
 * Sparkline data processing — computes SVG path data for mini-charts in grid cells.
 */

export type SparklineType = 'line' | 'bar' | 'area';

export interface SparklineConfig {
  type?: SparklineType;
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  lineWidth?: number;
  showMin?: boolean;
  showMax?: boolean;
  showLast?: boolean;
}

export interface SparklineData {
  values: number[];
  min: number;
  max: number;
  range: number;
  last: number;
  trend: 'up' | 'down' | 'flat';
}

export function processSparklineData(values: unknown[]): SparklineData {
  const nums = values
    .map(v => typeof v === 'number' ? v : parseFloat(String(v)))
    .filter(n => !isNaN(n));

  if (nums.length === 0) {
    return { values: [], min: 0, max: 0, range: 0, last: 0, trend: 'flat' };
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const last = nums[nums.length - 1];
  const first = nums[0];
  const trend = last > first + range * 0.02 ? 'up' : last < first - range * 0.02 ? 'down' : 'flat';

  return { values: nums, min, max, range, last, trend };
}

/**
 * Generate SVG path for a line sparkline.
 */
export function sparklineLinePath(
  data: SparklineData,
  width: number,
  height: number,
  padding = 2
): string {
  const { values, min, range } = data;
  if (values.length < 2) return '';

  const w = width - padding * 2;
  const h = height - padding * 2;
  const step = w / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * step;
    const y = padding + h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M${points.join('L')}`;
}

/**
 * Generate SVG path for an area sparkline (line + filled area below).
 */
export function sparklineAreaPath(
  data: SparklineData,
  width: number,
  height: number,
  padding = 2
): { linePath: string; areaPath: string } {
  const linePath = sparklineLinePath(data, width, height, padding);
  if (!linePath) return { linePath: '', areaPath: '' };

  const w = width - padding * 2;
  const h = height - padding * 2;
  const bottomY = padding + h;
  const startX = padding;
  const endX = padding + w;

  const areaPath = `${linePath}L${endX.toFixed(1)},${bottomY.toFixed(1)}L${startX.toFixed(1)},${bottomY.toFixed(1)}Z`;

  return { linePath, areaPath };
}

/**
 * Generate SVG rectangles for a bar sparkline.
 * Returns array of { x, y, width, height, isNegative }.
 */
export function sparklineBars(
  data: SparklineData,
  width: number,
  height: number,
  padding = 2,
  gap = 1
): Array<{ x: number; y: number; w: number; h: number; isNegative: boolean; isMax: boolean; isMin: boolean }> {
  const { values, min, max, range } = data;
  if (values.length === 0) return [];

  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const barWidth = Math.max(1, (availW - gap * (values.length - 1)) / values.length);

  const hasNegative = min < 0;
  const zeroY = hasNegative ? padding + (max / range) * availH : padding + availH;

  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  return values.map((v, i) => {
    const x = padding + i * (barWidth + gap);
    const barH = Math.max(1, (Math.abs(v) / range) * availH);
    const y = v >= 0 ? zeroY - barH : zeroY;

    return {
      x,
      y,
      w: barWidth,
      h: barH,
      isNegative: v < 0,
      isMax: v === maxVal,
      isMin: v === minVal,
    };
  });
}
