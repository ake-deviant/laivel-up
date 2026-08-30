import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { InterventionImprovementOpportunityDetector } from '../../../domain/services/intervention-improvement-opportunity-detector';
import { createInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { defaultInterventionThresholdsConfig } from '../../../domain/services/intervention-thresholds.config';

const toIntervention = (overrides: Partial<InterventionProfile> = {}): InterventionProfile => ({
  totalPrCount: null,
  medianCorrectionCommitsAfterOpen: null,
  mergedWithoutHumanEditCount: null,
  mergedWithoutHumanEditRatio: null,
  medianReviewCommentsReceived: null,
  humanCommitRatio: null,
  ...overrides,
});

describe('InterventionImprovementOpportunityDetector', () => {
  const detector = new InterventionImprovementOpportunityDetector(
    createInterventionLevelCalculator(defaultInterventionThresholdsConfig),
    defaultInterventionThresholdsConfig,
  );

  describe('when all fields are null', () => {
    it('returns no opportunities', () => {
      // arrange
      const profile = toIntervention();

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when already at gold level', () => {
    it('returns no opportunities', () => {
      // arrange — all constraints met: correctionCommits=0, humanCommitRatio=0, mergedRatio=1
      const profile = toIntervention({
        medianCorrectionCommitsAfterOpen: 0,
        humanCommitRatio: 0,
        mergedWithoutHumanEditRatio: 1,
        medianReviewCommentsReceived: 0,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when humanCommitRatio is the only blocker for silver (copper profile)', () => {
    // correctionCommits=0 ✓, mergedRatio=0.6 ✓, reviewComments=1 ✓ — but humanCommitRatio=0.2 > silver.max=0.15
    const profile = toIntervention({
      medianCorrectionCommitsAfterOpen: 0,
      humanCommitRatio: 0.2,
      mergedWithoutHumanEditRatio: 0.6,
      medianReviewCommentsReceived: 1,
    });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(profile);
    });

    it('returns one opportunity', () => {
      expect(opportunities).toHaveLength(1);
    });

    it('when humanCommitRatio blocks silver — identifies it as the opportunity reaching silver', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities[0]).toMatchObject({
        axis: 'intervention',
        field: 'humanCommitRatio',
        currentLevel: AiddLevelValue.copper,
        resultingLevel: AiddLevelValue.silver,
        levelGain: 1,
      });
    });
  });

  describe('when medianReviewCommentsReceived is the only blocker for copper (blue profile)', () => {
    // correctionCommits=1 meets copper (≤1) but reviewComments=4 fails copper (≤3) → blue
    const profile = toIntervention({
      medianCorrectionCommitsAfterOpen: 1,
      medianReviewCommentsReceived: 4,
    });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(profile);
    });

    it('when reviewComments blocks copper — identifies it as the opportunity reaching copper', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities.find((o) => o.field === 'medianReviewCommentsReceived')).toMatchObject({
        axis: 'intervention',
        field: 'medianReviewCommentsReceived',
        currentLevel: AiddLevelValue.blue,
        resultingLevel: AiddLevelValue.copper,
        levelGain: 2,
      });
    });
  });

  describe('when correctionCommits and mergedRatio both block silver simultaneously', () => {
    // correctionCommits=1 AND mergedRatio=0.3 — no single-field fix reaches silver
    const profile = toIntervention({
      medianCorrectionCommitsAfterOpen: 1,
      humanCommitRatio: 0.09,
      mergedWithoutHumanEditRatio: 0.3,
      medianReviewCommentsReceived: 1,
    });

    it('does not surface medianCorrectionCommitsAfterOpen — fixing it alone leaves silver blocked by mergedRatio', () => {
      // arrange

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(
        opportunities.find((o) => o.field === 'medianCorrectionCommitsAfterOpen'),
      ).toBeUndefined();
    });

    it('does not surface mergedWithoutHumanEditRatio — fixing it alone leaves silver blocked by correctionCommits', () => {
      // arrange

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities.find((o) => o.field === 'mergedWithoutHumanEditRatio')).toBeUndefined();
    });
  });
});
