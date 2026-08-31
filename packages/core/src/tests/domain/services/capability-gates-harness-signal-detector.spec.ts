import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { createCapabilityGatesHarnessSignalDetector } from '../../../domain/services/capability-gates-harness-signal-detector';

const detector = createCapabilityGatesHarnessSignalDetector();

describe('CapabilityGatesHarnessSignalDetector', () => {
  it('when blue gates are incomplete — reports each mandatory capability', () => {
    // arrange
    const profile: HarnessProfile = {
      contextEngineering: {
        claudeMd: 1,
        docsContextCount: 0,
        docsSpecsCount: 0,
        docsBrainstormCount: 10,
        docsPlansCount: 0,
        memoryCount: 0,
        tasksCount: 0,
      },
      aiConfiguration: {
        agentsMd: 0,
        settingsJson: 0,
        agentsCount: 0,
        skillsCount: 0,
        hooksCount: 0,
        rulesCount: 0,
        aiCoauthoredRatio: 0.5,
      },
      loops: null,
    };

    // act
    const matrix = detector.detect(profile);

    // assert
    expect(matrix.currentLevel).toBe(AiddLevelValue.red);
    expect(matrix.nextLevel).toBe(AiddLevelValue.blue);
    expect(matrix.signals).toEqual([
      { name: 'claudeMd', validated: true, value: 1 },
      { name: 'structuredContext', validated: false, value: false },
    ]);
  });

  it('when copper gates are incomplete — reports agent contract and operational configuration', () => {
    // arrange
    const profile: HarnessProfile = {
      contextEngineering: {
        claudeMd: 1,
        docsContextCount: 1,
        docsSpecsCount: 0,
        docsBrainstormCount: 0,
        docsPlansCount: 0,
        memoryCount: 0,
        tasksCount: 0,
      },
      aiConfiguration: {
        agentsMd: 1,
        settingsJson: 0,
        agentsCount: 0,
        skillsCount: 0,
        hooksCount: 0,
        rulesCount: 0,
        aiCoauthoredRatio: 0.5,
      },
      loops: null,
    };

    // act
    const matrix = detector.detect(profile);

    // assert
    expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
    expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
    expect(matrix.signals).toEqual([
      { name: 'agentsMd', validated: true, value: 1 },
      { name: 'operationalConfiguration', validated: false, value: false },
    ]);
  });
});
