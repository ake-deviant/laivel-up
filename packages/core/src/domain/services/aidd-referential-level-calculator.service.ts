import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { AiddLevelValue } from '../entities/aidd-level-value';

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  evaluate(_profile: DeveloperProfile): DeveloperProfileResult {
    return {
      overallLevel: AiddLevelValue.white,
      sizeLevel: AiddLevelValue.white,
      harnessLevel: AiddLevelValue.white,
      interventionLevel: AiddLevelValue.white,
      parallelismLevel: AiddLevelValue.white,
      improvements: [],
    };
  }
}
