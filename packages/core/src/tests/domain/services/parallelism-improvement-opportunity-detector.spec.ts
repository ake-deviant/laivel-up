import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { ParallelismImprovementOpportunityDetector } from '../../../domain/services/parallelism-improvement-opportunity-detector';
import { createWeightedParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { defaultParallelismThresholdsConfig } from '../../../domain/services/parallelism-thresholds.config';

const toParallelism = (overrides: Partial<ParallelismProfile> = {}): ParallelismProfile => ({
  maxConcurrentBranches: null,
  medianConcurrentBranches: null,
  hasWorktreeInclude: null,
  ...overrides,
});

describe('ParallelismImprovementOpportunityDetector', () => {
  const detector = new ParallelismImprovementOpportunityDetector(
    createWeightedParallelismLevelCalculator(defaultParallelismThresholdsConfig),
    defaultParallelismThresholdsConfig,
  );

  describe('when all fields are null', () => {
    it('returns no opportunities', () => {
      // arrange
      const profile = toParallelism();

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when already at gold', () => {
    it('returns no opportunities', () => {
      // arrange — score = 4*5 + 3*1 = 23 ≥ 20, worktree=true → gold
      const profile = toParallelism({
        maxConcurrentBranches: 3,
        medianConcurrentBranches: 4,
        hasWorktreeInclude: true,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when score meets gold threshold but worktree is missing (copper profile)', () => {
    // score = 4*5 + 0*1 = 20 ≥ 20, no worktree → copper
    const profile = toParallelism({
      maxConcurrentBranches: 0,
      medianConcurrentBranches: 4,
      hasWorktreeInclude: false,
    });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(profile);
    });

    it('when worktree is the only blocker for gold — surfaces hasWorktreeInclude reaching gold', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities.find((o) => o.field === 'hasWorktreeInclude')).toMatchObject({
        axis: 'parallelism',
        field: 'hasWorktreeInclude',
        currentLevel: AiddLevelValue.copper,
        resultingLevel: AiddLevelValue.gold,
        levelGain: 2,
      });
    });

    it('when median can reach silver without worktree — also surfaces medianConcurrentBranches', () => {
      // arrange / act — done in beforeEach
      // median=5 → score=25 ≥ 25, no worktree → silver

      // assert
      expect(opportunities.find((o) => o.field === 'medianConcurrentBranches')).toMatchObject({
        axis: 'parallelism',
        field: 'medianConcurrentBranches',
        currentLevel: AiddLevelValue.copper,
        resultingLevel: AiddLevelValue.silver,
        levelGain: 1,
      });
    });

    it('ranks hasWorktreeInclude before medianConcurrentBranches — gold outranks silver', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities[0].field).toBe('hasWorktreeInclude');
      expect(opportunities[1].field).toBe('medianConcurrentBranches');
    });
  });

  describe('when median is too low and worktree is already enabled (blue profile)', () => {
    // score = 2*5 = 10 ≥ 10, worktree=true → blue (gold requires score ≥ 20)
    const profile = toParallelism({
      maxConcurrentBranches: 0,
      medianConcurrentBranches: 2,
      hasWorktreeInclude: true,
    });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(profile);
    });

    it('when increasing median reaches gold — surfaces medianConcurrentBranches reaching gold', () => {
      // arrange / act — done in beforeEach
      // median=4 → score=20, worktree=true → gold

      // assert
      expect(opportunities.find((o) => o.field === 'medianConcurrentBranches')).toMatchObject({
        axis: 'parallelism',
        field: 'medianConcurrentBranches',
        currentLevel: AiddLevelValue.blue,
        resultingLevel: AiddLevelValue.gold,
        levelGain: 4,
      });
    });

    it('does not surface hasWorktreeInclude — worktree already enabled', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities.find((o) => o.field === 'hasWorktreeInclude')).toBeUndefined();
    });
  });

  describe('when score is below gold threshold and worktree is false', () => {
    // score = 1*5 = 5 → white; enabling worktree would not unlock gold (score < 20)
    const profile = toParallelism({
      maxConcurrentBranches: 0,
      medianConcurrentBranches: 1,
      hasWorktreeInclude: false,
    });

    it('does not surface hasWorktreeInclude — score too low to unlock gold', () => {
      // arrange

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities.find((o) => o.field === 'hasWorktreeInclude')).toBeUndefined();
    });
  });
});
