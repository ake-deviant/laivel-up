import { describe, expect, it } from 'vitest';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeProfile } from '../../../domain/entities/size-profile';
import {
  calculateWeightedAverageSizeScore,
  WeightedAverageSizeLevelCalculator,
} from '../../../domain/services/weighted-average-size-level-calculator.service';
import { defaultWeightedAverageSizeThresholdsConfig } from '../../../domain/services/weighted-average-size-thresholds.config';

const profile = (xs: number, s: number, m: number, l: number, xl: number): SizeProfile => ({
  distribution: { xs, s, m, l, xl },
  medianFilesChanged: null,
  medianLinesChanged: null,
});

describe('WeightedAverageSizeLevelCalculator', () => {
  const calculator = new WeightedAverageSizeLevelCalculator(
    defaultWeightedAverageSizeThresholdsConfig,
  );

  it('weights every size in the distribution', () => {
    expect(calculateWeightedAverageSizeScore(profile(0.1, 0.2, 0.3, 0.2, 0.2))).toBe(2.2);
  });

  it.each([
    [profile(1, 0, 0, 0, 0), AiddLevelValue.white],
    [profile(0.5, 0.5, 0, 0, 0), AiddLevelValue.red],
    [profile(0, 0.75, 0.25, 0, 0), AiddLevelValue.blue],
    [profile(0, 0, 1, 0, 0), AiddLevelValue.green],
    [profile(0, 0, 0.5, 0.5, 0), AiddLevelValue.copper],
    [profile(0, 0, 0, 1, 0), AiddLevelValue.silver],
    [profile(0, 0, 0, 0.5, 0.5), AiddLevelValue.gold],
  ])('maps the weighted score to its level', (size, expected) => {
    expect(calculator.calculate(size)).toBe(expected);
  });

  it('returns white when the distribution is missing', () => {
    expect(calculator.calculate({ ...profile(0, 0, 0, 0, 0), distribution: null })).toBe(
      AiddLevelValue.white,
    );
  });

  it('uses configured thresholds', () => {
    const stricter = new WeightedAverageSizeLevelCalculator({
      ...defaultWeightedAverageSizeThresholdsConfig,
      gold: 4,
    });
    expect(stricter.calculate(profile(0, 0, 0, 0.5, 0.5))).toBe(AiddLevelValue.silver);
  });
});
