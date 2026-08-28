import { AiddLevelValue } from '../entities/aidd-level-value';
import { SizeProfile } from '../entities/size-profile';

export interface SizeThresholdsConfig {
  copper: { minXl: number; minLXl: number };
  silver: { minXl: number; minLXl: number };
  gold: { minXl: number; minLXl: number };
}

export class SizeLevelCalculatorService {
  constructor(private readonly thresholds: SizeThresholdsConfig) {}

  calculate(size: SizeProfile): AiddLevelValue {
    if (!size.distribution) return AiddLevelValue.white;

    const { s, m, l, xl } = size.distribution;
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
    if (v(l) === max) return AiddLevelValue.green;
    if (v(m) === max) return AiddLevelValue.blue;
    if (v(s) === max) return AiddLevelValue.red;

    return AiddLevelValue.white;
  }
}
