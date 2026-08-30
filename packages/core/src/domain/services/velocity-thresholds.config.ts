import { VelocityThresholdsConfig } from './velocity-level-calculator.service';

export const defaultVelocityThresholdsConfig: VelocityThresholdsConfig = {
  levels: {
    gold: {
      minLeverageRatio: 2.0,
      minCompletionRate: 0.9,
      minCycleTimeRatio: 2.0,
      minFeatureRatio: 0.7,
    },
    silver: {
      minLeverageRatio: 1.8,
      minCompletionRate: 0.85,
      minCycleTimeRatio: 1.5,
      minFeatureRatio: null,
    },
    copper: {
      minLeverageRatio: 1.5,
      minCompletionRate: 0.8,
      minCycleTimeRatio: null,
      minFeatureRatio: null,
    },
    green: {
      minLeverageRatio: 1.2,
      minCompletionRate: 0.7,
      minCycleTimeRatio: null,
      minFeatureRatio: null,
    },
    blue: {
      minLeverageRatio: 1.0,
      minCompletionRate: null,
      minCycleTimeRatio: null,
      minFeatureRatio: null,
    },
  },
};
