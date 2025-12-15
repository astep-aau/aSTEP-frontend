import { ModelType } from '../../imputation/imputation.types';

/**
 * @description Available model architectures
 * @returns Array of ModelType objects
 */
const MOCK_MODEL_TYPES: ModelType[] = [
  { id: 'model-type-gat-bigru', name: 'GAT-BiGRU' },
  { id: 'model-type-graphsage-bigru', name: 'GraphSAGE-BiGRU' }
];

/**
 * @description Returns available model types (2 architectures)
 * @returns Array of ModelType objects
 */
export function getMockModelType(): ModelType[] {
  return MOCK_MODEL_TYPES;
}
