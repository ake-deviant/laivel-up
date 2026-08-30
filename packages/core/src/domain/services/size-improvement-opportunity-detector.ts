import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeDistribution } from '../entities/size-distribution';
import { SizeProfile } from '../entities/size-profile';
import { IAxisImprovementOpportunityDetector } from '../ports/improvement-opportunity-service.port';
import { ImprovementOpportunity } from './improvement-opportunity.service';
import { ISizeLevelCalculator, SizeThresholdsConfig } from './size-level-calculator.service';

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

interface SizeFieldDefinition {
  field: string;
  impactScore: number;
  effort: 'low' | 'medium' | 'high';
  isEligible(distribution: SizeDistribution): boolean;
  simulate(distribution: SizeDistribution): SizeDistribution;
}

export class SizeImprovementOpportunityDetector implements IAxisImprovementOpportunityDetector<SizeProfile> {
  constructor(
    private readonly calculator: ISizeLevelCalculator,
    private readonly thresholds: SizeThresholdsConfig,
  ) {}

  detect(profile: SizeProfile): ImprovementOpportunity[] {
    const { distribution } = profile;
    if (!distribution) return [];

    const currentLevel = this.calculator.calculate(profile);

    return this.buildCandidates()
      .filter((c) => c.isEligible(distribution))
      .map((c) => {
        const simulated = { ...profile, distribution: c.simulate(distribution) };
        const resultingLevel = this.calculator.calculate(simulated);
        return {
          axis: 'size' as const,
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

  private buildCandidates(): SizeFieldDefinition[] {
    const { gold } = this.thresholds;
    return [
      {
        field: 'xlRatio',
        impactScore: 5,
        effort: 'medium',
        isEligible: (d) => (d.xl ?? 0) < gold.minXl,
        simulate: (d) => {
          const xl = d.xl ?? 0;
          const l = d.l ?? 0;
          const m = d.m ?? 0;
          const deficit = gold.minXl - xl;
          const fromL = Math.min(deficit, l);
          const fromM = Math.min(deficit - fromL, m);
          return { ...d, xl: xl + fromL + fromM, l: l - fromL, m: m - fromM };
        },
      },
      {
        field: 'lxlRatio',
        impactScore: 3,
        effort: 'medium',
        isEligible: (d) => (d.l ?? 0) + (d.xl ?? 0) < gold.minLXl,
        simulate: (d) => {
          const l = d.l ?? 0;
          const xl = d.xl ?? 0;
          const m = d.m ?? 0;
          const deficit = gold.minLXl - (l + xl);
          const fromM = Math.min(deficit, m);
          return { ...d, l: l + fromM, m: m - fromM };
        },
      },
    ];
  }
}
