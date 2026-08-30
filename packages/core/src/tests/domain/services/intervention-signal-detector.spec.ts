import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { createInterventionSignalDetector } from '../../../domain/services/intervention-signal-detector';
import { interventionThresholdsConfigFixture as cfg } from '../../fixtures/intervention-thresholds-config.fixture';

const toProfile = (overrides: Partial<InterventionProfile> = {}): InterventionProfile => ({
  totalPrCount: null,
  medianCorrectionCommitsAfterOpen: null,
  mergedWithoutHumanEditCount: null,
  mergedWithoutHumanEditRatio: null,
  medianReviewCommentsReceived: null,
  humanCommitRatio: null,
  ...overrides,
});

describe('Intervention signal detector', () => {
  describe('when no AI data', () => {
    it('when profile has no data — returns white with next level red and no signals', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile());

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.white);
      expect(matrix.nextLevel).toBe(AiddLevelValue.red);
      expect(matrix.signals).toHaveLength(0);
    });
  });

  describe('when level is red', () => {
    it('when AI signal present but correction commits too high — returns red with next level blue and signals', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(
        toProfile({
          medianCorrectionCommitsAfterOpen: 5,
          medianReviewCommentsReceived: 8,
          humanCommitRatio: 0.5,
        }),
      );

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.red);
      expect(matrix.nextLevel).toBe(AiddLevelValue.blue);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({
        name: 'medianCorrectionCommitsAfterOpen',
        validated: false,
        value: 5,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'medianReviewCommentsReceived',
        validated: false,
        value: 8,
      });
    });
  });

  describe('when level is blue', () => {
    it('when blue conditions met — returns blue with next level copper and signals', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(
        toProfile({
          medianCorrectionCommitsAfterOpen: 2,
          medianReviewCommentsReceived: 4,
          humanCommitRatio: 0.5,
        }),
      );

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
      expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({
        name: 'medianCorrectionCommitsAfterOpen',
        validated: false,
        value: 2,
      });
      expect(matrix.signals[1]).toEqual({
        name: 'medianReviewCommentsReceived',
        validated: false,
        value: 4,
      });
    });
  });

  describe('when level is copper', () => {
    it('when copper met but silver conditions not met — returns copper with next silver and all 4 signals', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(
        toProfile({
          medianCorrectionCommitsAfterOpen: 1,
          humanCommitRatio: 0.5,
          mergedWithoutHumanEditRatio: 0.3,
          medianReviewCommentsReceived: 2,
        }),
      );

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.nextLevel).toBe(AiddLevelValue.silver);
      expect(matrix.signals).toHaveLength(4);
      expect(matrix.signals[0]).toEqual({
        name: 'medianCorrectionCommitsAfterOpen',
        validated: false,
        value: 1,
      });
      expect(matrix.signals[1]).toEqual({ name: 'humanCommitRatio', validated: false, value: 0.5 });
      expect(matrix.signals[2]).toEqual({
        name: 'mergedWithoutHumanEditRatio',
        validated: false,
        value: 0.3,
      });
      expect(matrix.signals[3]).toEqual({
        name: 'medianReviewCommentsReceived',
        validated: true,
        value: 2,
      });
    });
  });

  describe('when level is silver', () => {
    it('when silver met but humanCommitRatio blocks gold — returns silver with next gold and unvalidated signal', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(
        toProfile({
          medianCorrectionCommitsAfterOpen: 0,
          humanCommitRatio: 0.1,
          mergedWithoutHumanEditRatio: 0.7,
          medianReviewCommentsReceived: 1,
        }),
      );

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.silver);
      expect(matrix.nextLevel).toBe(AiddLevelValue.gold);
      expect(matrix.signals[0]).toEqual({
        name: 'medianCorrectionCommitsAfterOpen',
        validated: true,
        value: 0,
      });
      expect(matrix.signals[1]).toEqual({ name: 'humanCommitRatio', validated: false, value: 0.1 });
      expect(matrix.signals[2]).toEqual({
        name: 'mergedWithoutHumanEditRatio',
        validated: false,
        value: 0.7,
      });
    });
  });

  describe('when level is gold', () => {
    it('when gold is reached — returns gold with null next level and all validated signals', () => {
      // arrange
      const detector = createInterventionSignalDetector(cfg);

      // act
      const matrix = detector.detect(
        toProfile({
          medianCorrectionCommitsAfterOpen: 0,
          humanCommitRatio: 0,
          mergedWithoutHumanEditRatio: 1,
          medianReviewCommentsReceived: 0,
        }),
      );

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.gold);
      expect(matrix.nextLevel).toBeNull();
      expect(matrix.signals).toHaveLength(3);
      expect(matrix.signals[0]).toEqual({
        name: 'medianCorrectionCommitsAfterOpen',
        validated: true,
        value: 0,
      });
      expect(matrix.signals[1]).toEqual({ name: 'humanCommitRatio', validated: true, value: 0 });
      expect(matrix.signals[2]).toEqual({
        name: 'mergedWithoutHumanEditRatio',
        validated: true,
        value: 1,
      });
    });
  });
});
