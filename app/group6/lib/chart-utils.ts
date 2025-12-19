import { ImputationResult } from '../services/imputation';
import { getErrorColor } from './chart.config';

/**
 * Chart data point format for Recharts
 */
export interface ChartDataPoint {
  timestamp: string;
  timestampFormatted: string;
  observed: number | null;
  imputed: number | null;
  imputed2?: number | null;  // For Mode 2
  imputed3?: number | null;
  error?: number;            // For Mode 4
  errorColor?: string;
  isMissing: boolean;
}

/**
 * Transform API response to Recharts format
 */
export function transformImputationData(
  result: ImputationResult,
  modelId?: string
): ChartDataPoint[] {
  return result.tms.map((timestamp: number, index: number) => {
    const observed = result.values[index] ?? null;
    const imputed = (result.imputed[index] ?? null) as number | null;
    const error = observed !== null && imputed !== null
      ? imputed - observed
      : null;

    const date = new Date(timestamp * 1000);

    return {
      timestamp: date.toISOString(),
      timestampFormatted: date.toLocaleString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      observed,
      imputed,
      error: error ?? undefined,
      errorColor: error !== null ? getErrorColor(error) : undefined,
      isMissing: observed === null,
    };
  });
}

/**
 * Merge multiple model results for comparison
 */
export function mergeMultipleModels(
  results: ImputationResult[]
): ChartDataPoint[] {
  if (results.length === 0) return [];

  const baseResult = results[0];

  return baseResult.tms.map((timestamp: number, index: number) => {
    const date = new Date(timestamp * 1000);

    const dataPoint: ChartDataPoint = {
      timestamp: date.toISOString(),
      timestampFormatted: date.toLocaleString('en-GB'),
      observed: baseResult.values[index] ?? null,
      imputed: (baseResult.imputed[index] ?? null) as number | null,
      isMissing: baseResult.values[index] === null,
    };

    // Add additional model predictions
    if (results[1]) {
      dataPoint.imputed2 = results[1].imputed[index] ?? null;
    }
    if (results[2]) {
      dataPoint.imputed3 = results[2].imputed[index] ?? null;
    }

    return dataPoint;
  });
}

/**
 * Calculate error metrics (MAE, RMSE, R²)
 */
export function calculateErrorMetrics(data: ChartDataPoint[]) {
  const validPairs = data.filter(d => d.observed !== null && d.imputed !== null);

  if (validPairs.length === 0) {
    return { mae: 0, rmse: 0, r2: 0, count: 0 };
  }

  const errors = validPairs.map(d => Math.abs(d.imputed! - d.observed!));
  const squaredErrors = validPairs.map(d => Math.pow(d.imputed! - d.observed!, 2));

  const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
  const rmse = Math.sqrt(squaredErrors.reduce((sum, e) => sum + e, 0) / squaredErrors.length);

  // R² calculation
  const observedValues = validPairs.map(d => d.observed!);
  const mean = observedValues.reduce((sum, v) => sum + v, 0) / observedValues.length;
  const ssTot = observedValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
  const ssRes = squaredErrors.reduce((sum, e) => sum + e, 0);
  const r2 = 1 - (ssRes / ssTot);

  return { mae, rmse, r2, count: validPairs.length };
}

/**
 * Detect missing data ranges for gray shading
 */
export function getMissingDataRanges(data: ChartDataPoint[]): Array<{start: number, end: number}> {
  const ranges: Array<{start: number, end: number}> = [];
  let currentStart: number | null = null;

  data.forEach((point, index) => {
    if (point.isMissing) {
      if (currentStart === null) {
        currentStart = index;
      }
    } else {
      if (currentStart !== null) {
        ranges.push({ start: currentStart, end: index - 1 });
        currentStart = null;
      }
    }
  });

  // Close final range if needed
  if (currentStart !== null) {
    ranges.push({ start: currentStart, end: data.length - 1 });
  }

  return ranges;
}