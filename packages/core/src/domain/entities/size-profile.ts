import { SizeDistribution } from './size-distribution';

export interface SizeProfile {
  distribution: SizeDistribution | null;
  medianFilesChanged: number | null;
  medianLinesChanged: number | null;
}
