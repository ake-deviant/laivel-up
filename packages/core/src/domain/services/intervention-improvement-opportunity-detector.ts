import { AiddLevelValue } from '../entities/aidd-level-value';
import { InterventionProfile } from '../entities/intervention-profile';
import { IAxisImprovementOpportunityDetector } from '../ports/improvement-opportunity-service.port';
import { PartialOpportunity } from './improvement-opportunity.service';
import {
  IInterventionLevelCalculator,
  InterventionThresholdsConfig,
} from './intervention-level-calculator.service';

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

interface InterventionFieldDefinition {
  field: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  isEligible(profile: InterventionProfile): boolean;
  simulate(profile: InterventionProfile): InterventionProfile;
}

export class InterventionImprovementOpportunityDetector implements IAxisImprovementOpportunityDetector<InterventionProfile> {
  constructor(
    private readonly calculator: IInterventionLevelCalculator,
    private readonly thresholds: InterventionThresholdsConfig,
  ) {}

  detect(profile: InterventionProfile): PartialOpportunity[] {
    const currentLevel = this.calculator.calculate(profile);

    return this.buildCandidates()
      .filter((c) => c.isEligible(profile))
      .map((c) => {
        const simulated = c.simulate(profile);
        const resultingLevel = this.calculator.calculate(simulated);
        return {
          axis: 'intervention' as const,
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

  private buildCandidates(): InterventionFieldDefinition[] {
    const { silver } = this.thresholds.levels;
    return [
      {
        field: 'medianCorrectionCommitsAfterOpen',
        impactScore: 5,
        effort: 'high',
        isEligible: (p) =>
          p.medianCorrectionCommitsAfterOpen !== null &&
          silver.maxCorrectionCommits !== null &&
          p.medianCorrectionCommitsAfterOpen > silver.maxCorrectionCommits,
        simulate: (p) => ({ ...p, medianCorrectionCommitsAfterOpen: silver.maxCorrectionCommits! }),
      },
      {
        field: 'humanCommitRatio',
        impactScore: 4,
        effort: 'medium',
        isEligible: (p) =>
          p.humanCommitRatio !== null &&
          silver.maxHumanCommitRatio !== null &&
          p.humanCommitRatio > silver.maxHumanCommitRatio,
        simulate: (p) => ({ ...p, humanCommitRatio: silver.maxHumanCommitRatio! }),
      },
      {
        field: 'mergedWithoutHumanEditRatio',
        impactScore: 4,
        effort: 'high',
        isEligible: (p) =>
          p.mergedWithoutHumanEditRatio !== null &&
          silver.minMergedWithoutHumanEditRatio !== null &&
          p.mergedWithoutHumanEditRatio < silver.minMergedWithoutHumanEditRatio,
        simulate: (p) => ({
          ...p,
          mergedWithoutHumanEditRatio: silver.minMergedWithoutHumanEditRatio!,
        }),
      },
      {
        field: 'medianReviewCommentsReceived',
        impactScore: 3,
        effort: 'medium',
        isEligible: (p) =>
          p.medianReviewCommentsReceived !== null &&
          silver.maxReviewComments !== null &&
          p.medianReviewCommentsReceived > silver.maxReviewComments,
        simulate: (p) => ({ ...p, medianReviewCommentsReceived: silver.maxReviewComments! }),
      },
    ];
  }
}
