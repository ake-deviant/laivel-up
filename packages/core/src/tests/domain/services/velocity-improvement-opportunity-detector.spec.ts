import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import { VelocityImprovementOpportunityDetector } from '../../../domain/services/velocity-improvement-opportunity-detector';
import { createVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { defaultVelocityThresholdsConfig as cfg } from '../../../domain/services/velocity-thresholds.config';

const calculator = createVelocityLevelCalculator(cfg);

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

describe('Velocity improvement opportunity detector', () => {
  describe('when velocity is not calculable (essential fields missing)', () => {
    it('when teamAvg is null — returns no opportunities', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      const profile = toProfile({ storyPointsPerSprint: 10 });

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when level is already gold', () => {
    it('when all gold conditions met — returns no opportunities', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      // galahad-like: leverageRatio=2.4, completionRate=0.95, cycleTimeRatio=2.5, featureRatio=0.80
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 24,
        teamAvgStoryPointsPerSprint: 10,
        completionRate: 0.95,
        medianDaysTicketToPr: 4,
        teamAvgMedianDaysTicketToPr: 10,
        featuresPerSprint: 8,
        bugsPerSprint: 2,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when level is red (leverageRatio below 1.0)', () => {
    it('when storyPointsPerSprint is below gold threshold — surfaced as opportunity to reach higher level', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 8,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 0.8 → red
        completionRate: 0.95,
        medianDaysTicketToPr: 4,
        teamAvgMedianDaysTicketToPr: 10,
        featuresPerSprint: 8,
        bugsPerSprint: 2,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const spOpportunity = opportunities.find((o) => o.field === 'storyPointsPerSprint');
      expect(spOpportunity).toBeDefined();
      expect(spOpportunity!.currentLevel).toBe(AiddLevelValue.red);
      expect(spOpportunity!.levelGain).toBeGreaterThan(0);
    });
  });

  describe('when level is green (leverageRatio ≥ 1.2, completionRate ≥ 0.70)', () => {
    it('when storyPointsPerSprint blocks copper — storyPointsPerSprint opportunity reaches silver', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      // completionRate 0.85 satisfies silver but not gold, only leverageRatio blocks silver
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 13,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 1.3 → green
        completionRate: 0.85,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const spOpportunity = opportunities.find((o) => o.field === 'storyPointsPerSprint');
      expect(spOpportunity).toBeDefined();
      expect(spOpportunity!.currentLevel).toBe(AiddLevelValue.green);
      expect(spOpportunity!.levelGain).toBeGreaterThan(0);
    });

    it('when completionRate is below copper threshold — completionRate opportunity reaches copper', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 16,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 1.6 → copper blocked by completionRate
        completionRate: 0.75, // < copper 0.80 → green
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const crOpportunity = opportunities.find((o) => o.field === 'completionRate');
      expect(crOpportunity).toBeDefined();
      expect(crOpportunity!.currentLevel).toBe(AiddLevelValue.green);
      expect(crOpportunity!.resultingLevel).toBe(AiddLevelValue.copper);
      expect(crOpportunity!.levelGain).toBe(1);
    });
  });

  describe('when level is copper (leverageRatio ≥ 1.5, completionRate ≥ 0.80)', () => {
    it('when cycleTimeRatio blocks silver — medianDaysTicketToPr opportunity reaches silver', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      // leverageRatio and completionRate satisfy silver, only cycleTimeRatio blocks it
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 19,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 1.9 ≥ silver 1.8
        completionRate: 0.86, // ≥ silver 0.85
        medianDaysTicketToPr: 8,
        teamAvgMedianDaysTicketToPr: 10, // cycleTimeRatio = 1.25 < silver 1.5 → copper
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const ctOpportunity = opportunities.find((o) => o.field === 'medianDaysTicketToPr');
      expect(ctOpportunity).toBeDefined();
      expect(ctOpportunity!.currentLevel).toBe(AiddLevelValue.copper);
      expect(ctOpportunity!.levelGain).toBeGreaterThan(0);
    });
  });

  describe('when level is silver, featureRatio blocks gold', () => {
    it('when bugsPerSprint is present and featureRatio below gold threshold — featuresPerSprint opportunity surfaces', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      // all gold conditions met except featureRatio — only featuresPerSprint blocks gold
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 22,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 2.2 ≥ gold 2.0
        completionRate: 0.92, // ≥ gold 0.90
        medianDaysTicketToPr: 4,
        teamAvgMedianDaysTicketToPr: 10, // cycleTimeRatio = 2.5 ≥ gold 2.0
        featuresPerSprint: 6,
        bugsPerSprint: 4, // featureRatio = 0.60 < gold 0.70
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const fpOpportunity = opportunities.find((o) => o.field === 'featuresPerSprint');
      expect(fpOpportunity).toBeDefined();
      expect(fpOpportunity!.currentLevel).toBe(AiddLevelValue.silver);
      expect(fpOpportunity!.resultingLevel).toBe(AiddLevelValue.gold);
      expect(fpOpportunity!.levelGain).toBe(1);
    });

    it('when bugsPerSprint is null — featuresPerSprint opportunity is not surfaced', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 19,
        teamAvgStoryPointsPerSprint: 10,
        completionRate: 0.87,
        medianDaysTicketToPr: 5,
        teamAvgMedianDaysTicketToPr: 10,
        // featuresPerSprint and bugsPerSprint null
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      const fpOpportunity = opportunities.find((o) => o.field === 'featuresPerSprint');
      expect(fpOpportunity).toBeUndefined();
    });
  });

  describe('opportunity ordering', () => {
    it('when multiple fields can improve the level — opportunities are sorted by level gain descending', () => {
      // arrange
      const detector = new VelocityImprovementOpportunityDetector(calculator, cfg);
      const profile = toProfile({
        sprintCount: 5,
        storyPointsPerSprint: 8,
        teamAvgStoryPointsPerSprint: 10, // leverageRatio = 0.8 → red
        completionRate: 0.95,
        medianDaysTicketToPr: 4,
        teamAvgMedianDaysTicketToPr: 10,
        featuresPerSprint: 8,
        bugsPerSprint: 2,
      });

      // act
      const opportunities = detector.detect(profile);

      // assert
      for (let i = 0; i < opportunities.length - 1; i++) {
        expect(opportunities[i].levelGain).toBeGreaterThanOrEqual(opportunities[i + 1].levelGain);
      }
    });
  });
});
