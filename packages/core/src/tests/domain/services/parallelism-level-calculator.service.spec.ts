import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import {
  createParallelismLevelCalculator,
  createWeightedParallelismLevelCalculator,
  MedianOnlyParallelismScoringStrategy,
} from '../../../domain/services/parallelism-level-calculator.service';
import { parallelismThresholdsConfigFixture } from '../../fixtures/parallelism-thresholds-config.fixture';

const cfg = parallelismThresholdsConfigFixture;

const toProfile = (
  medianConcurrentBranches: number | null,
  maxConcurrentBranches: number | null,
  hasWorktreeInclude: boolean | null,
): ParallelismProfile => ({ medianConcurrentBranches, maxConcurrentBranches, hasWorktreeInclude });

describe('Parallelism level calculator', () => {
  it.each([
    {
      label: 'no data',
      profile: toProfile(null, null, null),
      expected: AiddLevelValue.white,
    },
    {
      label: 'score below red threshold',
      profile: toProfile(1, 1, null),
      expected: AiddLevelValue.white,
    },
    {
      label: 'score at red threshold without worktree',
      profile: toProfile(1, 2, false),
      expected: AiddLevelValue.red,
    },
    {
      label: 'score at blue threshold without worktree',
      profile: toProfile(2, 0, false),
      expected: AiddLevelValue.blue,
    },
    {
      label: 'score at green threshold without worktree',
      profile: toProfile(3, 0, false),
      expected: AiddLevelValue.green,
    },
    {
      label: 'score at copper threshold without worktree',
      profile: toProfile(4, 0, false),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'score at gold threshold with worktree',
      profile: toProfile(4, 0, true),
      expected: AiddLevelValue.gold,
    },
    {
      label: 'score at silver threshold without worktree',
      profile: toProfile(5, 0, false),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'high score without worktree',
      profile: toProfile(4, 7, false),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'high score with worktree',
      profile: toProfile(4, 7, true),
      expected: AiddLevelValue.gold,
    },
  ])('when $label — assigns $expected level', ({ profile, expected }) => {
    // arrange
    const calculator = createWeightedParallelismLevelCalculator(cfg);

    // act
    const result = calculator.calculate(profile);

    // assert
    expect(result).toBe(expected);
  });
});

describe('MedianOnlyParallelismScoringStrategy', () => {
  const strategy = new MedianOnlyParallelismScoringStrategy(cfg.weights.median);
  const calculator = createParallelismLevelCalculator(strategy, cfg);

  it('when maximum changes — keeps the same score', () => {
    // arrange
    const firstProfile = toProfile(2, 0, false);
    const secondProfile = toProfile(2, 100, false);

    // act
    const firstScore = strategy.score(firstProfile);
    const secondScore = strategy.score(secondProfile);

    // assert
    expect(firstScore).toBe(10);
    expect(secondScore).toBe(10);
  });

  it('when median is null — returns zero', () => {
    // arrange
    const profile = toProfile(null, 100, false);

    // act
    const score = strategy.score(profile);

    // assert
    expect(score).toBe(0);
  });

  it('when a maximum peak would reach silver with weighted — remains blue', () => {
    // arrange
    const profile = toProfile(2, 20, false);

    // act
    const level = calculator.calculate(profile);

    // assert
    expect(level).toBe(AiddLevelValue.blue);
  });

  it('when median reaches gold score without worktree — keeps worktree gate', () => {
    // arrange
    const profile = toProfile(4, 100, false);

    // act
    const level = calculator.calculate(profile);

    // assert
    expect(level).toBe(AiddLevelValue.copper);
  });
});
