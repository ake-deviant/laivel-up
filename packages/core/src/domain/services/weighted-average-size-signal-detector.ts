import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeProfile } from '../entities/size-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import {
  calculateWeightedAverageSizeScore,
  WeightedAverageSizeThresholdsConfig,
} from './weighted-average-size-level-calculator.service';

const NEXT_LEVEL: Partial<Record<AiddLevelValue, AiddLevelValue>> = {
  white: AiddLevelValue.red,
  red: AiddLevelValue.blue,
  blue: AiddLevelValue.green,
  green: AiddLevelValue.copper,
  copper: AiddLevelValue.silver,
  silver: AiddLevelValue.gold,
};

export function createWeightedAverageSizeSignalDetector(
  thresholds: WeightedAverageSizeThresholdsConfig,
  calculator: ISizeLevelCalculator,
): IAxisSignalDetector<SizeProfile> {
  return {
    detect(profile) {
      const currentLevel = calculator.calculate(profile);
      const nextLevel = NEXT_LEVEL[currentLevel] ?? null;
      const score = calculateWeightedAverageSizeScore(profile);
      const target = nextLevel
        ? thresholds[nextLevel as keyof WeightedAverageSizeThresholdsConfig]
        : null;
      return {
        axis: 'size',
        currentLevel,
        nextLevel,
        signals:
          nextLevel && target !== null
            ? [{ name: 'weightedAverage', value: score, validated: score >= target }]
            : [],
      };
    },
  };
}
