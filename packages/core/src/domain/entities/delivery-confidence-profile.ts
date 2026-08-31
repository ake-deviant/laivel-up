import { SizeDistribution } from './size-distribution';

export interface DeliveryConfidenceContext {
  periodStart: string | null;
  periodEnd: string | null;
  activeDays: number | null;
  expectedRole: string | null;
  productCriticality: 'low' | 'medium' | 'high' | 'critical' | null;
  codebaseMaturity: 'legacy' | 'transitioning' | 'established' | 'greenfield' | null;
  teamStability: number | null;
  supportWorkRatio: number | null;
  incidentWorkRatio: number | null;
  availableSources: string[];
}

export interface BusinessImpactProfile {
  featuresCompletedCount: number | null;
  featuresAdoptedRatio: number | null;
  businessOutcomeAchievementRatio: number | null;
  abandonedWorkRatio: number | null;
  reworkRatio: number | null;
  timeToFirstValueDays: number | null;
}

export interface DeliveryReliabilityProfile {
  commitmentCompletionRatio: number | null;
  deliveryForecastAccuracy: number | null;
  scopeChangeAbsorptionRatio: number | null;
  blockedTimeRatio: number | null;
  dependencyWaitingTimeDays: number | null;
  medianCycleTimeDays: number | null;
  completionRate: number | null;
}

export interface QualityAndRiskProfile {
  changeFailureRate: number | null;
  escapedDefectRate: number | null;
  regressionRate: number | null;
  rollbackRate: number | null;
  hotfixRate: number | null;
  defectResolutionTimeDays: number | null;
  criticalCodeWithoutTestsRatio: number | null;
  testCoverageDelta: number | null;
  technicalDebtIntroducedRatio: number | null;
  technicalDebtResolvedRatio: number | null;
  securityIssueIntroductionRate: number | null;
  securityIssueResolutionTimeDays: number | null;
  productionIncidentContributionRate: number | null;
  incidentRecoveryContributionScore: number | null;
  observabilityCoverageRatio: number | null;
  rollbackPreparedRatio: number | null;
}

export interface AutonomyProfile {
  independentDeliveryRatio: number | null;
  clarificationRequestQuality: number | null;
  escalationRelevanceRatio: number | null;
  decisionReversalRate: number | null;
  humanCommitRatio: number | null;
  medianCorrectionCommitsAfterOpen: number | null;
  mergedWithoutHumanEditRatio: number | null;
}

export interface CollectiveImpactProfile {
  reviewHelpfulnessScore: number | null;
  reviewResponseTimeHours: number | null;
  reviewRiskDetectionRate: number | null;
  knowledgeSharingFrequency: number | null;
  busFactorContribution: number | null;
  crossTeamDeliveryRatio: number | null;
  mentoringImpactScore: number | null;
  handoverSuccessRatio: number | null;
  teamThroughputImpact: number | null;
  codeOwnershipConcentration: number | null;
  documentationFreshnessRatio: number | null;
}

export interface ComplexityProfile {
  problemAmbiguityScore: number | null;
  domainComplexityScore: number | null;
  technicalComplexityScore: number | null;
  dependencyComplexityScore: number | null;
  successfulComplexWorkRatio: number | null;
  simplificationImpactScore: number | null;
  architectureDecisionQualityScore: number | null;
  sizeDistribution: SizeDistribution | null;
}

export interface AiEffectivenessProfile {
  aiGeneratedChangeAcceptanceRatio: number | null;
  aiRelatedDefectRate: number | null;
  aiVerificationCoverageRatio: number | null;
  aiCostPerDeliveredOutcome: number | null;
  aiContextReuseRatio: number | null;
  parallelWorkCompletionRatio: number | null;
  aiCoauthoredRatio: number | null;
  medianConcurrentBranches: number | null;
  maxConcurrentBranches: number | null;
  hasWorktreeInclude: boolean | null;
}

export interface DeliveryConfidenceProfile {
  context: DeliveryConfidenceContext;
  businessImpact: BusinessImpactProfile;
  deliveryReliability: DeliveryReliabilityProfile;
  qualityAndRisk: QualityAndRiskProfile;
  autonomy: AutonomyProfile;
  collectiveImpact: CollectiveImpactProfile;
  complexity: ComplexityProfile;
  aiEffectiveness: AiEffectivenessProfile;
}

export function createEmptyDeliveryConfidenceProfile(): DeliveryConfidenceProfile {
  return {
    context: {
      periodStart: null,
      periodEnd: null,
      activeDays: null,
      expectedRole: null,
      productCriticality: null,
      codebaseMaturity: null,
      teamStability: null,
      supportWorkRatio: null,
      incidentWorkRatio: null,
      availableSources: [],
    },
    businessImpact: {
      featuresCompletedCount: null,
      featuresAdoptedRatio: null,
      businessOutcomeAchievementRatio: null,
      abandonedWorkRatio: null,
      reworkRatio: null,
      timeToFirstValueDays: null,
    },
    deliveryReliability: {
      commitmentCompletionRatio: null,
      deliveryForecastAccuracy: null,
      scopeChangeAbsorptionRatio: null,
      blockedTimeRatio: null,
      dependencyWaitingTimeDays: null,
      medianCycleTimeDays: null,
      completionRate: null,
    },
    qualityAndRisk: {
      changeFailureRate: null,
      escapedDefectRate: null,
      regressionRate: null,
      rollbackRate: null,
      hotfixRate: null,
      defectResolutionTimeDays: null,
      criticalCodeWithoutTestsRatio: null,
      testCoverageDelta: null,
      technicalDebtIntroducedRatio: null,
      technicalDebtResolvedRatio: null,
      securityIssueIntroductionRate: null,
      securityIssueResolutionTimeDays: null,
      productionIncidentContributionRate: null,
      incidentRecoveryContributionScore: null,
      observabilityCoverageRatio: null,
      rollbackPreparedRatio: null,
    },
    autonomy: {
      independentDeliveryRatio: null,
      clarificationRequestQuality: null,
      escalationRelevanceRatio: null,
      decisionReversalRate: null,
      humanCommitRatio: null,
      medianCorrectionCommitsAfterOpen: null,
      mergedWithoutHumanEditRatio: null,
    },
    collectiveImpact: {
      reviewHelpfulnessScore: null,
      reviewResponseTimeHours: null,
      reviewRiskDetectionRate: null,
      knowledgeSharingFrequency: null,
      busFactorContribution: null,
      crossTeamDeliveryRatio: null,
      mentoringImpactScore: null,
      handoverSuccessRatio: null,
      teamThroughputImpact: null,
      codeOwnershipConcentration: null,
      documentationFreshnessRatio: null,
    },
    complexity: {
      problemAmbiguityScore: null,
      domainComplexityScore: null,
      technicalComplexityScore: null,
      dependencyComplexityScore: null,
      successfulComplexWorkRatio: null,
      simplificationImpactScore: null,
      architectureDecisionQualityScore: null,
      sizeDistribution: null,
    },
    aiEffectiveness: {
      aiGeneratedChangeAcceptanceRatio: null,
      aiRelatedDefectRate: null,
      aiVerificationCoverageRatio: null,
      aiCostPerDeliveredOutcome: null,
      aiContextReuseRatio: null,
      parallelWorkCompletionRatio: null,
      aiCoauthoredRatio: null,
      medianConcurrentBranches: null,
      maxConcurrentBranches: null,
      hasWorktreeInclude: null,
    },
  };
}
