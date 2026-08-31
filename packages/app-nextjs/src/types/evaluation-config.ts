import type {
  AxisName,
  HarnessContextEngineeringWeights,
  HarnessAiConfigurationWeights,
  WeightedAverageSizeThresholdsConfig,
} from '@laivel-up/core';

export interface ParallelismWeights {
  median: number;
  max: number;
}

export interface ParallelismLevelThresholds {
  red: number;
  blue: number;
  green: number;
  copper: number;
  silver: number;
  gold: number;
}

export type ParallelismAlgorithm = 'weighted' | 'median-only';
export type HarnessAlgorithm = 'weighted-score' | 'capability-gates';
export type SizeAlgorithm = 'dominant-distribution' | 'weighted-average';

export interface EvaluationAlgorithmsConfig {
  parallelism: ParallelismAlgorithm;
  harness: HarnessAlgorithm;
  size: SizeAlgorithm;
}

export interface EvaluationConfig {
  version: 2;
  nonBlockingAxes: AxisName[];
  parallelismWeights: ParallelismWeights;
  parallelismLevelThresholds: ParallelismLevelThresholds;
  harnessContextWeights: HarnessContextEngineeringWeights;
  harnessAiWeights: HarnessAiConfigurationWeights;
  sizeWeightedAverageThresholds: WeightedAverageSizeThresholdsConfig;
  algorithms: EvaluationAlgorithmsConfig;
}
