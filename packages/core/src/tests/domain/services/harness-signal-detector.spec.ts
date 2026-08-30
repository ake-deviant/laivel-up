import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { createHarnessSignalDetector } from '../../../domain/services/harness-signal-detector';
import { harnessThresholdsConfigFixture as cfg } from '../../fixtures/harness-thresholds-config.fixture';

const emptyProfile: HarnessProfile = {
  contextEngineering: null,
  aiConfiguration: null,
  loops: null,
};

describe('Harness signal detector', () => {
  describe('when no data', () => {
    it('when profile is empty — returns white with next level red and no signals', () => {
      // arrange
      const detector = createHarnessSignalDetector(cfg);

      // act
      const matrix = detector.detect(emptyProfile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.white);
      expect(matrix.nextLevel).toBe(AiddLevelValue.red);
      expect(matrix.signals).toHaveLength(0);
    });
  });

  describe('when level is red', () => {
    it('when AI usage detected but no context engineering — returns red with next blue and contextEngineeringScore signal', () => {
      // arrange
      const detector = createHarnessSignalDetector(cfg);
      const profile: HarnessProfile = {
        contextEngineering: null,
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
      expect(matrix.signals).toHaveLength(1);
      expect(matrix.signals[0].name).toBe('contextEngineeringScore');
      expect(matrix.signals[0].validated).toBe(false);
      expect(matrix.signals[0].value).toBe(0);
    });
  });

  describe('when level is blue', () => {
    it('when context engineering score meets blue threshold — returns blue with next copper and aiConfigurationScore signal', () => {
      // arrange
      const detector = createHarnessSignalDetector(cfg);
      // fixture: blue.minContextEngineeringScore = 2, claudeMd weight = 4 → score = 4 ≥ 2
      const profile: HarnessProfile = {
        contextEngineering: {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
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
      expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
      expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals[0].name).toBe('aiConfigurationScore');
      expect(matrix.signals[0].validated).toBe(false); // score 0 < copper.minAiConfigurationScore 2
    });
  });

  describe('when level is copper', () => {
    it('when copper met but CI data missing — returns copper with next gold and ciMedianRunsToGreen unvalidated', () => {
      // arrange
      const detector = createHarnessSignalDetector(cfg);
      const profile: HarnessProfile = {
        contextEngineering: {
          claudeMd: 1,
          docsContextCount: 0,
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
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.nextLevel).toBe(AiddLevelValue.gold);
      expect(matrix.signals[0]).toEqual({
        name: 'ciMedianRunsToGreen',
        validated: false,
        value: null,
      });
    });
  });

  describe('when level is gold', () => {
    it('when gold is reached — returns gold with null next level and all validated signals', () => {
      // arrange
      const detector = createHarnessSignalDetector(cfg);
      const profile: HarnessProfile = {
        contextEngineering: {
          claudeMd: 1,
          docsContextCount: 0,
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
        loops: { ciMedianRunsToGreen: 1 },
      };

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.gold);
      expect(matrix.nextLevel).toBeNull();
      expect(matrix.signals).toHaveLength(3);
      expect(matrix.signals[0]).toEqual({
        name: 'contextEngineeringScore',
        validated: true,
        value: 4,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'aiConfigurationScore',
        validated: true,
        value: 3,
      });
      expect(matrix.signals[2]).toEqual({ name: 'ciMedianRunsToGreen', validated: true, value: 1 });
    });
  });
});
