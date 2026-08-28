import { DataSource } from './data-source';
import { HarnessProfile } from './harness-profile';
import { InterventionProfile } from './intervention-profile';
import { ParallelismProfile } from './parallelism-profile';
import { Profile } from './profile';
import { SizeProfile } from './size-profile';

export interface DeveloperProfile {
  id: string;
  availableSources: DataSource[];
  profile: Profile | null;
  size: SizeProfile;
  harness: HarnessProfile;
  intervention: InterventionProfile;
  parallelism: ParallelismProfile;
}
