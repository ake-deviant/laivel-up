export type ImprovementAxis = 'parallelism' | 'size' | 'harness' | 'intervention';

export interface Improvement {
  axis: ImprovementAxis;
  type: string;
}
