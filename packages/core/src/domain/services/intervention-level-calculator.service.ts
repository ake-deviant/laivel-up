import { AiddLevelValue } from '../entities/aidd-level-value';
import { InterventionProfile } from '../entities/intervention-profile';
import { ILevelImprovementBus, noopLevelImprovementBus } from '../ports/level-improvement-bus.port';

export interface IInterventionLevelCalculator {
  calculate(profile: InterventionProfile): AiddLevelValue;
}

export interface InterventionLevelConfig {
  maxCorrectionCommits: number | null;
  maxHumanCommitRatio: number | null;
  minMergedWithoutHumanEditRatio: number | null;
  maxReviewComments: number | null;
}

export interface InterventionThresholdsConfig {
  levels: {
    gold: InterventionLevelConfig;
    silver: InterventionLevelConfig;
    copper: InterventionLevelConfig;
    blue: InterventionLevelConfig;
  };
}

class InterventionLevelThreshold {
  constructor(
    readonly level: AiddLevelValue,
    private readonly config: InterventionLevelConfig,
  ) {}

  matches(profile: InterventionProfile): boolean {
    const {
      maxCorrectionCommits,
      maxHumanCommitRatio,
      minMergedWithoutHumanEditRatio,
      maxReviewComments,
    } = this.config;

    if (maxCorrectionCommits !== null) {
      if (profile.medianCorrectionCommitsAfterOpen === null) return false;
      if (profile.medianCorrectionCommitsAfterOpen > maxCorrectionCommits) return false;
    }

    if (maxHumanCommitRatio !== null) {
      if (profile.humanCommitRatio === null) return false;
      if (profile.humanCommitRatio > maxHumanCommitRatio) return false;
    }

    if (minMergedWithoutHumanEditRatio !== null) {
      if (profile.mergedWithoutHumanEditRatio === null) return false;
      if (profile.mergedWithoutHumanEditRatio < minMergedWithoutHumanEditRatio) return false;
    }

    if (maxReviewComments !== null) {
      if (profile.medianReviewCommentsReceived === null) return false;
      if (profile.medianReviewCommentsReceived > maxReviewComments) return false;
    }

    return true;
  }
}

class InterventionLevelCalculatorService implements IInterventionLevelCalculator {
  constructor(
    private readonly thresholds: InterventionLevelThreshold[],
    private readonly bus: ILevelImprovementBus,
  ) {}

  calculate(profile: InterventionProfile): AiddLevelValue {
    for (const threshold of this.thresholds) {
      if (threshold.matches(profile)) return threshold.level;
    }

    const hasAiSignal =
      profile.medianCorrectionCommitsAfterOpen !== null || profile.humanCommitRatio !== null;

    return hasAiSignal ? AiddLevelValue.red : AiddLevelValue.white;
  }
}

export function createInterventionLevelCalculator(
  config: InterventionThresholdsConfig,
  bus: ILevelImprovementBus = noopLevelImprovementBus,
): IInterventionLevelCalculator {
  const thresholds = [
    new InterventionLevelThreshold(AiddLevelValue.gold, config.levels.gold),
    new InterventionLevelThreshold(AiddLevelValue.silver, config.levels.silver),
    new InterventionLevelThreshold(AiddLevelValue.copper, config.levels.copper),
    new InterventionLevelThreshold(AiddLevelValue.blue, config.levels.blue),
  ];
  return new InterventionLevelCalculatorService(thresholds, bus);
}
