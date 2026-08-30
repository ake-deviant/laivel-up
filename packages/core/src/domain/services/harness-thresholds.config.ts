import { HarnessThresholdsConfig } from './harness-level-calculator.service';

export const defaultHarnessThresholdsConfig: HarnessThresholdsConfig = {
  contextEngineeringWeights: {
    claudeMd: 4,
    docsContextCount: 2,
    docsSpecsCount: 3,
    docsBrainstormCount: 2,
    docsPlansCount: 3,
    memoryCount: 4,
    tasksCount: 3,
  },
  aiConfigurationWeights: {
    agentsMd: 3,
    settingsJson: 2,
    agentsCount: 3,
    skillsCount: 3,
    hooksCount: 4,
    rulesCount: 4,
  },
  levels: {
    blue: { minContextEngineeringScore: 2 },
    copper: { minAiConfigurationScore: 2 },
    gold: { maxCiRunsToGreen: 1 },
  },
};
