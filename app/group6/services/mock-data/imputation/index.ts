import { ImputationResult } from '../../imputation/imputation.types';

/**
 * @description Calculates realistic speed based on time of day and other factors
 * @returns Simulated speed value
 * @example
 * ```ts
 * const speed = calculateRealisticSpeed(1705276800, 'E002', true, 2.3);
 * // speed = 28.5 (example output)
 * ```
 */
function calculateRealisticSpeed(
  timestamp: number,
  roadId: string,
  isImputed: boolean,
  modelError: number
): number {
  const date = new Date(timestamp * 1000);
  const hour = date.getUTCHours();
  const dayOfWeek = date.getUTCDay();

  let baseSpeed = 45;

  if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
    baseSpeed = 25 + Math.random() * 10;
  } else if (hour >= 23 || hour < 6) {
    baseSpeed = 50 + Math.random() * 10;
  } else {
    baseSpeed = 35 + Math.random() * 15;
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseSpeed += 5;
  }

  const roadIndex = parseInt(roadId.replace('E', '')) || 1;
  baseSpeed += (roadIndex - 3) * 2;

  const noise = (Math.random() - 0.5) * 8;
  let finalSpeed = baseSpeed + noise;

  if (isImputed) {
    const error = (Math.random() - 0.5) * modelError * 2;
    finalSpeed += error;
  }

  return Math.max(15, Math.min(65, finalSpeed));
}

/**
 * @description Generates imputation results for a given model, road, and time interval
 * @param modelId - Model ID to simulate results for
 * @param roadId - Road segment ID
 * @param startTime - Start time (UNIX timestamp)
 * @param endTime - End time (UNIX timestamp)
 * @returns ImputationResult object with realistic speed patterns and missing data
 * @example
 * ```ts
 * const results = getMockImputationResults(
 *   'model-gat-config-a',
 *   'E002',
 *   1705276800, // Jan 15, 2024 00:00:00 UTC
 *   1705881540  // Jan 22, 2024 23:45:00 UTC
 * );
 * ```
 */
export function getMockImputationResults(
  modelId: string,
  roadId: string,
  startTime: number,
  endTime: number
): ImputationResult {
  const intervalSeconds = 15 * 60;
  const numPoints = Math.floor((endTime - startTime) / intervalSeconds) + 1;

  // Model-specific error characteristics
  const modelError = modelId.includes('gat') ? 2.3 : 2.8;

  // Generate realistic missing data patterns (20% missing rate)
  const missingPattern: boolean[] = Array.from({ length: numPoints }, (_, i) => {
    // Create occasional gaps of 3-8 consecutive missing points
    if (i > 0 && Math.random() < 0.03) {
      const gapLength = Math.floor(Math.random() * 6) + 3;
      return i % gapLength !== 0;
    }
    // Random 15% missing data rate
    return Math.random() < 0.15;
  });

  return {
    road_id: roadId,
    model_id: modelId,

    // Timestamps (UNIX seconds)
    tms: Array.from({ length: numPoints }, (_, i) =>
      startTime + i * intervalSeconds
    ),

    // Observed values (null when data is missing)
    values: Array.from({ length: numPoints }, (_, i) => {
      if (missingPattern[i]) {
        return null; // Missing data point
      }
      const timestamp = startTime + i * intervalSeconds;
      return calculateRealisticSpeed(timestamp, roadId, false, modelError);
    }),

    // Imputed values (model predictions for ALL points, including missing ones)
    imputed: Array.from({ length: numPoints }, (_, i) => {
      const timestamp = startTime + i * intervalSeconds;
      // Model makes predictions with some error
      return calculateRealisticSpeed(timestamp, roadId, true, modelError);
    })
  };
}
