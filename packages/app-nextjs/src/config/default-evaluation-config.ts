import type {
  AxisName,
  HarnessAiConfigurationWeights,
  HarnessContextEngineeringWeights,
  WeightedAverageSizeThresholdsConfig,
} from '@laivel-up/core';
import type {
  EvaluationConfig,
  HarnessAlgorithm,
  ParallelismLevelThresholds,
  ParallelismAlgorithm,
  ParallelismWeights,
  SizeAlgorithm,
} from '../types/evaluation-config';

const AXES: AxisName[] = ['size', 'harness', 'intervention', 'parallelism', 'velocity'];
const PARALLELISM_ALGORITHMS: ParallelismAlgorithm[] = ['weighted', 'median-only'];
const HARNESS_ALGORITHMS: HarnessAlgorithm[] = ['weighted-score', 'capability-gates'];
const SIZE_ALGORITHMS: SizeAlgorithm[] = ['dominant-distribution', 'weighted-average'];

const INITIAL_PARALLELISM_WEIGHTS: ParallelismWeights = { median: 5, max: 1 };
const INITIAL_PARALLELISM_LEVEL_THRESHOLDS: ParallelismLevelThresholds = {
  red: 7,
  blue: 10,
  green: 15,
  copper: 20,
  silver: 25,
  gold: 20,
};
const INITIAL_SIZE_WEIGHTED_AVERAGE_THRESHOLDS: WeightedAverageSizeThresholdsConfig = {
  red: 0.5,
  blue: 1.25,
  green: 2,
  copper: 2.5,
  silver: 3,
  gold: 3.5,
};

const INITIAL_HARNESS_CONTEXT_WEIGHTS: HarnessContextEngineeringWeights = {
  claudeMd: 4,
  docsContextCount: 2,
  docsSpecsCount: 3,
  docsBrainstormCount: 2,
  docsPlansCount: 3,
  memoryCount: 4,
  tasksCount: 3,
};

const INITIAL_HARNESS_AI_WEIGHTS: HarnessAiConfigurationWeights = {
  agentsMd: 3,
  settingsJson: 2,
  agentsCount: 3,
  skillsCount: 3,
  hooksCount: 4,
  rulesCount: 4,
};

export function createDefaultEvaluationConfig(): EvaluationConfig {
  return {
    nonBlockingAxes: ['velocity'],
    parallelismWeights: { ...INITIAL_PARALLELISM_WEIGHTS },
    parallelismLevelThresholds: { ...INITIAL_PARALLELISM_LEVEL_THRESHOLDS },
    harnessContextWeights: { ...INITIAL_HARNESS_CONTEXT_WEIGHTS },
    harnessAiWeights: { ...INITIAL_HARNESS_AI_WEIGHTS },
    sizeWeightedAverageThresholds: { ...INITIAL_SIZE_WEIGHTED_AVERAGE_THRESHOLDS },
    algorithms: {
      parallelism: 'weighted',
      harness: 'weighted-score',
      size: 'dominant-distribution',
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeNumericConfig<T extends object>(defaults: T, value: unknown): T {
  if (!isRecord(value)) return defaults;

  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const candidate = value[String(key)];
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0) {
      merged[key] = candidate as T[keyof T];
    }
  }
  return merged;
}

export function mergeEvaluationConfig(value: unknown): EvaluationConfig {
  const defaults = createDefaultEvaluationConfig();
  if (!isRecord(value)) return defaults;

  const algorithms = isRecord(value.algorithms) ? value.algorithms : {};
  const parallelismAlgorithm = algorithms.parallelism;
  const harnessAlgorithm = algorithms.harness;
  const sizeAlgorithm = algorithms.size;

  return {
    nonBlockingAxes: Array.isArray(value.nonBlockingAxes)
      ? value.nonBlockingAxes.filter(
          (axis): axis is AxisName => typeof axis === 'string' && AXES.includes(axis as AxisName),
        )
      : defaults.nonBlockingAxes,
    parallelismWeights: mergeNumericConfig<ParallelismWeights>(
      defaults.parallelismWeights,
      value.parallelismWeights,
    ),
    parallelismLevelThresholds: mergeNumericConfig<ParallelismLevelThresholds>(
      defaults.parallelismLevelThresholds,
      value.parallelismLevelThresholds,
    ),
    harnessContextWeights: mergeNumericConfig<HarnessContextEngineeringWeights>(
      defaults.harnessContextWeights,
      value.harnessContextWeights,
    ),
    harnessAiWeights: mergeNumericConfig<HarnessAiConfigurationWeights>(
      defaults.harnessAiWeights,
      value.harnessAiWeights,
    ),
    sizeWeightedAverageThresholds: mergeNumericConfig<WeightedAverageSizeThresholdsConfig>(
      defaults.sizeWeightedAverageThresholds,
      value.sizeWeightedAverageThresholds,
    ),
    algorithms: {
      parallelism:
        typeof parallelismAlgorithm === 'string' &&
        PARALLELISM_ALGORITHMS.includes(parallelismAlgorithm as ParallelismAlgorithm)
          ? (parallelismAlgorithm as ParallelismAlgorithm)
          : defaults.algorithms.parallelism,
      harness:
        typeof harnessAlgorithm === 'string' &&
        HARNESS_ALGORITHMS.includes(harnessAlgorithm as HarnessAlgorithm)
          ? (harnessAlgorithm as HarnessAlgorithm)
          : defaults.algorithms.harness,
      size:
        typeof sizeAlgorithm === 'string' &&
        SIZE_ALGORITHMS.includes(sizeAlgorithm as SizeAlgorithm)
          ? (sizeAlgorithm as SizeAlgorithm)
          : defaults.algorithms.size,
    },
  };
}
