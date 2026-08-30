export type AxisName = 'size' | 'harness' | 'intervention' | 'parallelism' | 'velocity';

export interface AiddEvaluatorConfig {
  nonBlockingAxes: AxisName[];
}
