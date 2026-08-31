import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeProfile } from '../entities/size-profile';
import { ISizeLevelCalculator } from './size-level-calculator.service';

export interface WeightedAverageSizeThresholdsConfig {
  red: number;
  blue: number;
  green: number;
  copper: number;
  silver: number;
  gold: number;
}

const LEVELS_DESCENDING = [
  AiddLevelValue.gold,
  AiddLevelValue.silver,
  AiddLevelValue.copper,
  AiddLevelValue.green,
  AiddLevelValue.blue,
  AiddLevelValue.red,
] as const;

export function calculateWeightedAverageSizeScore(size: SizeProfile): number {
  if (!size.distribution) return 0;
  const { s, m, l, xl } = size.distribution;
  return (s ?? 0) + (m ?? 0) * 2 + (l ?? 0) * 3 + (xl ?? 0) * 4;
}

export class WeightedAverageSizeLevelCalculator implements ISizeLevelCalculator {
  constructor(private readonly thresholds: WeightedAverageSizeThresholdsConfig) {}

  calculate(size: SizeProfile): AiddLevelValue {
    const score = calculateWeightedAverageSizeScore(size);
    return (
      LEVELS_DESCENDING.find((level) => score >= this.thresholds[level]) ?? AiddLevelValue.white
    );
  }
}
