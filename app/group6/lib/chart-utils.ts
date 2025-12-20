import { ImputationResult } from '../services/imputation';

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
  errorColor?: string;
  isMissing: boolean;
}

/**
 * Transform API response (array of individual data points) to Recharts format
 *
 * The backend returns an array where each point has:
 * - tms: Unix timestamp
 * - value: speed value (or null)
 * - imputed: boolean (true = predicted, false = observed)
 *
 * We need to group by timestamp and separate observed vs imputed values
 */
export function transformImputationData(
  results: ImputationResult[]
): ChartDataPoint[] {
  // Group by timestamp
  const groupedByTime = new Map<number, { observed: number | null; imputed: number | null }>();

  results.forEach((result) => {
    const existing = groupedByTime.get(result.tms) || { observed: null, imputed: null };

    if (result.imputed) {
      // This is an imputed (predicted) value
      existing.imputed = result.value;
    } else {
      // This is an observed (actual) value
      existing.observed = result.value;
    }

    groupedByTime.set(result.tms, existing);
  });

  // Convert to ChartDataPoint array
  return Array.from(groupedByTime.entries())
    .sort((a, b) => a[0] - b[0]) // Sort by timestamp
    .map(([timestamp, { observed, imputed }]) => {
      const date = new Date(timestamp * 1000);
      const error = observed !== null && imputed !== null
        ? imputed - observed
        : null;

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
        isMissing: observed === null,
      };
    });
}

/**
 * Merge multiple model results for comparison
 * Takes arrays of results from different models and combines them by timestamp
 *
 * @param modelResults - Array of result arrays, one per model
 * @returns ChartDataPoint[] with observed and up to 3 imputed values per timestamp
 */
export function mergeMultipleModels(
  modelResults: ImputationResult[][]
): ChartDataPoint[] {
  if (modelResults.length === 0) return [];

  // Group all results by timestamp
  const groupedByTime = new Map<number, {
    observed: number | null;
    imputed: number | null;
    imputed2: number | null;
    imputed3: number | null;
  }>();

  // Process each model's results
  modelResults.forEach((results, modelIndex) => {
    results.forEach((result) => {
      const existing = groupedByTime.get(result.tms) || {
        observed: null,
        imputed: null,
        imputed2: null,
        imputed3: null,
      };

      if (result.imputed) {
        // This is an imputed value - assign to the appropriate model slot
        if (modelIndex === 0) {
          existing.imputed = result.value;
        } else if (modelIndex === 1) {
          existing.imputed2 = result.value;
        } else if (modelIndex === 2) {
          existing.imputed3 = result.value;
        }
      } else {
        // Observed values should be the same across models
        existing.observed = result.value;
      }

      groupedByTime.set(result.tms, existing);
    });
  });

  // Convert to ChartDataPoint array
  return Array.from(groupedByTime.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, values]) => {
      const date = new Date(timestamp * 1000);

      return {
        timestamp: date.toISOString(),
        timestampFormatted: date.toLocaleString('en-GB'),
        observed: values.observed,
        imputed: values.imputed,
        imputed2: values.imputed2 ?? undefined,
        imputed3: values.imputed3 ?? undefined,
        isMissing: values.observed === null,
      };
    });
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