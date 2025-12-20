import { ModelType, ModelMetrics, ImputationResult, TimeInterval, Road, } from './imputation.types';


/**
 * @description Fetches the available model types from the API.
 * @returns Promise<ModelType[]> - Array of ModelType objects
 */
export async function fetchModelTypes(): Promise<ModelType[]> {
	const url = `/api/imputation/model-types/`
	console.log(`[fetchModelTypes] Fetching from: ${url}`)

	const response = await fetch(url);

	if (!response.ok) {
		console.error(`[fetchModelTypes] Error: ${response.status} ${response.statusText}`)

		throw new Error(`Error fetching model types: ${response.statusText}`);
	}
	const modelTypes: ModelType[] = await response.json();
	console.log(`[fetchModelTypes] Received model types:`, modelTypes)

	return modelTypes
}

/**
 * @description Fetches the model metrics for a given model type from the API.
 * @param {string} modelType - ID of the model type to fetch metrics for
 * @returns Promise<ModelMetrics[]> - Array of ModelMetrics objects
 */
export async function fetchModelMetrics(modelType: string): Promise<ModelMetrics[]> {
	console.log(`[fetchModelMetrics] Requesting model metrics for type: ${modelType}`);

	if (!modelType) {
		console.error(`[fetchModelMetrics] ERROR: modelType is undefined or null!`)

		throw new Error('modelType is required');
	}

	const url = `/api/imputation/model-metric/${modelType}/`;
	console.log(`[fetchModelMetrics] Fetching from ${url}`);

	const response = await fetch(url);

	if (!response.ok) {
		console.error(`[fetchModelMetrics] Error: ${response.status} ${response.statusText}`);
		throw new Error(`Error fetching model metrics: ${response.statusText}`);
	}

	const modelMetrics: ModelMetrics[] = await response.json();
	console.log(`[fetchModelMetrics] Received model metrics:`, modelMetrics)

	return modelMetrics;
}

export async function fetchRoadsByModel(modelId: string): Promise<Road[]> {
	console.log(`[fetchRoadsByModel] Requesting roads for model: ${modelId}`);

	if (!modelId) {
		console.error(`[fetchRoadsByModel] ERROR: modelId is undefined or null!`);
		throw new Error('modelId is required');
	}

	const url = `/api/imputation/impute-result/roads/${modelId}/`;
	console.log(`[fetchRoadsByModel] Fetching from: ${url}`)

	const response = await fetch(url);

	if (!response.ok) {
		console.error(`[fetchRoadsByModel] Error: ${response.status} ${response.statusText}`)
		throw new Error(`Error fetching roads for model ${modelId}: ${response.statusText}`);
	}


	const data = await response.json();
	const roads: Road[] = data.roads || data;
	console.log(`[fetchRoadsByModel] Received ${roads.length} roads for model ${modelId}`);

	return roads;
}

/**
 * @description Fetches the time interval from the API.
 * @returns Promise<TimeInterval> - Single TimeInterval object containing start and end times
 */
export async function fetchTimeInterval(modelId: string, roadId: string): Promise<TimeInterval> {
	console.log(`[fetchTimeInterval] Called with modelId: ${modelId}, roadId: ${roadId}`);

	if (!modelId) {
		console.error(`[fetchTimeInterval] ERROR: modelId is undefined or null!`);
		throw new Error('modelId is required');
	}
	if (!roadId) {
		console.error(`[fetchTimeInterval] ERROR: roadId is undefined or null!`);
		throw new Error('roadId is required');
	}

	const url = `/api/imputation/impute-result/time-interval/${modelId}/${roadId}`;
	console.log(`[fetchTimeInterval] Fetching from: ${url}`);

	const response = await fetch(url);

	if (!response.ok) {
		console.error(`[fetchTimeInterval] Error: ${response.status} ${response.statusText}`);
		throw new Error(`Error fetching time interval: ${response.statusText}`);
	}

	// Backend returns single TimeInterval object {start_time, end_time}
	const timeInterval: TimeInterval = await response.json();
	console.log(`[fetchTimeInterval] Received time interval:`, timeInterval);
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
export async function fetchImputationResults(modelId: string, roadId: string, startTime: number, endTime: number): Promise<ImputationResult[]> {
	console.log(`[fetchImputationResults] Called with modelId: ${modelId}, roadId: ${roadId}, startTime: ${startTime}, endTime: ${endTime}`);

	if (!modelId) {
		console.error(`[fetchImputationResults] ERROR: modelId is undefined or null!`);
		throw new Error('modelId is required');
	}
	if (!roadId) {
		console.error(`[fetchImputationResults] ERROR: roadId is undefined or null!`);
		throw new Error('roadId is required');
	}
	if (!startTime) {
		console.error(`[fetchImputationResults] ERROR: start time is undefined or null!`);
		throw new Error('start time is required');
	}
	if (!endTime) {
		console.error(`[fetchImputationResults] ERROR: end time is undefined or null!`);
		throw new Error('end time is required');
	}
	const url = `/api/imputation/impute-result/${modelId}/${roadId}/${startTime}/${endTime}/`;

	const response = await fetch(url);

	if (!response.ok) {
		console.error(`[fetchImputationResults] Error: ${response.status} ${response.statusText}`);
		throw new Error(`Error fetching imputation results: ${response.statusText}`);
	}
	const imputationResult: ImputationResult[] = await response.json();

	return imputationResult;
}

/**
 * @description Fetches a model file for download from the API.
 * @param {string} modelId - ID of the model to download
 * @returns Promise< Blob > - The model file as a Blob
 */
export async function fetchDownloadModel(modelId: string): Promise<Blob> {
	console.log(`[fetchDownloadModel] Called with modelId: ${modelId}`);
	const response = await fetch(`/api/imputation/download-model/${modelId}/`);
	if (!response.ok) {
		throw new Error(`Error exporting model: ${response.statusText}`);
	}
	return response.blob();
}