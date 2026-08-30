import { AiddLevelValue } from '../entities/aidd-level-value';
import { ParallelismProfile } from '../entities/parallelism-profile';

export interface IParallelismLevelCalculator {
  calculate(profile: ParallelismProfile): AiddLevelValue;
}

export interface IParallelismScoringStrategy {
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

export class WeightedParallelismScoringStrategy implements IParallelismScoringStrategy {
  constructor(private readonly weights: { median: number; max: number }) {}

  score(profile: ParallelismProfile): number {
    const median = profile.medianConcurrentBranches ?? 0;
    const max = profile.maxConcurrentBranches ?? 0;
    return median * this.weights.median + max * this.weights.max;
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
