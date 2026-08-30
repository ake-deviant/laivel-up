import { AxisSignalMatrix } from '../entities/axis-signal-matrix';

export interface IAxisSignalDetector<TProfile> {
  detect(profile: TProfile): AxisSignalMatrix;
}
