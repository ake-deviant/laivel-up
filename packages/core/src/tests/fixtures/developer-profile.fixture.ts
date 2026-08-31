import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { createEmptyDeliveryConfidenceProfile } from '../../domain/entities/delivery-confidence-profile';

const base: DeveloperProfile = {
  id: 'test',
  availableSources: [],
  profile: null,
  size: { distribution: null, medianFilesChanged: null, medianLinesChanged: null },
  harness: { contextEngineering: null, aiConfiguration: null, loops: null },
  intervention: {
    totalPrCount: null,
    medianCorrectionCommitsAfterOpen: null,
    mergedWithoutHumanEditCount: null,
    mergedWithoutHumanEditRatio: null,
    medianReviewCommentsReceived: null,
    humanCommitRatio: null,
  },
  parallelism: {
    maxConcurrentBranches: null,
    medianConcurrentBranches: null,
    hasWorktreeInclude: null,
  },
  velocity: {
    sprintCount: null,
    storyPointsPerSprint: null,
    teamAvgStoryPointsPerSprint: null,
    completionRate: null,
    medianDaysTicketToPr: null,
    teamAvgMedianDaysTicketToPr: null,
    featuresPerSprint: null,
    bugsPerSprint: null,
  },
  deliveryConfidence: createEmptyDeliveryConfidenceProfile(),
};

export class DeveloperProfileFixture {
  static valid(): DeveloperProfile {
    return { ...base };
  }

  static withoutId(): DeveloperProfile {
    return { ...base, id: '' };
  }
}
