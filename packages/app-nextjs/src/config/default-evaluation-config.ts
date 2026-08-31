import type {
  AxisName,
  HarnessAiConfigurationWeights,
  HarnessContextEngineeringWeights,
} from '@laivel-up/core';
import type {
  EvaluationConfig,
  HarnessAlgorithm,
  ParallelismAlgorithm,
  ParallelismWeights,
} from '../types/evaluation-config';

const AXES: AxisName[] = ['size', 'harness', 'intervention', 'parallelism', 'velocity'];
const PARALLELISM_ALGORITHMS: ParallelismAlgorithm[] = ['weighted', 'median-only'];
const HARNESS_ALGORITHMS: HarnessAlgorithm[] = ['weighted-score', 'capability-gates'];

const INITIAL_PARALLELISM_WEIGHTS: ParallelismWeights = { median: 5, max: 1 };

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
    harnessContextWeights: { ...INITIAL_HARNESS_CONTEXT_WEIGHTS },
    harnessAiWeights: { ...INITIAL_HARNESS_AI_WEIGHTS },
    algorithms: { parallelism: 'weighted', harness: 'weighted-score' },
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
    harnessContextWeights: mergeNumericConfig<HarnessContextEngineeringWeights>(
      defaults.harnessContextWeights,
      value.harnessContextWeights,
    ),
    harnessAiWeights: mergeNumericConfig<HarnessAiConfigurationWeights>(
      defaults.harnessAiWeights,
      value.harnessAiWeights,
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
    },
  };
}
