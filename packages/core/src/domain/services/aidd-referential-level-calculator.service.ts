import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { AiddLevelValue, lowestLevel } from '../entities/aidd-level-value';

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  constructor(
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
  ) {}

  evaluate(profile: DeveloperProfile): DeveloperProfileResult {
    const sizeLevel = this.sizeCalculator.calculate(profile.size);
    const parallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);

    return {
      overallLevel: lowestLevel(sizeLevel, parallelismLevel),
      sizeLevel,
      harnessLevel: AiddLevelValue.white,
      interventionLevel: AiddLevelValue.white,
      parallelismLevel,
      improvements: [],
    };
  }
}
