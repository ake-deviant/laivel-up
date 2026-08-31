import { AiddLevelValue } from './aidd-level-value';

export type ImprovementAxis =
  'parallelism' | 'size' | 'harness' | 'intervention' | 'velocity' | 'deliveryConfidence';

export interface Improvement {
  axis: ImprovementAxis;
  type: string;
  targetLevel?: AiddLevelValue;
}
