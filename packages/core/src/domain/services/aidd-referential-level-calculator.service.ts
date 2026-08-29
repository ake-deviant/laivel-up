import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { IInterventionLevelCalculator } from './intervention-level-calculator.service';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { AiddLevelValue, lowestLevel } from '../entities/aidd-level-value';

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  constructor(
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly interventionCalculator: IInterventionLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
  ) {}

  evaluate(profile: DeveloperProfile): DeveloperProfileResult {
    const sizeLevel = this.sizeCalculator.calculate(profile.size);
    const interventionLevel = this.interventionCalculator.calculate(profile.intervention);
    const parallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);

    return {
      overallLevel: lowestLevel(sizeLevel, interventionLevel, parallelismLevel),
      sizeLevel,
      harnessLevel: AiddLevelValue.white,
      interventionLevel,
      parallelismLevel,
      improvements: [],
    };
  }
}
