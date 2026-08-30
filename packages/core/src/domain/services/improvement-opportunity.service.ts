import { AiddLevelValue } from '../entities/aidd-level-value';
import { DeveloperProfile } from '../entities/developer-profile';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';
import { ImprovementFieldDefinitionRegistry } from './improvement-field-definition-registry';
import { IImprovementOpportunityService } from '../ports/improvement-opportunity-service.port';

export interface ImprovementOpportunity {
  axis: 'harness';
  field: string;
  currentLevel: AiddLevelValue;
  resultingLevel: AiddLevelValue;
  levelGain: number;
  scoreDelta: number;
  effort: 'low' | 'medium' | 'high';
  fieldsToChange: number;
}

const LEVEL_RANK: Record<AiddLevelValue, number> = {
  white: 0,
  red: 1,
  blue: 2,
  green: 3,
  copper: 4,
  silver: 5,
  gold: 6,
};

export class ImprovementOpportunityService implements IImprovementOpportunityService {
  constructor(
    private readonly harnessCalculator: IHarnessLevelCalculator,
    private readonly registry = new ImprovementFieldDefinitionRegistry(),
  ) {}

  detect(profile: DeveloperProfile): ImprovementOpportunity[] {
    const currentLevel = this.harnessCalculator.calculate(profile.harness);
    const candidates = this.registry
      .getAll()
      .filter((candidate) => candidate.isEligible(profile.harness));

    return candidates
      .map((candidate) => {
        const resultingLevel = this.harnessCalculator.calculate(
          candidate.simulate(profile.harness),
        );
        return {
          axis: 'harness' as const,
          field: candidate.field,
          currentLevel,
          resultingLevel,
          levelGain: LEVEL_RANK[resultingLevel] - LEVEL_RANK[currentLevel],
          scoreDelta: candidate.impactScore,
          effort: candidate.effort,
          fieldsToChange: 1,
        };
      })
      .filter((opportunity) => LEVEL_RANK[opportunity.resultingLevel] > LEVEL_RANK[currentLevel])
      .sort(
        (left, right) =>
          LEVEL_RANK[right.resultingLevel] - LEVEL_RANK[left.resultingLevel] ||
          right.scoreDelta - left.scoreDelta,
      );
  }
}
