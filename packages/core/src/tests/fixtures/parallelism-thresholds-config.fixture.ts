import { ParallelismThresholdsConfig } from '../../domain/services/parallelism-level-calculator.service';

export const parallelismThresholdsConfigFixture: ParallelismThresholdsConfig = {
  weights: { median: 5, max: 1 },
  levels: {
    gold: { minScore: 30, requiresWorktree: true },
    silver: { minScore: 25 },
    copper: { minScore: 20 },
    green: { minScore: 15 },
    blue: { minScore: 10 },
    red: { minScore: 7 },
  },
};
