import { AiddLevelValue } from '../entities/aidd-level-value';
import { VelocityProfile } from '../entities/velocity-profile';
import { IAxisImprovementOpportunityDetector } from '../ports/improvement-opportunity-service.port';
import { ImprovementOpportunity } from './improvement-opportunity.service';
import {
  IVelocityLevelCalculator,
  VelocityThresholdsConfig,
} from './velocity-level-calculator.service';

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

interface VelocityFieldCandidate {
  field: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  isEligible(profile: VelocityProfile): boolean;
  simulate(profile: VelocityProfile): VelocityProfile;
}

export class VelocityImprovementOpportunityDetector implements IAxisImprovementOpportunityDetector<VelocityProfile> {
  constructor(
    private readonly calculator: IVelocityLevelCalculator,
    private readonly thresholds: VelocityThresholdsConfig,
  ) {}

  detect(profile: VelocityProfile): ImprovementOpportunity[] {
    const { storyPointsPerSprint: sp, teamAvgStoryPointsPerSprint: avg } = profile;
    if (sp === null || avg === null) return [];

    const currentLevel = this.calculator.calculate(profile);

    return this.buildCandidates()
      .filter((c) => c.isEligible(profile))
      .map((c) => {
        const simulated = c.simulate(profile);
        const resultingLevel = this.calculator.calculate(simulated);
        return {
          axis: 'velocity' as const,
          field: c.field,
          currentLevel,
          resultingLevel,
          levelGain: LEVEL_RANK[resultingLevel] - LEVEL_RANK[currentLevel],
          scoreDelta: c.impactScore,
          effort: c.effort,
          fieldsToChange: 1,
        };
      })
      .filter((o) => o.levelGain > 0)
      .sort(
        (a, b) =>
          LEVEL_RANK[b.resultingLevel] - LEVEL_RANK[a.resultingLevel] ||
          b.scoreDelta - a.scoreDelta,
      );
  }

  private buildCandidates(): VelocityFieldCandidate[] {
    const { gold } = this.thresholds.levels;

    return [
      {
        field: 'storyPointsPerSprint',
        impactScore: 5,
        effort: 'high',
        isEligible: ({ storyPointsPerSprint: sp, teamAvgStoryPointsPerSprint: avg }) =>
          sp !== null && avg !== null && sp / avg < (gold.minLeverageRatio ?? Infinity),
        simulate: (profile) => ({
          ...profile,
          storyPointsPerSprint:
            (gold.minLeverageRatio ?? 2.0) * (profile.teamAvgStoryPointsPerSprint ?? 0),
        }),
      },
      {
        field: 'completionRate',
        impactScore: 3,
        effort: 'medium',
        isEligible: ({ completionRate }) =>
          completionRate === null || completionRate < (gold.minCompletionRate ?? Infinity),
        simulate: (profile) => ({ ...profile, completionRate: gold.minCompletionRate ?? 0.9 }),
      },
      {
        field: 'medianDaysTicketToPr',
        impactScore: 3,
        effort: 'medium',
        isEligible: ({ teamAvgMedianDaysTicketToPr: avgDays, medianDaysTicketToPr: days }) => {
          if (avgDays === null) return false;
          if (days === null) return true;
          const currentRatio = avgDays / days;
          return currentRatio < (gold.minCycleTimeRatio ?? Infinity);
        },
        simulate: (profile) => ({
          ...profile,
          medianDaysTicketToPr:
            (profile.teamAvgMedianDaysTicketToPr ?? 0) / (gold.minCycleTimeRatio ?? 2.0),
        }),
      },
      {
        field: 'featuresPerSprint',
        impactScore: 2,
        effort: 'medium',
        isEligible: ({ featuresPerSprint: features, bugsPerSprint: bugs }) => {
          if (bugs === null || gold.minFeatureRatio === null) return false;
          if (features === null) return true;
          const total = features + bugs;
          return total === 0 || features / total < gold.minFeatureRatio;
        },
        simulate: (profile) => {
          const bugs = profile.bugsPerSprint ?? 0;
          const minRatio = gold.minFeatureRatio ?? 0.7;
          const targetFeatures = (minRatio * bugs) / (1 - minRatio);
          return { ...profile, featuresPerSprint: targetFeatures };
        },
      },
    ];
  }
}
