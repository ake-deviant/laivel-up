import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';
import { IInterventionLevelCalculator } from './intervention-level-calculator.service';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { IVelocityLevelCalculator } from './velocity-level-calculator.service';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { AiddLevelValue, lowestLevel } from '../entities/aidd-level-value';
import { IAxisReadinessChecker } from '../ports/axis-readiness-checker.port';
import { VelocityProfile } from '../entities/velocity-profile';

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  constructor(
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly harnessCalculator: IHarnessLevelCalculator,
    private readonly interventionCalculator: IInterventionLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
    private readonly velocityCalculator: IVelocityLevelCalculator,
    private readonly velocityReadinessChecker: IAxisReadinessChecker<VelocityProfile>,
  ) {}

  evaluate(profile: DeveloperProfile): DeveloperProfileResult {
    const sizeLevel = this.sizeCalculator.calculate(profile.size);
    const harnessLevel = this.harnessCalculator.calculate(profile.harness);
    const interventionLevel = this.interventionCalculator.calculate(profile.intervention);
    const parallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);
    const velocityReadiness = this.velocityReadinessChecker.check(profile.velocity);
    const velocityLevel = velocityReadiness.calculable
      ? this.velocityCalculator.calculate(profile.velocity)
      : AiddLevelValue.white;

    const axisLevels: AiddLevelValue[] = [
      sizeLevel,
      harnessLevel,
      interventionLevel,
      parallelismLevel,
    ];
    if (velocityReadiness.calculable) axisLevels.push(velocityLevel);

    return {
      overallLevel: lowestLevel(...axisLevels),
      sizeLevel,
      harnessLevel,
      interventionLevel,
      parallelismLevel,
      velocityLevel,
      velocityReadiness,
      axisProfiles: {
        size: profile.size,
        harness: profile.harness,
        intervention: profile.intervention,
        parallelism: profile.parallelism,
        velocity: profile.velocity,
      },
      signalMatrices: [],
      improvements: [],
      busImprovements: [],
      formatWarnings: [],
      impactingNulls: [],
      ignoredNulls: [],
    };
  }
}
