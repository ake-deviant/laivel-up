import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { HarnessProfile } from '../entities/harness-profile';
import { Signal } from '../entities/signal';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import {
  CapabilityGatesHarnessConfig,
  createCapabilityGatesHarnessLevelCalculator,
  defaultCapabilityGatesHarnessConfig,
  hasOperationalConfiguration,
  hasStructuredContext,
} from './capability-gates-harness-level-calculator.service';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';

const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.white,
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.copper,
  AiddLevelValue.gold,
];

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function buildSignals(
  profile: HarnessProfile,
  target: AiddLevelValue,
  config: CapabilityGatesHarnessConfig,
): Signal[] {
  if (target === AiddLevelValue.red) {
    const ratio = profile.aiConfiguration?.aiCoauthoredRatio ?? null;
    return [{ name: 'aiCoauthoredRatio', validated: ratio !== null && ratio > 0, value: ratio }];
  }

  if (target === AiddLevelValue.blue) {
    const claudeMd = profile.contextEngineering?.claudeMd ?? null;
    return [
      { name: 'claudeMd', validated: (claudeMd ?? 0) > 0, value: claudeMd },
      {
        name: 'structuredContext',
        validated: hasStructuredContext(profile),
        value: hasStructuredContext(profile),
      },
    ];
  }

  if (target === AiddLevelValue.copper) {
    const agentsMd = profile.aiConfiguration?.agentsMd ?? null;
    return [
      { name: 'agentsMd', validated: (agentsMd ?? 0) > 0, value: agentsMd },
      {
        name: 'operationalConfiguration',
        validated: hasOperationalConfiguration(profile),
        value: hasOperationalConfiguration(profile),
      },
    ];
  }

  if (target === AiddLevelValue.gold) {
    const ciRuns = profile.loops?.ciMedianRunsToGreen ?? null;
    return [
      {
        name: 'ciMedianRunsToGreen',
        validated: ciRuns !== null && ciRuns <= config.maxCiRunsToGreen,
        value: ciRuns,
      },
    ];
  }

  return [];
}

class CapabilityGatesHarnessSignalDetector implements IAxisSignalDetector<HarnessProfile> {
  constructor(
    private readonly calculator: IHarnessLevelCalculator,
    private readonly config: CapabilityGatesHarnessConfig,
  ) {}

  detect(profile: HarnessProfile): AxisSignalMatrix {
    const current = this.calculator.calculate(profile);
    const next = getNextLevel(current);
    const targets = next === null ? LEVEL_ORDER.slice(2) : [next];

    return {
      axis: 'harness',
      currentLevel: current,
      nextLevel: next,
      signals: targets.flatMap((target) => buildSignals(profile, target, this.config)),
    };
  }
}

export function createCapabilityGatesHarnessSignalDetector(
  config: CapabilityGatesHarnessConfig = defaultCapabilityGatesHarnessConfig,
  calculator: IHarnessLevelCalculator = createCapabilityGatesHarnessLevelCalculator(config),
): IAxisSignalDetector<HarnessProfile> {
  return new CapabilityGatesHarnessSignalDetector(calculator, config);
}
