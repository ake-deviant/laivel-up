import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { ParallelismImprovementOpportunityDetector } from '../../../domain/services/parallelism-improvement-opportunity-detector';
import {
  createParallelismLevelCalculator,
  createWeightedParallelismLevelCalculator,
  MedianOnlyParallelismScoringStrategy,
} from '../../../domain/services/parallelism-level-calculator.service';
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
      // arrange — score = 5*5 + 5*1 = 30, worktree=true → gold
      const profile = toParallelism({
        maxConcurrentBranches: 5,
        medianConcurrentBranches: 5,
        hasWorktreeInclude: true,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when score meets gold threshold but worktree is missing', () => {
    // score = 6*5 = 30, no worktree → silver
    const profile = toParallelism({
      maxConcurrentBranches: 0,
      medianConcurrentBranches: 6,
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
        currentLevel: AiddLevelValue.silver,
        resultingLevel: AiddLevelValue.gold,
        levelGain: 1,
      });
    });

    it('does not surface a score field when worktree is the only blocker', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities[0].field).toBe('hasWorktreeInclude');
      expect(opportunities).toHaveLength(1);
    });
  });

  describe('when median is too low and worktree is already enabled (blue profile)', () => {
    // score = 2*5 = 10, worktree=true → blue (gold requires score ≥ 30)
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
      // median=6 → score=30, worktree=true → gold

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
    // score = 1*5 = 5 → white; enabling worktree would not unlock gold (score < 30)
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

describe('ParallelismImprovementOpportunityDetector with median-only strategy', () => {
  it('when only maximum reaches gold score — does not surface worktree', () => {
    // arrange
    const strategy = new MedianOnlyParallelismScoringStrategy(
      defaultParallelismThresholdsConfig.weights.median,
    );
    const calculator = createParallelismLevelCalculator(
      strategy,
      defaultParallelismThresholdsConfig,
    );
    const detector = new ParallelismImprovementOpportunityDetector(
      calculator,
      defaultParallelismThresholdsConfig,
      strategy,
    );
    const profile = toParallelism({
      medianConcurrentBranches: 1,
      maxConcurrentBranches: 100,
      hasWorktreeInclude: false,
    });

    // act
    const opportunities = detector.detect(profile);

    // assert
    expect(opportunities.find((item) => item.field === 'hasWorktreeInclude')).toBeUndefined();
  });
});
