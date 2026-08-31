import { AiddLevelValue } from '../entities/aidd-level-value';
import { ParallelismProfile } from '../entities/parallelism-profile';
import { IAxisImprovementOpportunityDetector } from '../ports/improvement-opportunity-service.port';
import { PartialOpportunity } from './improvement-opportunity.service';
import {
  IParallelismLevelCalculator,
  IParallelismScoringStrategy,
  ParallelismThresholdsConfig,
  WeightedParallelismScoringStrategy,
} from './parallelism-level-calculator.service';

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

interface ParallelismFieldDefinition {
  field: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  isEligible(profile: ParallelismProfile): boolean;
  simulate(profile: ParallelismProfile): ParallelismProfile;
}

export class ParallelismImprovementOpportunityDetector implements IAxisImprovementOpportunityDetector<ParallelismProfile> {
  constructor(
    private readonly calculator: IParallelismLevelCalculator,
    private readonly thresholds: ParallelismThresholdsConfig,
    private readonly scoringStrategy: IParallelismScoringStrategy = new WeightedParallelismScoringStrategy(
      thresholds.weights,
    ),
  ) {}

  detect(profile: ParallelismProfile): PartialOpportunity[] {
    const currentLevel = this.calculator.calculate(profile);

    return this.buildCandidates()
      .filter((c) => c.isEligible(profile))
      .map((c) => {
        const simulated = c.simulate(profile);
        const resultingLevel = this.calculator.calculate(simulated);
        return {
          axis: 'parallelism' as const,
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

  private buildCandidates(): ParallelismFieldDefinition[] {
    const { levels } = this.thresholds;

    return [
      {
        field: 'hasWorktreeInclude',
        impactScore: 5,
        effort: 'low',
        isEligible: (p) => {
          if (p.hasWorktreeInclude === true) return false;
          const score = this.scoringStrategy.score(p);
          return score >= levels.gold.minScore;
        },
        simulate: (p) => ({ ...p, hasWorktreeInclude: true }),
      },
      {
        field: 'medianConcurrentBranches',
        impactScore: 4,
        effort: 'high',
        isEligible: (p) => {
          if (p.medianConcurrentBranches === null) return false;
          return this.computeTargetMedian(p) > p.medianConcurrentBranches;
        },
        simulate: (p) => ({ ...p, medianConcurrentBranches: this.computeTargetMedian(p) }),
      },
    ];
  }

  private computeTargetMedian(profile: ParallelismProfile): number {
    const currentMedian = profile.medianConcurrentBranches ?? 0;
    const targetLevel =
      profile.hasWorktreeInclude === true ? AiddLevelValue.gold : AiddLevelValue.silver;

    for (let candidate = currentMedian + 1; candidate <= 1_000; candidate += 1) {
      const resultingLevel = this.calculator.calculate({
        ...profile,
        medianConcurrentBranches: candidate,
      });
      if (LEVEL_RANK[resultingLevel] >= LEVEL_RANK[targetLevel]) return candidate;
    }

    return currentMedian;
  }
}
