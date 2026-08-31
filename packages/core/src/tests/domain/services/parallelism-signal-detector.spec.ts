import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { createParallelismSignalDetector } from '../../../domain/services/parallelism-signal-detector';
import { MedianOnlyParallelismScoringStrategy } from '../../../domain/services/parallelism-level-calculator.service';
import { parallelismThresholdsConfigFixture } from '../../fixtures/parallelism-thresholds-config.fixture';

const cfg = parallelismThresholdsConfigFixture;

const toProfile = (
  medianConcurrentBranches: number | null,
  maxConcurrentBranches: number | null,
  hasWorktreeInclude: boolean | null,
): ParallelismProfile => ({ medianConcurrentBranches, maxConcurrentBranches, hasWorktreeInclude });

describe('Parallelism signal detector', () => {
  describe('when no data is provided', () => {
    it('when profile is empty — returns white with next level red and unvalidated signals', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(null, null, null));

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.white);
      expect(matrix.nextLevel).toBe(AiddLevelValue.red);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({
        name: 'medianConcurrentBranches',
        validated: false,
        value: null,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'maxConcurrentBranches',
        validated: false,
        value: null,
      });
    });
  });

  describe('when level is below silver', () => {
    it('when score reaches red but not blue — returns red with next level blue and unvalidated score signals', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(1, 2, false)); // score = 7

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.red);
      expect(matrix.nextLevel).toBe(AiddLevelValue.blue);
      expect(matrix.signals[0].validated).toBe(false); // score 7 < blue minScore 10
      expect(matrix.signals[1].validated).toBe(false);
    });

    it('when score reaches copper but not silver — returns copper with next level silver and unvalidated score signals', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(4, 0, null)); // score = 20

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.nextLevel).toBe(AiddLevelValue.silver);
      expect(matrix.signals[0].validated).toBe(false); // score 20 < silver minScore 25
      expect(matrix.signals[0].value).toBe(4);
    });
  });

  describe('when level is silver', () => {
    it('when score reaches silver but worktree data is missing — returns silver with next level gold and worktree unvalidated', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(5, 0, null)); // score = 25

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.silver);
      expect(matrix.nextLevel).toBe(AiddLevelValue.gold);
      expect(matrix.signals).toHaveLength(3);
      expect(matrix.signals[0]).toEqual({
        name: 'medianConcurrentBranches',
        validated: true,
        value: 5,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'maxConcurrentBranches',
        validated: true,
        value: 0,
      });
      expect(matrix.signals[2]).toEqual({
        name: 'hasWorktreeInclude',
        validated: false,
        value: null,
      });
    });

    it('when score reaches silver but worktree is not configured — returns silver with worktree unvalidated', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(5, 0, false)); // score = 25

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.silver);
      expect(matrix.signals[2]).toEqual({
        name: 'hasWorktreeInclude',
        validated: false,
        value: false,
      });
    });
  });

  describe('when level is gold', () => {
    it('when gold is reached — returns gold with null next level and all validated signals', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(4, 0, true)); // score = 20, worktree true

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.gold);
      expect(matrix.nextLevel).toBeNull();
      expect(matrix.signals).toHaveLength(3);
      expect(matrix.signals[0]).toEqual({
        name: 'medianConcurrentBranches',
        validated: true,
        value: 4,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'maxConcurrentBranches',
        validated: true,
        value: 0,
      });
      expect(matrix.signals[2]).toEqual({
        name: 'hasWorktreeInclude',
        validated: true,
        value: true,
      });
    });
  });

  describe('when score is sufficient for next level', () => {
    it('when score already reaches next level threshold — returns validated score signals', () => {
      // arrange
      const detector = createParallelismSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(3, 0, false)); // score = 15, current = green, next = copper (minScore 20)

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.green);
      expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals[0].validated).toBe(false); // 15 < 20
    });
  });
});

describe('Parallelism signal detector with median-only strategy', () => {
  it('when maximum is present — reports only median as a scoring signal', () => {
    // arrange
    const detector = createParallelismSignalDetector(
      cfg,
      new MedianOnlyParallelismScoringStrategy(cfg.weights.median),
    );

    // act
    const matrix = detector.detect(toProfile(2, 100, false));

    // assert
    expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
    expect(matrix.signals).toEqual([
      {
        name: 'medianConcurrentBranches',
        validated: false,
        value: 2,
      },
    ]);
  });
});
