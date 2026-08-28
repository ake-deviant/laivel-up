import { AiddLevelValue } from './aidd-level-value';
import { Improvement } from './improvement';

export interface DeveloperProfileResult {
  overallLevel: AiddLevelValue;
  sizeLevel: AiddLevelValue;
  harnessLevel: AiddLevelValue;
  interventionLevel: AiddLevelValue;
  parallelismLevel: AiddLevelValue;
  improvements: Improvement[];
}
