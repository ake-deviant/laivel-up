import { AiddLevelValue } from '../entities/aidd-level-value';
import { HarnessProfile } from '../entities/harness-profile';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';

export interface CapabilityGatesHarnessConfig {
  maxCiRunsToGreen: number;
}

export const defaultCapabilityGatesHarnessConfig: CapabilityGatesHarnessConfig = {
  maxCiRunsToGreen: 1,
};

export function hasStructuredContext(profile: HarnessProfile): boolean {
  const context = profile.contextEngineering;
  if (context === null) return false;

  return [
    context.docsContextCount,
    context.docsSpecsCount,
    context.docsPlansCount,
    context.memoryCount,
    context.tasksCount,
  ].some((value) => (value ?? 0) > 0);
}

export function hasOperationalConfiguration(profile: HarnessProfile): boolean {
  const configuration = profile.aiConfiguration;
  if (configuration === null) return false;

  return [
    configuration.settingsJson,
    configuration.agentsCount,
    configuration.skillsCount,
    configuration.hooksCount,
    configuration.rulesCount,
  ].some((value) => (value ?? 0) > 0);
}

export class CapabilityGatesHarnessLevelCalculator implements IHarnessLevelCalculator {
  constructor(private readonly config: CapabilityGatesHarnessConfig) {}

  calculate(profile: HarnessProfile): AiddLevelValue {
    const hasContextAnchor = (profile.contextEngineering?.claudeMd ?? 0) > 0;
    const hasBlueCapabilities = hasContextAnchor && hasStructuredContext(profile);
    const hasAgentContract = (profile.aiConfiguration?.agentsMd ?? 0) > 0;
    const hasCopperCapabilities =
      hasBlueCapabilities && hasAgentContract && hasOperationalConfiguration(profile);
    const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;

    if (hasCopperCapabilities && ciRuns !== null && ciRuns <= this.config.maxCiRunsToGreen) {
      return AiddLevelValue.gold;
    }
    if (hasCopperCapabilities) return AiddLevelValue.copper;
    if (hasBlueCapabilities) return AiddLevelValue.blue;

    const aiCoauthoredRatio = profile.aiConfiguration?.aiCoauthoredRatio ?? null;
    if (aiCoauthoredRatio !== null && aiCoauthoredRatio > 0) return AiddLevelValue.red;

    return AiddLevelValue.white;
  }
}

export function createCapabilityGatesHarnessLevelCalculator(
  config: CapabilityGatesHarnessConfig = defaultCapabilityGatesHarnessConfig,
): IHarnessLevelCalculator {
  return new CapabilityGatesHarnessLevelCalculator(config);
}
