import { AiddLevelValue } from '../entities/aidd-level-value';
import { ParallelismProfile } from '../entities/parallelism-profile';
import {
  ILevelImprovementBus,
  LevelImprovementEvent,
  noopLevelImprovementBus,
} from '../ports/level-improvement-bus.port';
import {
  WORKTREE_DATA_MISSING,
  WORKTREE_NOT_CONFIGURED,
} from '../events/parallelism-improvement.events';

export interface IParallelismLevelCalculator {
  calculate(profile: ParallelismProfile): AiddLevelValue;
}

export interface IParallelismScoringStrategy {
  score(profile: ParallelismProfile): number;
}

export interface IParallelismLevelThreshold {
  level: AiddLevelValue;
  matches(score: number, profile: ParallelismProfile): boolean;
  detect(score: number, profile: ParallelismProfile): LevelImprovementEvent[];
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

  detect(score: number, profile: ParallelismProfile): LevelImprovementEvent[] {
    if (score < this.config.minScore) return [];
    if (!this.config.requiresWorktree) return [];
    if (profile.hasWorktreeInclude === null)
      return [{ type: WORKTREE_DATA_MISSING, axis: 'parallelism' }];
    if (profile.hasWorktreeInclude === false)
      return [{ type: WORKTREE_NOT_CONFIGURED, axis: 'parallelism' }];
    return [];
  }
}

export class WeightedParallelismLevelCalculatorService implements IParallelismLevelCalculator {
  constructor(
    private readonly scoringStrategy: IParallelismScoringStrategy,
    private readonly thresholds: IParallelismLevelThreshold[],
    private readonly bus: ILevelImprovementBus,
  ) {}

  calculate(profile: ParallelismProfile): AiddLevelValue {
    const score = this.scoringStrategy.score(profile);

    for (const threshold of this.thresholds) {
      if (threshold.matches(score, profile)) return threshold.level;
      threshold.detect(score, profile).forEach((event) => this.bus.emit(event));
    }

    return AiddLevelValue.white;
  }
}

export function createWeightedParallelismLevelCalculator(
  config: ParallelismThresholdsConfig,
  bus: ILevelImprovementBus = noopLevelImprovementBus,
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
  return new WeightedParallelismLevelCalculatorService(strategy, thresholds, bus);
}
