import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { Signal } from '../entities/signal';
import { HarnessProfile } from '../entities/harness-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import { HarnessThresholdsConfig } from './harness-level-calculator.service';
import { ContextEngineeringProfile } from '../entities/context-engineering-profile';
import { AiConfigurationProfile } from '../entities/ai-configuration-profile';

// green and silver are not produced by the harness calculator
const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.white,
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.copper,
  AiddLevelValue.gold,
];

function computeContextEngineeringScore(
  ce: ContextEngineeringProfile | null,
  config: HarnessThresholdsConfig,
): number {
  if (!ce) return 0;
  const w = config.contextEngineeringWeights;
  return (
    (ce.claudeMd ?? 0) * w.claudeMd +
    (ce.docsContextCount ?? 0) * w.docsContextCount +
    (ce.docsSpecsCount ?? 0) * w.docsSpecsCount +
    (ce.docsBrainstormCount ?? 0) * w.docsBrainstormCount +
    (ce.docsPlansCount ?? 0) * w.docsPlansCount +
    (ce.memoryCount ?? 0) * w.memoryCount +
    (ce.tasksCount ?? 0) * w.tasksCount
  );
}

function computeAiConfigurationScore(
  ai: AiConfigurationProfile | null,
  config: HarnessThresholdsConfig,
): number {
  if (!ai) return 0;
  const w = config.aiConfigurationWeights;
  return (
    (ai.agentsMd ?? 0) * w.agentsMd +
    (ai.settingsJson ?? 0) * w.settingsJson +
    (ai.agentsCount ?? 0) * w.agentsCount +
    (ai.skillsCount ?? 0) * w.skillsCount +
    (ai.hooksCount ?? 0) * w.hooksCount +
    (ai.rulesCount ?? 0) * w.rulesCount
  );
}

function computeCurrentLevel(
  profile: HarnessProfile,
  config: HarnessThresholdsConfig,
): AiddLevelValue {
  const ceScore = computeContextEngineeringScore(profile.contextEngineering, config);
  const aiScore = computeAiConfigurationScore(profile.aiConfiguration, config);

  if (ceScore >= config.levels.blue.minContextEngineeringScore) {
    if (aiScore >= config.levels.copper.minAiConfigurationScore) {
      const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;
      if (ciRuns !== null && ciRuns <= config.levels.gold.maxCiRunsToGreen)
        return AiddLevelValue.gold;
      return AiddLevelValue.copper;
    }
    return AiddLevelValue.blue;
  }

  const aiCoauthoredRatio = profile.aiConfiguration?.aiCoauthoredRatio ?? null;
  if (aiCoauthoredRatio !== null && aiCoauthoredRatio > 0) return AiddLevelValue.red;
  return AiddLevelValue.white;
}

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function buildSignals(
  profile: HarnessProfile,
  next: AiddLevelValue,
  config: HarnessThresholdsConfig,
): Signal[] {
  if (next === AiddLevelValue.blue) {
    const score = computeContextEngineeringScore(profile.contextEngineering, config);
    return [
      {
        name: 'contextEngineeringScore',
        validated: score >= config.levels.blue.minContextEngineeringScore,
        value: score,
      },
    ];
  }

  if (next === AiddLevelValue.copper) {
    const score = computeAiConfigurationScore(profile.aiConfiguration, config);
    return [
      {
        name: 'aiConfigurationScore',
        validated: score >= config.levels.copper.minAiConfigurationScore,
        value: score,
      },
    ];
  }

  if (next === AiddLevelValue.gold) {
    const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;
    return [
      {
        name: 'ciMedianRunsToGreen',
        validated: ciRuns !== null && ciRuns <= config.levels.gold.maxCiRunsToGreen,
        value: ciRuns,
      },
    ];
  }

  return [];
}

class HarnessSignalDetectorService implements IAxisSignalDetector<HarnessProfile> {
  constructor(private readonly config: HarnessThresholdsConfig) {}

  detect(profile: HarnessProfile): AxisSignalMatrix {
    const current = computeCurrentLevel(profile, this.config);
    const next = getNextLevel(current);

    if (next === null) {
      const ceScore = computeContextEngineeringScore(profile.contextEngineering, this.config);
      const aiScore = computeAiConfigurationScore(profile.aiConfiguration, this.config);
      const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;
      return {
        axis: 'harness',
        currentLevel: current,
        nextLevel: null,
        signals: [
          { name: 'contextEngineeringScore', validated: true, value: ceScore },
          { name: 'aiConfigurationScore', validated: true, value: aiScore },
          { name: 'ciMedianRunsToGreen', validated: true, value: ciRuns },
        ],
      };
    }

    return {
      axis: 'harness',
      currentLevel: current,
      nextLevel: next,
      signals: buildSignals(profile, next, this.config),
    };
  }
}

export function createHarnessSignalDetector(
  config: HarnessThresholdsConfig,
): IAxisSignalDetector<HarnessProfile> {
  return new HarnessSignalDetectorService(config);
}
