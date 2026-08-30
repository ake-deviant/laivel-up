import { AiddLevelValue } from './aidd-level-value';

export type ImprovementAxis = 'parallelism' | 'size' | 'harness' | 'intervention' | 'velocity';

export interface Improvement {
  axis: ImprovementAxis;
  type: string;
  targetLevel?: AiddLevelValue;
}
