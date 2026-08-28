import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeProfile } from '../entities/size-profile';

export interface SizeThresholdsConfig {
  white: { minXs: number };
  red: { minS: number };
  blue: { minM: number };
  green: { minL: number };
  copper: { minXl: number; minLXl: number };
  silver: { minXl: number; minLXl: number };
  gold: { minXl: number; minLXl: number };
}

export class SizeLevelCalculatorService {
  constructor(private readonly thresholds: SizeThresholdsConfig) {}

  calculate(size: SizeProfile): AiddLevelValue {
    if (!size.distribution) return AiddLevelValue.white;

    const { xs, s, m, l, xl } = size.distribution;
    const v = (n: number | null) => n ?? 0;
    const xlVal = v(xl);
    const lXlVal = v(l) + xlVal;

    if (xlVal >= this.thresholds.gold.minXl && lXlVal >= this.thresholds.gold.minLXl)
      return AiddLevelValue.gold;
    if (xlVal >= this.thresholds.silver.minXl && lXlVal >= this.thresholds.silver.minLXl)
      return AiddLevelValue.silver;
    if (xlVal >= this.thresholds.copper.minXl && lXlVal >= this.thresholds.copper.minLXl)
      return AiddLevelValue.copper;

    const max = Math.max(v(s), v(m), v(l), v(xl));
    if (v(l) === max && v(l) >= this.thresholds.green.minL) return AiddLevelValue.green;
    if (v(m) === max && v(m) >= this.thresholds.blue.minM) return AiddLevelValue.blue;
    if (v(s) === max && v(s) >= this.thresholds.red.minS) return AiddLevelValue.red;

    if (v(xs) >= this.thresholds.white.minXs) return AiddLevelValue.white;
    return AiddLevelValue.white;
  }
}
