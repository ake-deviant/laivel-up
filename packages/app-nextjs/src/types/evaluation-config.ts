import type {
  AxisName,
  HarnessContextEngineeringWeights,
  HarnessAiConfigurationWeights,
} from '@laivel-up/core';

export interface ParallelismWeights {
  median: number;
  max: number;
}

export interface EvaluationConfig {
  nonBlockingAxes: AxisName[];
  parallelismWeights: ParallelismWeights;
  harnessContextWeights: HarnessContextEngineeringWeights;
  harnessAiWeights: HarnessAiConfigurationWeights;
}
