import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import {
  createCapabilityGatesHarnessLevelCalculator,
  defaultCapabilityGatesHarnessConfig,
} from '../../../domain/services/capability-gates-harness-level-calculator.service';

const calculator = createCapabilityGatesHarnessLevelCalculator(defaultCapabilityGatesHarnessConfig);

function profile(overrides: Partial<HarnessProfile> = {}): HarnessProfile {
  return {
    contextEngineering: null,
    aiConfiguration: null,
    loops: null,
    ...overrides,
  };
}

function context(overrides: Partial<NonNullable<HarnessProfile['contextEngineering']>> = {}) {
  return {
    claudeMd: 0,
    docsContextCount: 0,
    docsSpecsCount: 0,
    docsBrainstormCount: 0,
    docsPlansCount: 0,
    memoryCount: 0,
    tasksCount: 0,
    ...overrides,
  };
}

function configuration(overrides: Partial<NonNullable<HarnessProfile['aiConfiguration']>> = {}) {
  return {
    agentsMd: 0,
    settingsJson: 0,
    agentsCount: 0,
    skillsCount: 0,
    hooksCount: 0,
    rulesCount: 0,
    aiCoauthoredRatio: 0.5,
    ...overrides,
  };
}

describe('CapabilityGatesHarnessLevelCalculator', () => {
  it('when no AI signal is present — returns white', () => {
    expect(calculator.calculate(profile())).toBe(AiddLevelValue.white);
  });

  it('when AI coauthoring is present without capabilities — returns red', () => {
    const result = calculator.calculate(
      profile({ aiConfiguration: configuration({ aiCoauthoredRatio: 0.5 }) }),
    );

    expect(result).toBe(AiddLevelValue.red);
  });

  it('when many context files exist without CLAUDE.md — does not compensate the missing gate', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ docsSpecsCount: 50, memoryCount: 50 }),
        aiConfiguration: configuration(),
      }),
    );

    expect(result).toBe(AiddLevelValue.red);
  });

  it('when CLAUDE.md exists without structured context — remains red', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1 }),
        aiConfiguration: configuration(),
      }),
    );

    expect(result).toBe(AiddLevelValue.red);
  });

  it('when context anchor and structured context exist — returns blue', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, docsPlansCount: 1 }),
        aiConfiguration: configuration(),
      }),
    );

    expect(result).toBe(AiddLevelValue.blue);
  });

  it('when AGENTS.md exists without operational configuration — remains blue', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, memoryCount: 1 }),
        aiConfiguration: configuration({ agentsMd: 1 }),
      }),
    );

    expect(result).toBe(AiddLevelValue.blue);
  });

  it('when operational configuration exists without AGENTS.md — remains blue', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, tasksCount: 1 }),
        aiConfiguration: configuration({ hooksCount: 10 }),
      }),
    );

    expect(result).toBe(AiddLevelValue.blue);
  });

  it('when blue gates and configuration gates exist — returns copper', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, docsSpecsCount: 1 }),
        aiConfiguration: configuration({ agentsMd: 1, skillsCount: 1 }),
      }),
    );

    expect(result).toBe(AiddLevelValue.copper);
  });

  it('when all gates and CI loop exist — returns gold', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, docsContextCount: 1 }),
        aiConfiguration: configuration({ agentsMd: 1, settingsJson: 1 }),
        loops: { ciMedianRunsToGreen: 1 },
      }),
    );

    expect(result).toBe(AiddLevelValue.gold);
  });

  it('when CI exceeds the gate — remains copper', () => {
    const result = calculator.calculate(
      profile({
        contextEngineering: context({ claudeMd: 1, docsContextCount: 1 }),
        aiConfiguration: configuration({ agentsMd: 1, rulesCount: 1 }),
        loops: { ciMedianRunsToGreen: 2 },
      }),
    );

    expect(result).toBe(AiddLevelValue.copper);
  });
});
