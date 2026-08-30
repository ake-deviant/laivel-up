import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { Signal } from '../entities/signal';
import { VelocityProfile } from '../entities/velocity-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import { VelocityLevelConfig, VelocityThresholdsConfig } from './velocity-level-calculator.service';

const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.green,
  AiddLevelValue.copper,
  AiddLevelValue.silver,
  AiddLevelValue.gold,
];

interface DerivedMetrics {
  leverageRatio: number | null;
  cycleTimeRatio: number | null;
  featureRatio: number | null;
}

function computeDerivedMetrics(profile: VelocityProfile): DerivedMetrics {
  const { storyPointsPerSprint: sp, teamAvgStoryPointsPerSprint: avg } = profile;
  const leverageRatio = sp !== null && avg !== null && avg > 0 ? sp / avg : null;

  const { medianDaysTicketToPr: days, teamAvgMedianDaysTicketToPr: avgDays } = profile;
  const cycleTimeRatio = days !== null && avgDays !== null && days > 0 ? avgDays / days : null;

  const { featuresPerSprint: features, bugsPerSprint: bugs } = profile;
  const total = (features ?? 0) + (bugs ?? 0);
  const featureRatio = features !== null && bugs !== null && total > 0 ? features / total : null;

  return { leverageRatio, cycleTimeRatio, featureRatio };
}

function getLevelConfig(
  config: VelocityThresholdsConfig,
  level: AiddLevelValue,
): VelocityLevelConfig | null {
  return (config.levels as Partial<Record<AiddLevelValue, VelocityLevelConfig>>)[level] ?? null;
}

function matchesConfig(
  metrics: DerivedMetrics,
  completionRate: number | null,
  cfg: VelocityLevelConfig,
): boolean {
  if (cfg.minLeverageRatio !== null) {
    if (metrics.leverageRatio === null || metrics.leverageRatio < cfg.minLeverageRatio)
      return false;
  }
  if (cfg.minCompletionRate !== null && completionRate !== null) {
    if (completionRate < cfg.minCompletionRate) return false;
  }
  if (cfg.minCycleTimeRatio !== null && metrics.cycleTimeRatio !== null) {
    if (metrics.cycleTimeRatio < cfg.minCycleTimeRatio) return false;
  }
  if (cfg.minFeatureRatio !== null && metrics.featureRatio !== null) {
    if (metrics.featureRatio < cfg.minFeatureRatio) return false;
  }
  return true;
}

function computeCurrentLevel(
  profile: VelocityProfile,
  metrics: DerivedMetrics,
  config: VelocityThresholdsConfig,
): AiddLevelValue {
  if (metrics.leverageRatio === null) return AiddLevelValue.red;

  const orderedLevels = [
    AiddLevelValue.gold,
    AiddLevelValue.silver,
    AiddLevelValue.copper,
    AiddLevelValue.green,
    AiddLevelValue.blue,
  ] as const;

  for (const level of orderedLevels) {
    const cfg = getLevelConfig(config, level);
    if (cfg && matchesConfig(metrics, profile.completionRate, cfg)) return level;
  }

  return AiddLevelValue.red;
}

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function buildSignals(
  profile: VelocityProfile,
  metrics: DerivedMetrics,
  level: AiddLevelValue,
  config: VelocityThresholdsConfig,
): Signal[] {
  const cfg = getLevelConfig(config, level);
  if (!cfg) return [];

  const signals: Signal[] = [];

  if (cfg.minLeverageRatio !== null) {
    signals.push({
      name: 'leverageRatio',
      validated: metrics.leverageRatio !== null && metrics.leverageRatio >= cfg.minLeverageRatio,
      value: metrics.leverageRatio,
    });
  }

  if (cfg.minCompletionRate !== null) {
    signals.push({
      name: 'completionRate',
      validated: profile.completionRate !== null && profile.completionRate >= cfg.minCompletionRate,
      value: profile.completionRate,
    });
  }

  if (cfg.minCycleTimeRatio !== null) {
    signals.push({
      name: 'cycleTimeRatio',
      validated: metrics.cycleTimeRatio !== null && metrics.cycleTimeRatio >= cfg.minCycleTimeRatio,
      value: metrics.cycleTimeRatio,
    });
  }

  if (cfg.minFeatureRatio !== null) {
    signals.push({
      name: 'featureRatio',
      validated: metrics.featureRatio !== null && metrics.featureRatio >= cfg.minFeatureRatio,
      value: metrics.featureRatio,
    });
  }

  return signals;
}

class VelocitySignalDetectorService implements IAxisSignalDetector<VelocityProfile> {
  constructor(private readonly config: VelocityThresholdsConfig) {}

  detect(profile: VelocityProfile): AxisSignalMatrix {
    const metrics = computeDerivedMetrics(profile);
    const current = computeCurrentLevel(profile, metrics, this.config);
    const next = getNextLevel(current);

    return {
      axis: 'velocity',
      currentLevel: current,
      nextLevel: next,
      signals: buildSignals(profile, metrics, next ?? current, this.config),
    };
  }
}

export function createVelocitySignalDetector(
  config: VelocityThresholdsConfig,
): IAxisSignalDetector<VelocityProfile> {
  return new VelocitySignalDetectorService(config);
}
