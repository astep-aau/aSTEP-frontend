import { ModelType, ModelMetrics, ImputationResult, TimeInterval, Road, TimeRange } from './imputation.types';


/**
 * @description Fetches the available model types from the API.
 * @returns Promise<ModelType[]> - Array of ModelType objects
 */
export async function fetchModelTypes(): Promise<ModelType[]> {
  const response = await fetch('/api/imputation/model-types/');
  if (!response.ok) {
    throw new Error(`Error fetching model types: ${response.statusText}`);
  }
  return response.json();
}

/**
 * @description Fetches the model metrics for a given model type from the API.
 * @param {string} modelType - ID of the model type to fetch metrics for
 * @returns Promise<ModelMetrics[]> - Array of ModelMetrics objects
 */
export async function fetchModelMetrics(
  modelType: string
): Promise<ModelMetrics[]> {
  console.log(`[fetchModelMetrics] Requesting metrics for type: ${modelType}`);
  const response = await fetch(`/api/imputation/model-metric/${modelType}/`);

  if (!response.ok) {
    console.error(`[fetchModelMetrics] Error: ${response.status} ${response.statusText}`);
    throw new Error(`Error fetching model metrics: ${response.statusText}`);
  }

  const data: ModelMetrics[] = await response.json();

  return data;
}

export async function fetchRoadsByModel(modelId: string): Promise<Road[]> {
	console.log(`[fetchRoadsByModel] Requesting roads for model: ${modelId}`);
  const response = await fetch(`/api/imputation/impute-result/roads/${modelId}/`);

  if (!response.ok) {
		console.error(`[fetchRoadsByModel] Error: ${response.status} ${response.statusText}`)
    throw new Error(`Error fetching roads for model ${modelId}: ${response.statusText}`);
  }

	const data = await response.json();
	// API returns { roads: Road[] }, extract the roads array
	const roads: Road[] = data.roads || data;
	console.log(`[fetchRoadsByModel] Received ${roads.length} roads for model ${modelId}`);
  return roads;
} 

/**
 * @description Fetches the time interval from the API.
 * @returns Promise< TimeInterval > - TimeInterval object containing start and end times
 */
export async function fetchTimeInterval(modelId: string, roadId: string): Promise<TimeInterval[]> {
  console.log(`[fetchTimeInterval] Called with modelId: ${modelId}, roadId: ${roadId}`);

  if (!modelId) {
    console.error(`[fetchTimeInterval] ERROR: modelId is undefined or null!`);
    throw new Error('modelId is required');
  }
  if (!roadId) {
    console.error(`[fetchTimeInterval] ERROR: roadId is undefined or null!`);
    throw new Error('roadId is required');
  }

  const url = `/api/imputation/impute-result/time-interval/${modelId}/${roadId}/`;
  console.log(`[fetchTimeInterval] Fetching from: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    console.error(`[fetchTimeInterval] Error: ${response.status} ${response.statusText}`);
    throw new Error(`Error fetching time interval: ${response.statusText}`);
  }
	const data = await response.json();
	const timeInterval: TimeInterval[] = data.TimeInterval || data;
  console.log(`[fetchTimeInterval] Received ${timeInterval.length} time intervals`);
	return timeInterval;
}

/**
 * @description Fetches imputation results based on model ID, road ID, and time interval from the API.
 * @param modelId - Fetches imputation results for this model ID
 * @param roadId - Fetches imputation results for this road ID
 * @param startTime - Fetches imputation results starting from this time
 * @param endTime - Fetches imputation results up to this time
 * @returns Promise<ImputationResult> - Single ImputationResult object
 */
export async function fetchImputationResults(
  modelId: string,
  roadId: string,
  startTime: number,
  endTime: number
): Promise<ImputationResult[]> {
  const response = await fetch(
    `/api/imputation/impute-result/${modelId}/${roadId}/${startTime}/${endTime}/`
  );
  if (!response.ok) {
    throw new Error(`Error fetching imputation results: ${response.statusText}`);
  }

	const data = await response.json();
	const imputationResult: ImputationResult[] = data.ImputationResult || data;
	
  return imputationResult;
  
}

/**
 * @description Fetches a model file for download from the API.
 * @param {string} modelId - ID of the model to download
 * @returns Promise< Blob > - The model file as a Blob
 */
export async function fetchDownloadModel(modelId: string): Promise<Blob> {
  const response = await fetch(`/api/imputation/download-model/${modelId}/`);
  if (!response.ok) {
    throw new Error(`Error exporting model: ${response.statusText}`);
  }
  return response.blob();
}