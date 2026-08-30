import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { Signal } from '../entities/signal';
import { ParallelismProfile } from '../entities/parallelism-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import {
  ParallelismThresholdsConfig,
  ParallelismLevelConfig,
} from './parallelism-level-calculator.service';

const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.white,
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.green,
  AiddLevelValue.copper,
  AiddLevelValue.silver,
  AiddLevelValue.gold,
];

function computeScore(
  profile: ParallelismProfile,
  weights: { median: number; max: number },
): number {
  return (
    (profile.medianConcurrentBranches ?? 0) * weights.median +
    (profile.maxConcurrentBranches ?? 0) * weights.max
  );
}

function computeCurrentLevel(
  score: number,
  profile: ParallelismProfile,
  config: ParallelismThresholdsConfig,
): AiddLevelValue {
  const ordered: Array<[AiddLevelValue, ParallelismLevelConfig]> = [
    [AiddLevelValue.gold, config.levels.gold],
    [AiddLevelValue.silver, config.levels.silver],
    [AiddLevelValue.copper, config.levels.copper],
    [AiddLevelValue.green, config.levels.green],
    [AiddLevelValue.blue, config.levels.blue],
    [AiddLevelValue.red, config.levels.red],
  ];
  for (const [level, cfg] of ordered) {
    if (score < cfg.minScore) continue;
    if (cfg.requiresWorktree && profile.hasWorktreeInclude !== true) continue;
    return level;
  }
  return AiddLevelValue.white;
}

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function getLevelConfig(
  config: ParallelismThresholdsConfig,
  level: AiddLevelValue,
): ParallelismLevelConfig | null {
  return (config.levels as Partial<Record<AiddLevelValue, ParallelismLevelConfig>>)[level] ?? null;
}

function buildSignals(
  score: number,
  profile: ParallelismProfile,
  nextCfg: ParallelismLevelConfig,
): Signal[] {
  const scoreValidated = score >= nextCfg.minScore;
  const signals: Signal[] = [
    {
      name: 'medianConcurrentBranches',
      validated: scoreValidated,
      value: profile.medianConcurrentBranches,
    },
    {
      name: 'maxConcurrentBranches',
      validated: scoreValidated,
      value: profile.maxConcurrentBranches,
    },
  ];
  if (nextCfg.requiresWorktree) {
    signals.push({
      name: 'hasWorktreeInclude',
      validated: profile.hasWorktreeInclude === true,
      value: profile.hasWorktreeInclude,
    });
  }
  return signals;
}

class ParallelismSignalDetectorService implements IAxisSignalDetector<ParallelismProfile> {
  constructor(private readonly config: ParallelismThresholdsConfig) {}

  detect(profile: ParallelismProfile): AxisSignalMatrix {
    const score = computeScore(profile, this.config.weights);
    const current = computeCurrentLevel(score, profile, this.config);
    const next = getNextLevel(current);

    const targetCfg = getLevelConfig(this.config, next ?? current);
    return {
      axis: 'parallelism',
      currentLevel: current,
      nextLevel: next,
      signals: targetCfg ? buildSignals(score, profile, targetCfg) : [],
    };
  }
}

export function createParallelismSignalDetector(
  config: ParallelismThresholdsConfig,
): IAxisSignalDetector<ParallelismProfile> {
  return new ParallelismSignalDetectorService(config);
}
