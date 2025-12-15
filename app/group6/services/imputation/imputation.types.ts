
/**
 * @property {string} id - Unique identifier for the model type
 * @property {string} name - Name of the model type
 */
export interface ModelType {
  id: string;
  name: string;
}

/**
 * @property {string} id - Unique identifier for the model metrics
 * @property {string} model_type - Type of the model
 * @property {number} train_time_min - Training time in minutes
 * @property {number | null} bias - Bias metric (nullable)
 * @property {number | null} gap - Gap metric (nullable)
 * @property {Hyperparameter[]} hyperparameters - Array of hyperparameters
 * @property {ModelLoss[]} loss - Array of model losses
 */
export interface ModelMetrics {
  id: string;
  model_type: string;
  train_time_min: number;
  bias: number | null;
  gap: number | null;
  hyperparameters: Hyperparameter[];
  loss: ModelLoss[];
}

/**
 * @property {string} model_id - ID of the model
 * @property {string} type - Type of loss
 * @property {number} loss_value - Value of the loss
 * @property {string} loss_unit - Unit of the loss value
 */
export interface ModelLoss{
  model_id: string;
  type: string;
  loss_value: number;
  loss_unit: string;
}

/**
 * @property {string} road_id - ID of the road
 * @property {string} model_id - ID of the model
 * @property {number[]} tms - Array of time markers in unix time
 * @property {number[]} values - Array of imputed values
 * @property {boolean[]} imputed - Array indicating if the value was imputed
 */
export interface ImputationResult {
  road_id: string;
  model_id: string;
  tms: number[];
  values: number[];
  imputed: boolean[];
}

/**
 * @property {string} model_id - ID of the model
 * @property {string} param_name - Name of the hyperparameter
 * @property {string} param_value - Value of the hyperparameter
 */
export interface Hyperparameter {
  model_id: string;
  param_name: string;
  param_value: string;
}

/**
 * @property {number} start_time - Start time in unix time
 * @property {number} end_time - End time in unix time
 */
export interface TimeInterval {
  start_time: number;
  end_time: number;
}

/**
 * @property {string[]} road_ids - Array of road IDs
 */
export interface Roads {
  road_ids: string[];
}