export interface InterventionProfile {
  totalPrCount: number | null;
  medianCorrectionCommitsAfterOpen: number | null;
  mergedWithoutHumanEditCount: number | null;
  mergedWithoutHumanEditRatio: number | null;
  medianReviewCommentsReceived: number | null;
  humanCommitRatio: number | null;
}
