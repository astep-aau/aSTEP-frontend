import { Hyperparameter } from '../../imputation/imputation.types';
import { getMockModelMetrics } from '../metrics';

/**
 * @description Returns all hyperparameters from all model configurations
 * @return Array of Hyperparameter objects
 */
export function getMockHyperparameters(): Hyperparameter[] {
  const gatMetrics = getMockModelMetrics('model-type-gat-bigru');
  const graphsageMetrics = getMockModelMetrics('model-type-graphsage-bigru');

  return [...gatMetrics, ...graphsageMetrics].flatMap(model => model.hyperparameters);
}
