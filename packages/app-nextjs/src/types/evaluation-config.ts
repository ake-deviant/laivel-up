import type {
  AxisName,
  HarnessContextEngineeringWeights,
  HarnessAiConfigurationWeights,
} from '@laivel-up/core';

export interface ParallelismWeights {
  median: number;
  max: number;
}

export type ParallelismAlgorithm = 'weighted' | 'median-only';
export type HarnessAlgorithm = 'weighted-score' | 'capability-gates';

export interface EvaluationAlgorithmsConfig {
  parallelism: ParallelismAlgorithm;
  harness: HarnessAlgorithm;
}

export interface EvaluationConfig {
  nonBlockingAxes: AxisName[];
  parallelismWeights: ParallelismWeights;
  harnessContextWeights: HarnessContextEngineeringWeights;
  harnessAiWeights: HarnessAiConfigurationWeights;
  algorithms: EvaluationAlgorithmsConfig;
}
