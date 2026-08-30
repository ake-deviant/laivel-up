import { AiddLevelValue } from './aidd-level-value';
import { AxisSignalMatrix } from './axis-signal-matrix';
import { Improvement } from './improvement';
import { SizeProfile } from './size-profile';
import { HarnessProfile } from './harness-profile';
import { InterventionProfile } from './intervention-profile';
import { ParallelismProfile } from './parallelism-profile';
import { FormatWarning } from '../shared/format-warning';

export interface AxisProfiles {
  size: SizeProfile;
  harness: HarnessProfile;
  intervention: InterventionProfile;
  parallelism: ParallelismProfile;
}

export interface DeveloperProfileResult {
  overallLevel: AiddLevelValue;
  sizeLevel: AiddLevelValue;
  harnessLevel: AiddLevelValue;
  interventionLevel: AiddLevelValue;
  parallelismLevel: AiddLevelValue;
  axisProfiles: AxisProfiles;
  signalMatrices: AxisSignalMatrix[];
  improvements: Improvement[];
  busImprovements: Improvement[];
  formatWarnings: FormatWarning[];
  impactingNulls: string[];
  ignoredNulls: string[];
}
