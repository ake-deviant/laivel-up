import { AiddLevelValue } from '../entities/aidd-level-value';
import { ParallelismProfile } from '../entities/parallelism-profile';
import { InvalidParallelismThresholdsError } from '../errors/invalid-parallelism-thresholds.error';

export interface IParallelismLevelCalculator {
  calculate(profile: ParallelismProfile): AiddLevelValue;
}

export interface IParallelismScoringStrategy {
  readonly signals: ReadonlyArray<'medianConcurrentBranches' | 'maxConcurrentBranches'>;
  score(profile: ParallelismProfile): number;
}

export interface IParallelismLevelThreshold {
  level: AiddLevelValue;
  matches(score: number, profile: ParallelismProfile): boolean;
}

export interface ParallelismLevelConfig {
  minScore: number;
  requiresWorktree?: boolean;
}

export interface ParallelismThresholdsConfig {
  weights: { median: number; max: number };
  levels: {
    gold: ParallelismLevelConfig;
    silver: ParallelismLevelConfig;
    copper: ParallelismLevelConfig;
    green: ParallelismLevelConfig;
    blue: ParallelismLevelConfig;
    red: ParallelismLevelConfig;
  };
}

const PARALLELISM_LEVEL_ORDER = ['red', 'blue', 'green', 'copper', 'silver', 'gold'] as const;

export function validateParallelismThresholds(config: ParallelismThresholdsConfig): void {
  for (const level of PARALLELISM_LEVEL_ORDER) {
    const score = config.levels[level].minScore;
    if (!Number.isFinite(score) || score < 0) {
      throw new InvalidParallelismThresholdsError(
        `${level} minScore must be a finite non-negative number`,
      );
    }
  }

  for (let index = 1; index < PARALLELISM_LEVEL_ORDER.length; index += 1) {
    const previous = PARALLELISM_LEVEL_ORDER[index - 1];
    const current = PARALLELISM_LEVEL_ORDER[index];
    if (config.levels[current].minScore <= config.levels[previous].minScore) {
      throw new InvalidParallelismThresholdsError(
        `${current} minScore must be greater than ${previous} minScore`,
      );
    }
  }
}

export class WeightedParallelismScoringStrategy implements IParallelismScoringStrategy {
  readonly signals = ['medianConcurrentBranches', 'maxConcurrentBranches'] as const;

  constructor(private readonly weights: { median: number; max: number }) {}

  score(profile: ParallelismProfile): number {
    const median = profile.medianConcurrentBranches ?? 0;
    const max = profile.maxConcurrentBranches ?? 0;
    return median * this.weights.median + max * this.weights.max;
  }
}

export class MedianOnlyParallelismScoringStrategy implements IParallelismScoringStrategy {
  readonly signals = ['medianConcurrentBranches'] as const;

  constructor(private readonly medianWeight: number) {}

  score(profile: ParallelismProfile): number {
    return (profile.medianConcurrentBranches ?? 0) * this.medianWeight;
  }
}

class ConfigurableParallelismLevelThreshold implements IParallelismLevelThreshold {
  constructor(
    readonly level: AiddLevelValue,
    private readonly config: ParallelismLevelConfig,
  ) {}

  matches(score: number, profile: ParallelismProfile): boolean {
    if (score < this.config.minScore) return false;
    if (this.config.requiresWorktree && profile.hasWorktreeInclude !== true) return false;
    return true;
  }
}

export class WeightedParallelismLevelCalculatorService implements IParallelismLevelCalculator {
  constructor(
    private readonly scoringStrategy: IParallelismScoringStrategy,
    private readonly thresholds: IParallelismLevelThreshold[],
  ) {}

  calculate(profile: ParallelismProfile): AiddLevelValue {
    const score = this.scoringStrategy.score(profile);

    for (const threshold of this.thresholds) {
      if (threshold.matches(score, profile)) return threshold.level;
    }

    return AiddLevelValue.white;
  }
}

export function createWeightedParallelismLevelCalculator(
  config: ParallelismThresholdsConfig,
): IParallelismLevelCalculator {
  const strategy = new WeightedParallelismScoringStrategy(config.weights);
  return createParallelismLevelCalculator(strategy, config);
}

export function createParallelismLevelCalculator(
  strategy: IParallelismScoringStrategy,
  config: ParallelismThresholdsConfig,
): IParallelismLevelCalculator {
  validateParallelismThresholds(config);
  const thresholds: IParallelismLevelThreshold[] = [
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.gold, config.levels.gold),
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.silver, config.levels.silver),
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.copper, config.levels.copper),
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.green, config.levels.green),
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.blue, config.levels.blue),
    new ConfigurableParallelismLevelThreshold(AiddLevelValue.red, config.levels.red),
  ];
  return new WeightedParallelismLevelCalculatorService(strategy, thresholds);
}
