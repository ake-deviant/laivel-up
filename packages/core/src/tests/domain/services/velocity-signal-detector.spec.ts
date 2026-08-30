import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import { createVelocitySignalDetector } from '../../../domain/services/velocity-signal-detector';
import { defaultVelocityThresholdsConfig as cfg } from '../../../domain/services/velocity-thresholds.config';

const toProfile = (overrides: Partial<VelocityProfile> = {}): VelocityProfile => ({
  sprintCount: null,
  storyPointsPerSprint: null,
  teamAvgStoryPointsPerSprint: null,
  completionRate: null,
  medianDaysTicketToPr: null,
  teamAvgMedianDaysTicketToPr: null,
  featuresPerSprint: null,
  bugsPerSprint: null,
  ...overrides,
});

// teamAvg = 10, teamAvgDays = 10 as base for ratio computation
const BASE_TEAM_AVG = 10;
const BASE_TEAM_AVG_DAYS = 10;

describe('Velocity signal detector', () => {
  describe('when level is red (leverageRatio below blue threshold)', () => {
    it('when leverageRatio is below 1.0 — returns red with next blue and unvalidated leverageRatio signal', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 8,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 0.8
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.red);
      expect(matrix.nextLevel).toBe(AiddLevelValue.blue);
      expect(matrix.signals).toHaveLength(1);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: false, value: 0.8 });
    });
  });

  describe('when level is blue (leverageRatio ≥ 1.0)', () => {
    it('when leverageRatio meets blue threshold — returns blue with next green and unvalidated signals', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 11,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.1
        completionRate: 0.6, // below green.minCompletionRate=0.70
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
      expect(matrix.nextLevel).toBe(AiddLevelValue.green);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: false, value: 1.1 }); // < green 1.2
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: false, value: 0.6 }); // < green 0.70
    });

    it('when completionRate is null — signal is still emitted with null value and not validated', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 11,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.1
        // completionRate null
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: false, value: null });
    });
  });

  describe('when level is green (leverageRatio ≥ 1.2, completionRate ≥ 0.70)', () => {
    it('when green conditions met — returns green with next copper and signals for copper thresholds', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 13,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.3
        completionRate: 0.72,
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.green);
      expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: false, value: 1.3 }); // < copper 1.5
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: false, value: 0.72 }); // < copper 0.80
    });
  });

  describe('when level is copper (leverageRatio ≥ 1.5, completionRate ≥ 0.80)', () => {
    it('when copper conditions met — returns copper with next silver and signals including cycleTimeRatio', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 16,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.6
        completionRate: 0.82,
        medianDaysTicketToPr: 8,
        teamAvgMedianDaysTicketToPr: BASE_TEAM_AVG_DAYS, // cycleTimeRatio = 1.25 < silver 1.5
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.nextLevel).toBe(AiddLevelValue.silver);
      expect(matrix.signals).toHaveLength(3);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: false, value: 1.6 }); // < silver 1.8
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: false, value: 0.82 }); // < silver 0.85
    });
  });

  describe('when level is silver (leverageRatio ≥ 1.8, completionRate ≥ 0.85, cycleTimeRatio ≥ 1.5)', () => {
    it('when silver met but featureRatio blocks gold — returns silver with next gold and 4 signals', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 19,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.9
        completionRate: 0.87,
        medianDaysTicketToPr: 5,
        teamAvgMedianDaysTicketToPr: BASE_TEAM_AVG_DAYS, // cycleTimeRatio = 2.0 ≥ silver 1.5
        featuresPerSprint: 6,
        bugsPerSprint: 4, // featureRatio = 0.60 < gold 0.70
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.silver);
      expect(matrix.nextLevel).toBe(AiddLevelValue.gold);
      expect(matrix.signals).toHaveLength(4);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: false, value: 1.9 }); // < gold 2.0
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: false, value: 0.87 }); // < gold 0.90
      expect(matrix.signals[2]).toEqual({ name: 'cycleTimeRatio', validated: true, value: 2.0 }); // ≥ gold 2.0
      expect(matrix.signals[3]).toEqual({ name: 'featureRatio', validated: false, value: 0.6 }); // < gold 0.70
    });
  });

  describe('when level is gold', () => {
    it('when all gold conditions met — returns gold with null next level and all signals validated', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 24,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 2.4
        completionRate: 0.95,
        medianDaysTicketToPr: 4,
        teamAvgMedianDaysTicketToPr: BASE_TEAM_AVG_DAYS, // cycleTimeRatio = 2.5
        featuresPerSprint: 8,
        bugsPerSprint: 2, // featureRatio = 0.80
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.gold);
      expect(matrix.nextLevel).toBeNull();
      expect(matrix.signals).toHaveLength(4);
      expect(matrix.signals[0]).toEqual({ name: 'leverageRatio', validated: true, value: 2.4 });
      expect(matrix.signals[1]).toEqual({ name: 'completionRate', validated: true, value: 0.95 });
      expect(matrix.signals[2]).toEqual({ name: 'cycleTimeRatio', validated: true, value: 2.5 });
      expect(matrix.signals[3]).toEqual({ name: 'featureRatio', validated: true, value: 0.8 });
    });
  });

  describe('when impacting fields are null', () => {
    it('when cycleTimeRatio is null — copper conditions still evaluated without it', () => {
      // arrange
      const detector = createVelocitySignalDetector(cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 16,
        teamAvgStoryPointsPerSprint: BASE_TEAM_AVG, // leverageRatio = 1.6
        completionRate: 0.82,
        // medianDaysTicketToPr null → cycleTimeRatio null
      });

      // act
      const matrix = detector.detect(profile);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals[2]).toEqual({ name: 'cycleTimeRatio', validated: false, value: null });
    });
  });
});
