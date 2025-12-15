import {
  ModelMetrics,
  Hyperparameter,
  ModelLoss
} from '../../imputation/imputation.types';

/**
 * @description Helper Function: Creates a single hyperparameter object
 * @returns Hyperparameter object
 * @example
 * ```ts
 * const hyperparam = createHyperparameter('model-gat-config-a', 'learning_rate', 0.001);
 * // hyperparam = { model_id: 'model-gat-config-a', param_name: 'learning_rate', param_value: '0.001' }
 * ```
 */
function createHyperparameter(
  modelId: string,
  paramName: string,
  paramValue: number | string
): Hyperparameter {
  return {
    model_id: modelId,
    param_name: paramName,
    param_value: String(paramValue)
  };
}

/**
 * @description Creates a single model loss object
 * @returns ModelLoss object
 * @example
 * ```ts
 * const loss = createModelLoss('model-gat-config-a', 'MAE', 2.3, 'km/h');
 * // loss = { model_id: 'model-gat-config-a', type: 'MAE', loss_value: 2.3, loss_unit: 'km/h' }
 * ```
 */
function createModelLoss(
  modelId: string,
  type: string,
  value: number,
  unit: string = 'km/h'
): ModelLoss {
  return {
    model_id: modelId,
    type,
    loss_value: value,
    loss_unit: unit
  };
}

/**
 * @description Returns model metrics for a given model type
 * @param modelTypeId - Model type ID to filter by (optional)
 * @returns Array of ModelMetrics objects
 */
export function getMockModelMetrics(modelTypeId?: string): ModelMetrics[] {
  const isGAT = !modelTypeId || modelTypeId.includes('gat');
  const modelPrefix = isGAT ? 'gat' : 'graphsage';
  const actualModelTypeId = modelTypeId || 'model-type-gat-bigru';

  const baseMAE = isGAT ? 2.3 : 2.8;
  const baseRMSE = isGAT ? 3.1 : 3.6;

  return Array.from({ length: 3 }, (_, configIndex) => {
    const configLetter = String.fromCharCode(97 + configIndex);
    const modelId = `model-${modelPrefix}-config-${configLetter}`;

    const learningRate = 0.001 / (configIndex + 1);
    const hiddenDim = 64 * (configIndex + 1);
    const sequenceLength = 24 * (configIndex + 1);
    const batchSize = 32 * (configIndex + 1);

    return {
      id: modelId,
      model_type: actualModelTypeId,
      train_time_min: 45 + configIndex * 15,
      bias: 0.12 - configIndex * 0.04,
      gap: 0.05 - configIndex * 0.02,

      hyperparameters: [
        createHyperparameter(modelId, 'learning_rate', learningRate.toFixed(6)),
        createHyperparameter(modelId, 'hidden_dim', hiddenDim),
        createHyperparameter(modelId, 'sequence_length', sequenceLength),
        createHyperparameter(modelId, 'batch_size', batchSize),
        createHyperparameter(modelId, 'num_layers', 2 + configIndex),
        createHyperparameter(modelId, 'dropout', (0.1 + configIndex * 0.1).toFixed(1))
      ],

      loss: [
        createModelLoss(modelId, 'MAE', baseMAE + configIndex * 0.15, 'km/h'),
        createModelLoss(modelId, 'RMSE', baseRMSE + configIndex * 0.2, 'km/h'),
        createModelLoss(modelId, 'R²', 0.92 - configIndex * 0.03, ''),
        createModelLoss(modelId, 'train_loss', 0.045 - configIndex * 0.008, '')
      ]
    };
  });
}
