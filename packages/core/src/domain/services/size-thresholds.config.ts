import { SizeThresholdsConfig } from './size-level-calculator.service';

export const defaultSizeThresholdsConfig: SizeThresholdsConfig = {
  copper: { minXl: 0.2, minLXl: 0.5 },
  silver: { minXl: 0.2, minLXl: 0.6 },
  gold: { minXl: 0.4, minLXl: 0.6 },
};
