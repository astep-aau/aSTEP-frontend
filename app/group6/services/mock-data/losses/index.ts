import { ModelLoss } from '../../imputation/imputation.types';
import { getMockModelMetrics } from '../metrics';

/**
 * @description Returns all model losses from all model configurations
 * @return Array of ModelLoss objects
 */
export function getMockModelLosses(): ModelLoss[] {
  const gatMetrics = getMockModelMetrics('model-type-gat-bigru');
  const graphsageMetrics = getMockModelMetrics('model-type-graphsage-bigru');

  return [...gatMetrics, ...graphsageMetrics].flatMap(model => model.loss);
}
