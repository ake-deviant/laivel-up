export type AxisName =
  'size' | 'harness' | 'intervention' | 'parallelism' | 'velocity' | 'deliveryConfidence';

export interface AiddEvaluatorConfig {
  nonBlockingAxes: AxisName[];
}
