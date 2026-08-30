import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import { createVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { defaultVelocityThresholdsConfig } from '../../../domain/services/velocity-thresholds.config';

const toVelocity = (overrides: Partial<VelocityProfile> = {}): VelocityProfile => ({
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

describe('VelocityLevelCalculatorService', () => {
  const calculator = createVelocityLevelCalculator(defaultVelocityThresholdsConfig);

  describe('when essential data is missing', () => {
    it('returns white', () => {
      // arrange
      const profile = toVelocity();

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.white);
    });
  });

  describe('when below team average (leverageRatio < 1.0)', () => {
    it('returns red', () => {
      // arrange — storyPoints=20, teamAvg=26 → ratio=0.77
      const profile = toVelocity({ storyPointsPerSprint: 20, teamAvgStoryPointsPerSprint: 26 });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.red);
    });
  });

  describe('when at team average (leverageRatio = 1.0)', () => {
    it('returns blue', () => {
      // arrange — storyPoints=26, teamAvg=26 → ratio=1.0
      const profile = toVelocity({ storyPointsPerSprint: 26, teamAvgStoryPointsPerSprint: 26 });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.blue);
    });
  });

  describe('when 20% above team average with 70% completion rate', () => {
    it('returns green', () => {
      // arrange — ratio=1.2, completionRate=0.70
      const profile = toVelocity({
        storyPointsPerSprint: 31.2,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.7,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.green);
    });
  });

  describe('when 50% above team average with 80% completion rate', () => {
    it('returns copper', () => {
      // arrange — ratio=1.5, completionRate=0.80
      const profile = toVelocity({
        storyPointsPerSprint: 39,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.8,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.copper);
    });
  });

  describe('when clearly above silver thresholds', () => {
    it('returns silver', () => {
      // arrange — ratio=50/26≈1.92, completionRate=0.87, cycleTimeRatio=4/2=2.0
      const profile = toVelocity({
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.87,
        medianDaysTicketToPr: 2,
        teamAvgMedianDaysTicketToPr: 4,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.silver);
    });
  });

  describe('when all gold conditions are met', () => {
    it('returns gold', () => {
      // arrange — ratio=2.0, completionRate=0.90, cycleTimeRatio=2.0, featureRatio=7/10=0.70
      const profile = toVelocity({
        storyPointsPerSprint: 52,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.9,
        medianDaysTicketToPr: 1.0,
        teamAvgMedianDaysTicketToPr: 2.0,
        featuresPerSprint: 7,
        bugsPerSprint: 3,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.gold);
    });
  });

  describe('when silver conditions met but cycle time data is missing (impacting field)', () => {
    it('still returns silver — impacting null is skipped, not blocking', () => {
      // arrange — ratio=50/26≈1.92, completionRate=0.87, cycleTime=null
      const profile = toVelocity({
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.87,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.silver);
    });
  });

  describe('when gold conditions met but featureRatio is below threshold', () => {
    it('does not reach gold — featureRatio is a hard gate', () => {
      // arrange — ratio=2.0, completionRate=0.90, cycleTimeRatio=2.0, featureRatio=5/10=0.50 < 0.70
      const profile = toVelocity({
        storyPointsPerSprint: 52,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.9,
        medianDaysTicketToPr: 1.0,
        teamAvgMedianDaysTicketToPr: 2.0,
        featuresPerSprint: 5,
        bugsPerSprint: 5,
      });

      // act / assert
      expect(calculator.calculate(profile)).toBe(AiddLevelValue.silver);
    });
  });
});
