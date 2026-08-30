import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import { VelocityReadinessChecker } from '../../../domain/services/velocity-readiness-checker';

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

describe('VelocityReadinessChecker', () => {
  const checker = new VelocityReadinessChecker();

  describe('when all fields are present', () => {
    it('returns calculable with no missing fields', () => {
      // arrange
      const profile = toVelocity({
        sprintCount: 12,
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.9,
        medianDaysTicketToPr: 1.5,
        teamAvgMedianDaysTicketToPr: 3.0,
        featuresPerSprint: 4,
        bugsPerSprint: 1,
      });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(true);
      expect(result.missingEssential).toHaveLength(0);
      expect(result.missingImpacting).toHaveLength(0);
    });
  });

  describe('when an essential field is missing', () => {
    it('when storyPointsPerSprint is null — returns not calculable', () => {
      // arrange
      const profile = toVelocity({ sprintCount: 12, teamAvgStoryPointsPerSprint: 26 });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(false);
      expect(result.missingEssential).toContain('storyPointsPerSprint');
    });

    it('when teamAvgStoryPointsPerSprint is null — returns not calculable', () => {
      // arrange
      const profile = toVelocity({ sprintCount: 12, storyPointsPerSprint: 50 });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(false);
      expect(result.missingEssential).toContain('teamAvgStoryPointsPerSprint');
    });

    it('when sprintCount is null — returns not calculable', () => {
      // arrange
      const profile = toVelocity({ storyPointsPerSprint: 50, teamAvgStoryPointsPerSprint: 26 });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(false);
      expect(result.missingEssential).toContain('sprintCount');
    });

    it('reports all missing essential fields at once', () => {
      // arrange
      const profile = toVelocity();

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(false);
      expect(result.missingEssential).toEqual(
        expect.arrayContaining([
          'sprintCount',
          'storyPointsPerSprint',
          'teamAvgStoryPointsPerSprint',
        ]),
      );
    });
  });

  describe('when an impacting field is missing', () => {
    it('when completionRate is null — calculable but reports impacting missing', () => {
      // arrange
      const profile = toVelocity({
        sprintCount: 12,
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
      });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(true);
      expect(result.missingImpacting).toContain('completionRate');
    });

    it('when cycle time data is missing — reports both impacting fields', () => {
      // arrange
      const profile = toVelocity({
        sprintCount: 12,
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
      });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(true);
      expect(result.missingImpacting).toContain('medianDaysTicketToPr');
      expect(result.missingImpacting).toContain('teamAvgMedianDaysTicketToPr');
    });

    it('optional fields absent do not appear in missingImpacting', () => {
      // arrange — featuresPerSprint and bugsPerSprint are optional
      const profile = toVelocity({
        sprintCount: 12,
        storyPointsPerSprint: 50,
        teamAvgStoryPointsPerSprint: 26,
        completionRate: 0.9,
        medianDaysTicketToPr: 1.5,
        teamAvgMedianDaysTicketToPr: 3.0,
      });

      // act
      const result = checker.check(profile);

      // assert
      expect(result.calculable).toBe(true);
      expect(result.missingImpacting).toHaveLength(0);
    });
  });
});
