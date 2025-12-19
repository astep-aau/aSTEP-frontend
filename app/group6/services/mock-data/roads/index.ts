import { TimeInterval,RoadsResponse, Road } from '../../imputation/imputation.types';

/**
 * @description Defines which time intervals are available for each model. In integrated backend, this would come from database queries
 * @returns Array of TimeInterval objects
 */
const MODEL_TIME_INTERVALS: Record<string, TimeInterval[]> = {
  'model-gat-config-a': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) },
    { start_time: Math.floor(new Date('2024-01-08T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-14T23:45:00Z').getTime() / 1000) }
  ],
  'model-gat-config-b': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) },
    { start_time: Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-07T23:45:00Z').getTime() / 1000) }
  ],
  'model-gat-config-c': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) }
  ],
  'model-graphsage-config-a': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) },
    { start_time: Math.floor(new Date('2024-01-08T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-14T23:45:00Z').getTime() / 1000) }
  ],
  'model-graphsage-config-b': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) }
  ],
  'model-graphsage-config-c': [
    { start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000) },
    { start_time: Math.floor(new Date('2024-01-22T00:00:00Z').getTime() / 1000), end_time: Math.floor(new Date('2024-01-28T23:45:00Z').getTime() / 1000) }
  ]
};

/**
 * @description Defines which road segments are available for each model + time interval combination
 * Key format: "modelId|startTime|endTime"
 * @returns Array of road IDs
 */
const MODEL_INTERVAL_ROADS: Record<string, string[]> = {
  // Model GAT Config A
  'model-gat-config-a|1705276800|1705881540': ['E001', 'E002', 'E003', 'E004', 'E005'], // Jan 15-22
  'model-gat-config-a|1704672000|1705276740': ['E001', 'E002', 'E003'], // Jan 8-14

  // Model GAT Config B
  'model-gat-config-b|1705276800|1705881540': ['E001', 'E002', 'E003', 'E004'], // Jan 15-22
  'model-gat-config-b|1704067200|1704671940': ['E001', 'E002'], // Jan 1-7

  // Model GAT Config C
  'model-gat-config-c|1705276800|1705881540': ['E001', 'E002', 'E005'], // Jan 15-22

  // Model GraphSAGE Config A
  'model-graphsage-config-a|1705276800|1705881540': ['E001', 'E002', 'E003', 'E004', 'E005'], // Jan 15-22
  'model-graphsage-config-a|1704672000|1705276740': ['E001', 'E003', 'E004'], // Jan 8-14

  // Model GraphSAGE Config B
  'model-graphsage-config-b|1705276800|1705881540': ['E002', 'E003', 'E004', 'E005'], // Jan 15-22

  // Model GraphSAGE Config C
  'model-graphsage-config-c|1705276800|1705881540': ['E001', 'E003', 'E004'], // Jan 15-22
  'model-graphsage-config-c|1705881600|1706486340': ['E001', 'E002', 'E003', 'E005'] // Jan 22-28
};

/**
 * @description Helper function: Creates intersection key for model + time interval
 * @returns Key string
 * @example
 * ```ts
 * const key = createIntervalKey('model-gat-config-a', { start_time: 1705276800, end_time: 1705881540 });
 * // key = 'model-gat-config-a|1705276800|1705881540'
 * ```
 */
function createIntervalKey(modelId: string, interval: TimeInterval): string {
  return `${modelId}|${interval.start_time}|${interval.end_time}`;
}

/**
 * @description Helper function: Checks if two time intervals are equal
 * @returns Boolean indicating equality
 * @example
 * ```ts
 * const isEqual = intervalsEqual(
 *   { start_time: 1705276800, end_time: 1705881540 },
 *   { start_time: 1705276800, end_time: 1705881540 }
 * );
 * // isEqual = true
 * ```
 */
function intervalsEqual(a: TimeInterval, b: TimeInterval): boolean {
  return a.start_time === b.start_time && a.end_time === b.end_time;
}

/**
 * @description Helper function: Finds intersection of arrays
 * @returns Array of intersected items
 * @example
 * ```ts
 * const intersection = arrayIntersection([
 *   ['E001', 'E002', 'E003'],
 *   ['E002', 'E003', 'E004'],
 *   ['E003', 'E005']
 * ]);
 * // intersection = ['E003']
 * ```
 */
function arrayIntersection<T>(arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  return arrays.reduce((acc, curr) =>
    acc.filter(item => curr.includes(item))
  );
}

