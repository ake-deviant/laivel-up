import { DeveloperProfile } from '../../domain/entities/developer-profile';

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
};

export class DeveloperProfileFixture {
  static valid(): DeveloperProfile {
    return { ...base };
  }

  static withoutId(): DeveloperProfile {
    return { ...base, id: '' };
  }
}
