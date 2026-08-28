import { SizeThresholdsConfig } from '../../domain/services/size-level-calculator.service';

export const sizeThresholdsConfigFixture: SizeThresholdsConfig = {
  white: { minXs: 0 },
  red: { minS: 0.5 },
  blue: { minM: 0.5 },
  green: { minL: 0.5 },
  copper: { minXl: 0.2, minLXl: 0.5 },
  silver: { minXl: 0.2, minLXl: 0.6 },
  gold: { minXl: 0.4, minLXl: 0.6 },
};
