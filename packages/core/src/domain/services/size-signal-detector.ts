import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { Signal } from '../entities/signal';
import { SizeProfile } from '../entities/size-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import { SizeThresholdsConfig } from './size-level-calculator.service';

const LEVEL_ORDER: AiddLevelValue[] = [
  AiddLevelValue.white,
  AiddLevelValue.red,
  AiddLevelValue.blue,
  AiddLevelValue.green,
  AiddLevelValue.copper,
  AiddLevelValue.silver,
  AiddLevelValue.gold,
];

function v(n: number | null): number {
  return n ?? 0;
}

function computeCurrentLevel(size: SizeProfile, config: SizeThresholdsConfig): AiddLevelValue {
  if (!size.distribution) return AiddLevelValue.white;
  const { s, m, l, xl } = size.distribution;
  const xlVal = v(xl);
  const lXlVal = v(l) + xlVal;

  if (xlVal >= config.gold.minXl && lXlVal >= config.gold.minLXl) return AiddLevelValue.gold;
  if (xlVal >= config.silver.minXl && lXlVal >= config.silver.minLXl) return AiddLevelValue.silver;
  if (xlVal >= config.copper.minXl && lXlVal >= config.copper.minLXl) return AiddLevelValue.copper;

  const max = Math.max(v(s), v(m), v(l), v(xl));
  if (v(l) === max && v(l) >= config.green.minL) return AiddLevelValue.green;
  if (v(m) === max && v(m) >= config.blue.minM) return AiddLevelValue.blue;
  if (v(s) === max && v(s) >= config.red.minS) return AiddLevelValue.red;

  return AiddLevelValue.white;
}

function getNextLevel(current: AiddLevelValue): AiddLevelValue | null {
  const index = LEVEL_ORDER.indexOf(current);
  return index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

function buildSignals(
  size: SizeProfile,
  next: AiddLevelValue,
  config: SizeThresholdsConfig,
): Signal[] {
  const dist = size.distribution;
  if (!dist) return [];

  if (
    next === AiddLevelValue.gold ||
    next === AiddLevelValue.silver ||
    next === AiddLevelValue.copper
  ) {
    const cfg = config[next];
    const xlVal = v(dist?.xl);
    const lXlVal = v(dist?.l) + xlVal;
    return [
      { name: 'xl', validated: xlVal >= cfg.minXl, value: dist?.xl ?? null },
      { name: 'lXl', validated: lXlVal >= cfg.minLXl, value: dist ? v(dist.l) + v(dist.xl) : null },
    ];
  }

  if (next === AiddLevelValue.green) {
    return [{ name: 'l', validated: v(dist?.l) >= config.green.minL, value: dist?.l ?? null }];
  }
  if (next === AiddLevelValue.blue) {
    return [{ name: 'm', validated: v(dist?.m) >= config.blue.minM, value: dist?.m ?? null }];
  }
  if (next === AiddLevelValue.red) {
    return [{ name: 's', validated: v(dist?.s) >= config.red.minS, value: dist?.s ?? null }];
  }

  return [];
}

class SizeSignalDetectorService implements IAxisSignalDetector<SizeProfile> {
  constructor(private readonly config: SizeThresholdsConfig) {}

  detect(profile: SizeProfile): AxisSignalMatrix {
    const current = computeCurrentLevel(profile, this.config);
    const next = getNextLevel(current);

    return {
      axis: 'size',
      currentLevel: current,
      nextLevel: next,
      signals: buildSignals(profile, next ?? current, this.config),
    };
  }
}

export function createSizeSignalDetector(
  config: SizeThresholdsConfig,
): IAxisSignalDetector<SizeProfile> {
  return new SizeSignalDetectorService(config);
}
