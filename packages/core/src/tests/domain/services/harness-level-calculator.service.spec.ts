import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { createHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { harnessThresholdsConfigFixture } from '../../fixtures/harness-thresholds-config.fixture';

const cfg = harnessThresholdsConfigFixture;

const toProfile = (
  contextEngineering: HarnessProfile['contextEngineering'],
  aiConfiguration: HarnessProfile['aiConfiguration'],
  loops: HarnessProfile['loops'],
): HarnessProfile => ({ contextEngineering, aiConfiguration, loops });

describe('Harness level calculator', () => {
  describe('when no harness signals are present', () => {
    it('assigns White level when all sub-profiles are null', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(null, null, null);

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.white);
    });

    it('assigns White level when all counts are zero', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: 0,
        },
        { ciMedianRunsToGreen: null },
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.white);
    });

    it('assigns White level when aiCoauthoredRatio is null and no context files', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.white);
    });
  });

  describe('when AI is used via prompts but no context files are set up', () => {
    it('assigns Red level when aiCoauthoredRatio > 0 and context engineering is null', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        null,
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: 0.5,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.red);
    });

    it('assigns Red level when aiCoauthoredRatio > 0 and all context engineering counts are zero', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: 1,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.red);
    });

    it('assigns White level when aiCoauthoredRatio is zero and no context files', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        null,
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: 0,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.white);
    });
  });

  describe('when context engineering is set up but no AI configuration', () => {
    it('assigns Blue level when CLAUDE.md is found', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        null,
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.blue);
    });

    it('assigns Blue level when a memory file is found', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 1,
          tasksCount: 0,
        },
        null,
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.blue);
    });

    it('assigns Blue level when multiple CE files are found but no aiConfiguration', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 2,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        null,
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.blue);
    });
  });

  describe('when context engineering and AI configuration are both set up', () => {
    it('assigns Copper level when CLAUDE.md and AGENTS.md are found', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 1,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.copper);
    });

    it('assigns Copper level when CLAUDE.md and at least one rule are found', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 1,
          aiCoauthoredRatio: null,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.copper);
    });

    it('assigns Copper level when memory files and hooks are found', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 3,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 1,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.copper);
    });

    it('assigns Blue level when CE is present but AI configuration score is below threshold', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        null,
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.blue);
    });
  });

  describe('when context engineering, AI configuration, and loops are all set up', () => {
    it('assigns Gold level when CE, behavior, and ciMedianRunsToGreen = 1 are present', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 1,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        { ciMedianRunsToGreen: 1 },
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.gold);
    });

    it('assigns Gold level when CE, behavior, and ciMedianRunsToGreen = 0 are present', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 0,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 3,
          tasksCount: 0,
        },
        {
          agentsMd: 0,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 1,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        { ciMedianRunsToGreen: 0 },
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.gold);
    });

    it('assigns Copper level when CE and behavior are present but ciMedianRunsToGreen > threshold', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 1,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        { ciMedianRunsToGreen: 2 },
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.copper);
    });

    it('assigns Copper level when CE and behavior are present but ciMedianRunsToGreen is null', () => {
      // arrange
      const calculator = createHarnessLevelCalculator(cfg);
      const profile = toProfile(
        {
          claudeMd: 1,
          docsContextCount: 0,
          docsSpecsCount: 0,
          docsBrainstormCount: 0,
          docsPlansCount: 0,
          memoryCount: 0,
          tasksCount: 0,
        },
        {
          agentsMd: 1,
          settingsJson: 0,
          agentsCount: 0,
          skillsCount: 0,
          hooksCount: 0,
          rulesCount: 0,
          aiCoauthoredRatio: null,
        },
        { ciMedianRunsToGreen: null },
      );

      // act
      const result = calculator.calculate(profile);

      // assert
      expect(result).toBe(AiddLevelValue.copper);
    });
  });
});
