import { AiddLevelValue } from '../entities/aidd-level-value';
import { VelocityProfile } from '../entities/velocity-profile';

export interface IVelocityLevelCalculator {
  calculate(profile: VelocityProfile): AiddLevelValue;
}

export interface VelocityLevelConfig {
  minLeverageRatio: number | null;
  minCompletionRate: number | null;
  minCycleTimeRatio: number | null;
  minFeatureRatio: number | null;
}

export interface VelocityThresholdsConfig {
  levels: {
    gold: VelocityLevelConfig;
    silver: VelocityLevelConfig;
    copper: VelocityLevelConfig;
    green: VelocityLevelConfig;
    blue: VelocityLevelConfig;
  };
}

function derivedMetrics(profile: VelocityProfile) {
  const { storyPointsPerSprint: sp, teamAvgStoryPointsPerSprint: avg } = profile;
  const leverageRatio = sp !== null && avg !== null && avg > 0 ? sp / avg : null;

  const { medianDaysTicketToPr: days, teamAvgMedianDaysTicketToPr: avgDays } = profile;
  const cycleTimeRatio = days !== null && avgDays !== null && days > 0 ? avgDays / days : null;

  const { featuresPerSprint: features, bugsPerSprint: bugs } = profile;
  const total = (features ?? 0) + (bugs ?? 0);
  const featureRatio = features !== null && bugs !== null && total > 0 ? features / total : null;

  return { leverageRatio, cycleTimeRatio, featureRatio };
}

class VelocityLevelThreshold {
  constructor(
    readonly level: AiddLevelValue,
    private readonly config: VelocityLevelConfig,
  ) {}

  matches(
    leverageRatio: number | null,
    completionRate: number | null,
    cycleTimeRatio: number | null,
    featureRatio: number | null,
  ): boolean {
    // leverageRatio — essential derived: null fails the condition
    if (this.config.minLeverageRatio !== null) {
      if (leverageRatio === null || leverageRatio < this.config.minLeverageRatio) return false;
    }

    // completionRate — impacting: null skips the condition
    if (this.config.minCompletionRate !== null && completionRate !== null) {
      if (completionRate < this.config.minCompletionRate) return false;
    }

    // cycleTimeRatio — impacting: null skips the condition
    if (this.config.minCycleTimeRatio !== null && cycleTimeRatio !== null) {
      if (cycleTimeRatio < this.config.minCycleTimeRatio) return false;
    }

    // featureRatio — optional but hard gate when present: null skips
    if (this.config.minFeatureRatio !== null && featureRatio !== null) {
      if (featureRatio < this.config.minFeatureRatio) return false;
    }

    return true;
  }
}

class VelocityLevelCalculatorService implements IVelocityLevelCalculator {
  constructor(private readonly thresholds: VelocityLevelThreshold[]) {}

  calculate(profile: VelocityProfile): AiddLevelValue {
    const { leverageRatio, cycleTimeRatio, featureRatio } = derivedMetrics(profile);

    if (leverageRatio === null) return AiddLevelValue.white;

    for (const threshold of this.thresholds) {
      if (threshold.matches(leverageRatio, profile.completionRate, cycleTimeRatio, featureRatio)) {
        return threshold.level;
      }
    }

    return AiddLevelValue.red;
  }
}

export function createVelocityLevelCalculator(
  config: VelocityThresholdsConfig,
): IVelocityLevelCalculator {
  const thresholds: VelocityLevelThreshold[] = [
    new VelocityLevelThreshold(AiddLevelValue.gold, config.levels.gold),
    new VelocityLevelThreshold(AiddLevelValue.silver, config.levels.silver),
    new VelocityLevelThreshold(AiddLevelValue.copper, config.levels.copper),
    new VelocityLevelThreshold(AiddLevelValue.green, config.levels.green),
    new VelocityLevelThreshold(AiddLevelValue.blue, config.levels.blue),
  ];
  return new VelocityLevelCalculatorService(thresholds);
}
