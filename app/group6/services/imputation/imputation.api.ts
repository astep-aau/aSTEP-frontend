import { ModelType, ModelMetrics, Hyperparameter, ModelLoss, ImputationResult, TimeInterval, Roads } from './imputation.types';

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
 * @param {string} modelTypeId - ID of the model type to fetch metrics for
 * @returns Promise<ModelMetrics[]> - Array of ModelMetrics objects
 */
export async function fetchModelMetrics(modelTypeId: string): Promise<ModelMetrics[]> {
  const response = await fetch(`/api/imputation/model-metrics/${modelTypeId}/`);
  if (!response.ok) {
    throw new Error(`Error fetching model metrics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * @description Fetches the model losses from the API.
 * @returns Promise<ModelLoss[]> - Array of ModelLoss objects
 */
export async function fetchModelLosses(): Promise<ModelLoss[]> {
  const response = await fetch('/api/imputation/model-loss/');
  if (!response.ok) {
    throw new Error(`Error fetching model losses: ${response.statusText}`);
  }
  return response.json();
}


/**
 * @description Fetches the available roads from the API.
 * @returns Promise<Roads> - Roads object containing an array of road IDs
 */
export async function fetchRoads(): Promise<Roads> {
  const response = await fetch('/api/imputation/roads/');
  if (!response.ok) {
    throw new Error(`Error fetching roads: ${response.statusText}`);
  }
  return response.json();
}

/**
 * @description Fetches the time interval from the API.
 * @returns Promise< TimeInterval > - TimeInterval object containing start and end times
 */
export async function fetchTimeInterval(): Promise<TimeInterval> {
  const response = await fetch('/api/imputation/time-interval/');
  if (!response.ok) {
    throw new Error(`Error fetching time interval: ${response.statusText}`);
  }
  return response.json();
}

/**
 * @description Fetches imputation results based on model ID, road ID, and time interval from the API.
 * @param modelId - Fetches imputation results for this model ID
 * @param roadId - Fetches imputation results for this road ID
 * @param startTime - Fetches imputation results starting from this time
 * @param endTime - Fetches imputation results up to this time
 * @returns Promise<ImputationResult[]> - Array of ImputationResult objects
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
  return response.json();
}

/**
 * @description Fetches hyperparameters from the API.
 * @returns Promise<Hyperparameter[]> - Array of Hyperparameter objects
 */
export async function fetchHyperparameters(): Promise<Hyperparameter[]> {
  const response = await fetch('/api/imputation/impute-result/hyperparameters/');
  if (!response.ok) {
    throw new Error(`Error fetching hyperparameters: ${response.statusText}`);
  }
  return response.json();
}

/**
 * @description Fetches a model file for download from the API.
 * @param {string} modelId - ID of the model to download
 * @returns Promise< Blob > - The model file as a Blob
 */
export async function fetchDownloadModel(modelId: string): Promise<Blob> {
  const response = await fetch(`api/imputation/impute-result/download_model/${modelId}/`);
  if (!response.ok) {
    throw new Error(`Error exporting model: ${response.statusText}`);
  }
  return response.blob();
}