import { AiddLevelValue } from '../entities/aidd-level-value';
import { AiConfigurationProfile } from '../entities/ai-configuration-profile';
import { ContextEngineeringProfile } from '../entities/context-engineering-profile';
import { HarnessProfile } from '../entities/harness-profile';

export interface HarnessContextEngineeringWeights {
  claudeMd: number;
  docsContextCount: number;
  docsSpecsCount: number;
  docsBrainstormCount: number;
  docsPlansCount: number;
  memoryCount: number;
  tasksCount: number;
}

export interface HarnessAiConfigurationWeights {
  agentsMd: number;
  settingsJson: number;
  agentsCount: number;
  skillsCount: number;
  hooksCount: number;
  rulesCount: number;
}

export interface HarnessThresholdsConfig {
  contextEngineeringWeights: HarnessContextEngineeringWeights;
  aiConfigurationWeights: HarnessAiConfigurationWeights;
  levels: {
    blue: { minContextEngineeringScore: number };
    copper: { minAiConfigurationScore: number };
    gold: { maxCiRunsToGreen: number };
  };
}

export interface IHarnessLevelCalculator {
  calculate(profile: HarnessProfile): AiddLevelValue;
}

function computeContextEngineeringScore(
  ce: ContextEngineeringProfile | null,
  weights: HarnessContextEngineeringWeights,
): number {
  if (ce === null) return 0;
  return (
    (ce.claudeMd ?? 0) * weights.claudeMd +
    (ce.docsContextCount ?? 0) * weights.docsContextCount +
    (ce.docsSpecsCount ?? 0) * weights.docsSpecsCount +
    (ce.docsBrainstormCount ?? 0) * weights.docsBrainstormCount +
    (ce.docsPlansCount ?? 0) * weights.docsPlansCount +
    (ce.memoryCount ?? 0) * weights.memoryCount +
    (ce.tasksCount ?? 0) * weights.tasksCount
  );
}

function computeAiConfigurationScore(
  ai: AiConfigurationProfile | null,
  weights: HarnessAiConfigurationWeights,
): number {
  if (ai === null) return 0;
  return (
    (ai.agentsMd ?? 0) * weights.agentsMd +
    (ai.settingsJson ?? 0) * weights.settingsJson +
    (ai.agentsCount ?? 0) * weights.agentsCount +
    (ai.skillsCount ?? 0) * weights.skillsCount +
    (ai.hooksCount ?? 0) * weights.hooksCount +
    (ai.rulesCount ?? 0) * weights.rulesCount
  );
}

class HarnessLevelCalculatorService implements IHarnessLevelCalculator {
  constructor(private readonly config: HarnessThresholdsConfig) {}

  calculate(profile: HarnessProfile): AiddLevelValue {
    const ceScore = computeContextEngineeringScore(
      profile.contextEngineering,
      this.config.contextEngineeringWeights,
    );
    const aiScore = computeAiConfigurationScore(
      profile.aiConfiguration,
      this.config.aiConfigurationWeights,
    );
    const aiCoauthoredRatio = profile.aiConfiguration?.aiCoauthoredRatio ?? null;

    if (ceScore >= this.config.levels.blue.minContextEngineeringScore) {
      if (aiScore >= this.config.levels.copper.minAiConfigurationScore) {
        const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;
        if (ciRuns !== null && ciRuns <= this.config.levels.gold.maxCiRunsToGreen) {
          return AiddLevelValue.gold;
        }
        return AiddLevelValue.copper;
      }
      return AiddLevelValue.blue;
    }

    if (aiCoauthoredRatio !== null && aiCoauthoredRatio > 0) {
      return AiddLevelValue.red;
    }

    return AiddLevelValue.white;
  }
}

export function createHarnessLevelCalculator(
  config: HarnessThresholdsConfig,
): IHarnessLevelCalculator {
  return new HarnessLevelCalculatorService(config);
}
