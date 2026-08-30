import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';
import { IInterventionLevelCalculator } from './intervention-level-calculator.service';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { lowestLevel } from '../entities/aidd-level-value';

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  constructor(
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly harnessCalculator: IHarnessLevelCalculator,
    private readonly interventionCalculator: IInterventionLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
  ) {}

  evaluate(profile: DeveloperProfile): DeveloperProfileResult {
    const sizeLevel = this.sizeCalculator.calculate(profile.size);
    const harnessLevel = this.harnessCalculator.calculate(profile.harness);
    const interventionLevel = this.interventionCalculator.calculate(profile.intervention);
    const parallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);

    return {
      overallLevel: lowestLevel(sizeLevel, harnessLevel, interventionLevel, parallelismLevel),
      sizeLevel,
      harnessLevel,
      interventionLevel,
      parallelismLevel,
      axisProfiles: {
        size: profile.size,
        harness: profile.harness,
        intervention: profile.intervention,
        parallelism: profile.parallelism,
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
