import { AiddLevelValue, lowestLevel } from '../entities/aidd-level-value';
import { DeveloperProfile } from '../entities/developer-profile';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';
import { IInterventionLevelCalculator } from './intervention-level-calculator.service';
import { ImprovementFieldDefinitionRegistry } from './improvement-field-definition-registry';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { IVelocityLevelCalculator } from './velocity-level-calculator.service';
import { SizeImprovementOpportunityDetector } from './size-improvement-opportunity-detector';
import { InterventionImprovementOpportunityDetector } from './intervention-improvement-opportunity-detector';
import { ParallelismImprovementOpportunityDetector } from './parallelism-improvement-opportunity-detector';
import { VelocityImprovementOpportunityDetector } from './velocity-improvement-opportunity-detector';
import { IImprovementOpportunityService } from '../ports/improvement-opportunity-service.port';
import { IAxisReadinessChecker } from '../ports/axis-readiness-checker.port';
import { VelocityProfile } from '../entities/velocity-profile';

export type OpportunityAxis = 'harness' | 'size' | 'intervention' | 'parallelism' | 'velocity';

export interface ImprovementOpportunity {
  axis: OpportunityAxis;
  field: string;
  currentLevel: AiddLevelValue;
  resultingLevel: AiddLevelValue;
  levelGain: number;
  scoreDelta: number;
  effort: 'low' | 'medium' | 'high';
  fieldsToChange: number;
  overallResultingLevel: AiddLevelValue;
  overallLevelGain: number;
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

type PartialOpportunity = Omit<
  ImprovementOpportunity,
  'overallResultingLevel' | 'overallLevelGain'
>;

export class ImprovementOpportunityService implements IImprovementOpportunityService {
  constructor(
    private readonly harnessCalculator: IHarnessLevelCalculator,
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly interventionCalculator: IInterventionLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
    private readonly sizeDetector: SizeImprovementOpportunityDetector,
    private readonly interventionDetector: InterventionImprovementOpportunityDetector,
    private readonly parallelismDetector: ParallelismImprovementOpportunityDetector,
    private readonly velocityDetector: VelocityImprovementOpportunityDetector,
    private readonly velocityCalculator: IVelocityLevelCalculator,
    private readonly velocityReadinessChecker: IAxisReadinessChecker<VelocityProfile>,
    private readonly registry = new ImprovementFieldDefinitionRegistry(),
  ) {}

  detect(profile: DeveloperProfile): ImprovementOpportunity[] {
    const currentSizeLevel = this.sizeCalculator.calculate(profile.size);
    const currentHarnessLevel = this.harnessCalculator.calculate(profile.harness);
    const currentInterventionLevel = this.interventionCalculator.calculate(profile.intervention);
    const currentParallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);
    const velocityReadiness = this.velocityReadinessChecker.check(profile.velocity);
    const currentVelocityLevel = velocityReadiness.calculable
      ? this.velocityCalculator.calculate(profile.velocity)
      : null;

    const axisLevels: AiddLevelValue[] = [
      currentSizeLevel,
      currentHarnessLevel,
      currentInterventionLevel,
      currentParallelismLevel,
    ];
    if (currentVelocityLevel) axisLevels.push(currentVelocityLevel);
    const currentOverallLevel = lowestLevel(...axisLevels);

    const candidates: PartialOpportunity[] = [
      ...this.detectHarness(profile, currentHarnessLevel),
      ...this.sizeDetector.detect(profile.size),
      ...this.interventionDetector.detect(profile.intervention),
      ...this.parallelismDetector.detect(profile.parallelism),
      ...(velocityReadiness.calculable ? this.velocityDetector.detect(profile.velocity) : []),
    ];

    return candidates
      .map((opportunity) => {
        const newSizeLevel =
          opportunity.axis === 'size' ? opportunity.resultingLevel : currentSizeLevel;
        const newHarnessLevel =
          opportunity.axis === 'harness' ? opportunity.resultingLevel : currentHarnessLevel;
        const newInterventionLevel =
          opportunity.axis === 'intervention'
            ? opportunity.resultingLevel
            : currentInterventionLevel;
        const newParallelismLevel =
          opportunity.axis === 'parallelism' ? opportunity.resultingLevel : currentParallelismLevel;
        const newVelocityLevel =
          opportunity.axis === 'velocity' ? opportunity.resultingLevel : currentVelocityLevel;
        const newAxisLevels: AiddLevelValue[] = [
          newSizeLevel,
          newHarnessLevel,
          newInterventionLevel,
          newParallelismLevel,
        ];
        if (newVelocityLevel) newAxisLevels.push(newVelocityLevel);
        const overallResultingLevel = lowestLevel(...newAxisLevels);
        return {
          ...opportunity,
          overallResultingLevel,
          overallLevelGain: LEVEL_RANK[overallResultingLevel] - LEVEL_RANK[currentOverallLevel],
        };
      })
      .filter((o) => o.levelGain > 0)
      .sort(
        (a, b) =>
          b.overallLevelGain - a.overallLevelGain ||
          LEVEL_RANK[b.resultingLevel] - LEVEL_RANK[a.resultingLevel] ||
          b.scoreDelta - a.scoreDelta,
      );
  }

  private detectHarness(
    profile: DeveloperProfile,
    currentHarnessLevel: AiddLevelValue,
  ): PartialOpportunity[] {
    return this.registry
      .getAll()
      .filter((candidate) => candidate.isEligible(profile.harness))
      .map((candidate) => {
        const resultingLevel = this.harnessCalculator.calculate(
          candidate.simulate(profile.harness),
        );
        return {
          axis: 'harness' as const,
          field: candidate.field,
          currentLevel: currentHarnessLevel,
          resultingLevel,
          levelGain: LEVEL_RANK[resultingLevel] - LEVEL_RANK[currentHarnessLevel],
          scoreDelta: candidate.impactScore,
          effort: candidate.effort,
          fieldsToChange: 1,
        };
      })
      .filter((o) => o.levelGain > 0);
  }
}
