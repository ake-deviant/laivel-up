import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeProfile } from '../entities/size-profile';

export interface SizeThresholdsConfig {
  copper: { minXl: number; minLXl: number };
  silver: { minXl: number; minLXl: number };
  gold: { minXl: number; minLXl: number };
}

export class SizeLevelCalculatorService {
  constructor(private readonly thresholds: SizeThresholdsConfig) {}

  calculate(_size: SizeProfile): AiddLevelValue {
    return AiddLevelValue.white;
  }
}
