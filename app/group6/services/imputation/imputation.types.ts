
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
 * @property {string} type - Dataset type (e.g., "test", "validation", "Training", "Validation")
 * @property {number} loss_value - Numeric value of the loss metric
 * @property {string} loss_unit - Metric type/unit (e.g., "mse", "rmse", "mape", "MAE", "MSE", "diff")
 *
 * @example
 * // Backend structure example:
 * {
 *   model_id: "09d8e69b-b92d-4440-8dc5-745c7809a66b",
 *   type: "test",        // Dataset: test or validation
 *   loss_value: 15.623,  // Numeric value
 *   loss_unit: "rmse"    // Metric type
 * }
 */
export interface ModelLoss {
	model_id: string;
	type: string;
	loss_value: number;
	loss_unit: string;
}



/**
 * Single imputation data point from the backend API
 * @property {number} tms - Timestamp in UNIX seconds
 * @property {number | null} value - Speed value (can be null if missing)
 * @property {boolean} imputed - Whether this data point is imputed (true) or observed (false)
 */
export interface ImputationResult {
	tms: number;
	value: number | null;
	imputed: boolean;
}

/**
 * @property {string} model_id - ID of the model
 * @property {string} param_name - Name of the hyperparameter
 * @property {string} param_value - Value of the hyperparameter
 */
interface Hyperparameter {
	model_id: string;
	param_name: string;
	param_value: string;
}

/**
 * @description Time interval with start and end times in unix time
 * @property {number} start_time - Start time in unix time
 * @property {number} end_time - End time in unix time
 */
export interface TimeInterval {
	start_time: number;
	end_time: number;
}

/**
 * @property {string} road_id - Unique identifier for the road segment
 * @property {string} name - Display name of the road (optional)
 * @property {string} road_type - Type/category of the road (optional)
 */
export interface Road {
	road_id: string;
	name?: string;
	road_type?: string;
}


export interface Healthcheck {
	status: string;
	service: string;
}

/**
 * @description Time range with start and end date strings
 * @property {string} start - Start time as ISO datetime string
 * @property {string} end - End time as ISO datetime string
 */
export interface TimeRange {
	start: string;
	end: string;
}