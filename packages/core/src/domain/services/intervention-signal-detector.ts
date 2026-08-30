import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { Signal } from '../entities/signal';
import { InterventionProfile } from '../entities/intervention-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import {
  InterventionThresholdsConfig,
  InterventionLevelConfig,
} from './intervention-level-calculator.service';

// green is skipped for intervention (same description as copper → copper is assigned)
const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.white,
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.copper,
  AiddLevelValue.silver,
  AiddLevelValue.gold,
];

function matchesConfig(profile: InterventionProfile, cfg: InterventionLevelConfig): boolean {
  if (cfg.maxCorrectionCommits !== null) {
    if (profile.medianCorrectionCommitsAfterOpen === null) return false;
    if (profile.medianCorrectionCommitsAfterOpen > cfg.maxCorrectionCommits) return false;
  }
  if (cfg.maxHumanCommitRatio !== null) {
    if (profile.humanCommitRatio === null) return false;
    if (profile.humanCommitRatio > cfg.maxHumanCommitRatio) return false;
  }
  if (cfg.minMergedWithoutHumanEditRatio !== null) {
    if (profile.mergedWithoutHumanEditRatio === null) return false;
    if (profile.mergedWithoutHumanEditRatio < cfg.minMergedWithoutHumanEditRatio) return false;
  }
  if (cfg.maxReviewComments !== null) {
    if (profile.medianReviewCommentsReceived === null) return false;
    if (profile.medianReviewCommentsReceived > cfg.maxReviewComments) return false;
  }
  return true;
}

function computeCurrentLevel(
  profile: InterventionProfile,
  config: InterventionThresholdsConfig,
): AiddLevelValue {
  const ordered: Array<[AiddLevelValue, InterventionLevelConfig]> = [
    [AiddLevelValue.gold, config.levels.gold],
    [AiddLevelValue.silver, config.levels.silver],
    [AiddLevelValue.copper, config.levels.copper],
    [AiddLevelValue.blue, config.levels.blue],
  ];
  for (const [level, cfg] of ordered) {
    if (matchesConfig(profile, cfg)) return level;
  }
  const hasAiSignal =
    profile.medianCorrectionCommitsAfterOpen !== null || profile.humanCommitRatio !== null;
  return hasAiSignal ? AiddLevelValue.red : AiddLevelValue.white;
}

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function getLevelConfig(
  config: InterventionThresholdsConfig,
  level: AiddLevelValue,
): InterventionLevelConfig | null {
  return (config.levels as Partial<Record<AiddLevelValue, InterventionLevelConfig>>)[level] ?? null;
}

function buildSignals(profile: InterventionProfile, cfg: InterventionLevelConfig): Signal[] {
  const signals: Signal[] = [];
  if (cfg.maxCorrectionCommits !== null) {
    signals.push({
      name: 'medianCorrectionCommitsAfterOpen',
      validated:
        profile.medianCorrectionCommitsAfterOpen !== null &&
        profile.medianCorrectionCommitsAfterOpen <= cfg.maxCorrectionCommits,
      value: profile.medianCorrectionCommitsAfterOpen,
    });
  }
  if (cfg.maxHumanCommitRatio !== null) {
    signals.push({
      name: 'humanCommitRatio',
      validated:
        profile.humanCommitRatio !== null && profile.humanCommitRatio <= cfg.maxHumanCommitRatio,
      value: profile.humanCommitRatio,
    });
  }
  if (cfg.minMergedWithoutHumanEditRatio !== null) {
    signals.push({
      name: 'mergedWithoutHumanEditRatio',
      validated:
        profile.mergedWithoutHumanEditRatio !== null &&
        profile.mergedWithoutHumanEditRatio >= cfg.minMergedWithoutHumanEditRatio,
      value: profile.mergedWithoutHumanEditRatio,
    });
  }
  if (cfg.maxReviewComments !== null) {
    signals.push({
      name: 'medianReviewCommentsReceived',
      validated:
        profile.medianReviewCommentsReceived !== null &&
        profile.medianReviewCommentsReceived <= cfg.maxReviewComments,
      value: profile.medianReviewCommentsReceived,
    });
  }
  return signals;
}

class InterventionSignalDetectorService implements IAxisSignalDetector<InterventionProfile> {
  constructor(private readonly config: InterventionThresholdsConfig) {}

  detect(profile: InterventionProfile): AxisSignalMatrix {
    const current = computeCurrentLevel(profile, this.config);
    const next = getNextLevel(current);

    const targetCfg = getLevelConfig(this.config, next ?? current);
    return {
      axis: 'intervention',
      currentLevel: current,
      nextLevel: next,
      signals: targetCfg ? buildSignals(profile, targetCfg) : [],
    };
  }
}

export function createInterventionSignalDetector(
  config: InterventionThresholdsConfig,
): IAxisSignalDetector<InterventionProfile> {
  return new InterventionSignalDetectorService(config);
}
