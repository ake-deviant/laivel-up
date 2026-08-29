import { InterventionThresholdsConfig } from '../../domain/services/intervention-level-calculator.service';

export const interventionThresholdsConfigFixture: InterventionThresholdsConfig = {
  levels: {
    gold: {
      maxCorrectionCommits: 0,
      maxHumanCommitRatio: 0,
      minMergedWithoutHumanEditRatio: 1,
      maxReviewComments: null,
    },
    silver: {
      maxCorrectionCommits: 0,
      maxHumanCommitRatio: 0.15,
      minMergedWithoutHumanEditRatio: 0.5,
      maxReviewComments: 2,
    },
    copper: {
      maxCorrectionCommits: 1,
      maxHumanCommitRatio: null,
      minMergedWithoutHumanEditRatio: null,
      maxReviewComments: 3,
    },
    blue: {
      maxCorrectionCommits: 3,
      maxHumanCommitRatio: null,
      minMergedWithoutHumanEditRatio: null,
      maxReviewComments: 5,
    },
  },
};
