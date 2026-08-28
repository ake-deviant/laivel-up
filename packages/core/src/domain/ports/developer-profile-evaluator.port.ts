import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';

export interface IDeveloperProfileEvaluator {
  evaluate(profile: DeveloperProfile): DeveloperProfileResult;
}