/**
 * @description Returns available time intervals for selected model(s)
 *
 * @param modelIds - Single model ID or array of model IDs
 * @returns Available time intervals. When multiple models selected, returns intersection. Used for cascading filters.
 *
 * @example
 * ```ts
 * // Single model
 * const intervals = getMockTimeInterval('model-gat-config-a');
 * // Returns all intervals for that model
 *
 * // Multiple models (comparison mode)
 * const intervals = getMockTimeInterval(['model-gat-config-a', 'model-graphsage-config-a']);
 * // Returns only intervals where BOTH models have data
 * ```
 */
export function getMockTimeInterval(modelIds?: string | string[]): TimeInterval[] {
  // If no model specified, return all unique intervals
  if (!modelIds) {
    const allIntervals = Object.values(MODEL_TIME_INTERVALS).flat();
    return allIntervals.filter((interval, index, self) =>
      index === self.findIndex(i => intervalsEqual(i, interval))
    );
  }

  // Convert to array if single model
  const modelIdArray = Array.isArray(modelIds) ? modelIds : [modelIds];

  // Get intervals for each model
  const intervalArrays = modelIdArray.map(id => MODEL_TIME_INTERVALS[id] || []);

  // Return intersection if multiple models
  if (modelIdArray.length > 1) {
    // Find intervals that exist in all selected models
    const firstIntervals = intervalArrays[0];
    return firstIntervals.filter(interval =>
      intervalArrays.every(intervals =>
        intervals.some(i => intervalsEqual(i, interval))
      )
    );
  }

  // Return intervals for single model
  return intervalArrays[0] || [];
}

/**
 * @description Returns a single TimeInterval representing the full available time range
 * This combines all intervals into one overall range
 * @returns Single TimeInterval with min start_time and max end_time
 */
export function getMockTimeIntervalSingle(): TimeInterval {
  const allIntervals = Object.values(MODEL_TIME_INTERVALS).flat();

  if (allIntervals.length === 0) {
    // Fallback to default week
    return {
      start_time: Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000),
      end_time: Math.floor(new Date('2024-01-22T23:45:00Z').getTime() / 1000)
    };
  }

  // Find earliest start and latest end across all intervals
  const startTimes = allIntervals.map(i => i.start_time);
  const endTimes = allIntervals.map(i => i.end_time);

  return {
    start_time: Math.min(...startTimes),
    end_time: Math.max(...endTimes)
  };
}

/**
 * @description Returns available road segments for selected model(s) and time interval
 *
 * @param modelIds - Single model ID or array of model IDs
 * @param timeInterval - Selected time interval
 * @returns Available road segments. When multiple models selected, returns intersection. Used for cascading filters.
 *
 * @example
 * ```ts
 * // Single model
 * const roads = getMockRoads('model-gat-config-a', { start_time: 1705276800, end_time: 1705881540 });
 * // Returns: { road_ids: ['E001', 'E002', 'E003', 'E004', 'E005'] }
 *
 * // Multiple models (comparison mode)
 * const roads = getMockRoads(
 *   ['model-gat-config-a', 'model-graphsage-config-b'],
 *   { start_time: 1705276800, end_time: 1705881540 }
 * );
 * // Returns only roads where BOTH models have data: { road_ids: ['E002', 'E003', 'E004'] }
 * ```
 */
/**
 * Map of road IDs to full road objects
 */
const ROAD_METADATA: Record<string, Road> = {
  'E001': { id: 'E001', name: 'Zhongyang Street', road_type: 'main_road' },
  'E002': { id: 'E002', name: 'Songhua River Bridge', road_type: 'highway' },
  'E003': { id: 'E003', name: 'Hongqi Street', road_type: 'main_road' },
  'E004': { id: 'E004', name: 'Dongdazhi Street', road_type: 'secondary_road' },
  'E005': { id: 'E005', name: 'Haxi Avenue', road_type: 'highway' },
};

/**
 * Convert road ID array to Road object array
 */
function roadIdsToRoads(roadIds: string[]): Road[] {
  return roadIds.map(id => ROAD_METADATA[id]).filter(Boolean);
}

export function getMockRoads(modelIds?: string | string[], timeInterval?: TimeInterval): RoadsResponse {
  // If no parameters, return all roads
  if (!modelIds || !timeInterval) {
    return {
      roads: roadIdsToRoads(['E001', 'E002', 'E003', 'E004', 'E005'])
    };
  }

  // Convert to array if single model
  const modelIdArray = Array.isArray(modelIds) ? modelIds : [modelIds];

  // Get roads for each model + interval combination
  const roadArrays = modelIdArray.map(modelId => {
    const key = createIntervalKey(modelId, timeInterval);
    return MODEL_INTERVAL_ROADS[key] || [];
  });

  // Return intersection if multiple models
  if (modelIdArray.length > 1) {
    return {
      roads: roadIdsToRoads(arrayIntersection(roadArrays))
    };
  }

  // Return roads for single model
  return {
    roads: roadIdsToRoads(roadArrays[0] || [])
  };
}
