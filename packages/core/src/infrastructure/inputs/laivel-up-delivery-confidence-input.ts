import { z } from 'zod';

const number = z.number().nullable().optional().default(null);
const string = z.string().nullable().optional().default(null);
const ratioGroup = (shape: z.ZodRawShape) => z.object(shape).nullable().optional().default(null);

const context = z
  .object({
    periodStart: string,
    periodEnd: string,
    activeDays: number,
    expectedRole: string,
    productCriticality: z
      .enum(['low', 'medium', 'high', 'critical'])
      .nullable()
      .optional()
      .default(null),
    codebaseMaturity: z
      .enum(['legacy', 'transitioning', 'established', 'greenfield'])
      .nullable()
      .optional()
      .default(null),
    teamStability: number,
    supportWorkRatio: number,
    incidentWorkRatio: number,
    availableSources: z.array(z.string()).optional().default([]),
  })
  .nullable()
  .optional()
  .default(null);

const sizeDistribution = z
  .object({ xs: number, s: number, m: number, l: number, xl: number })
  .nullable()
  .optional()
  .default(null);

export const laivelUpDeliveryConfidenceInputSchema = z.object({
  context,
  businessImpact: ratioGroup({
    featuresCompletedCount: number,
    featuresAdoptedRatio: number,
    businessOutcomeAchievementRatio: number,
    abandonedWorkRatio: number,
    reworkRatio: number,
    timeToFirstValueDays: number,
  }),
  deliveryReliability: ratioGroup({
    commitmentCompletionRatio: number,
    deliveryForecastAccuracy: number,
    scopeChangeAbsorptionRatio: number,
    blockedTimeRatio: number,
    dependencyWaitingTimeDays: number,
    medianCycleTimeDays: number,
    completionRate: number,
  }),
  qualityAndRisk: ratioGroup({
    changeFailureRate: number,
    escapedDefectRate: number,
    regressionRate: number,
    rollbackRate: number,
    hotfixRate: number,
    defectResolutionTimeDays: number,
    criticalCodeWithoutTestsRatio: number,
    testCoverageDelta: number,
    technicalDebtIntroducedRatio: number,
    technicalDebtResolvedRatio: number,
    securityIssueIntroductionRate: number,
    securityIssueResolutionTimeDays: number,
    productionIncidentContributionRate: number,
    incidentRecoveryContributionScore: number,
    observabilityCoverageRatio: number,
    rollbackPreparedRatio: number,
  }),
  autonomy: ratioGroup({
    independentDeliveryRatio: number,
    clarificationRequestQuality: number,
    escalationRelevanceRatio: number,
    decisionReversalRate: number,
    humanCommitRatio: number,
    medianCorrectionCommitsAfterOpen: number,
    mergedWithoutHumanEditRatio: number,
  }),
  collectiveImpact: ratioGroup({
    reviewHelpfulnessScore: number,
    reviewResponseTimeHours: number,
    reviewRiskDetectionRate: number,
    knowledgeSharingFrequency: number,
    busFactorContribution: number,
    crossTeamDeliveryRatio: number,
    mentoringImpactScore: number,
    handoverSuccessRatio: number,
    teamThroughputImpact: number,
    codeOwnershipConcentration: number,
    documentationFreshnessRatio: number,
  }),
  complexity: ratioGroup({
    problemAmbiguityScore: number,
    domainComplexityScore: number,
    technicalComplexityScore: number,
    dependencyComplexityScore: number,
    successfulComplexWorkRatio: number,
    simplificationImpactScore: number,
    architectureDecisionQualityScore: number,
    sizeDistribution,
  }),
  aiEffectiveness: z
    .object({
      aiGeneratedChangeAcceptanceRatio: number,
      aiRelatedDefectRate: number,
      aiVerificationCoverageRatio: number,
      aiCostPerDeliveredOutcome: number,
      aiContextReuseRatio: number,
      parallelWorkCompletionRatio: number,
      aiCoauthoredRatio: number,
      medianConcurrentBranches: number,
      maxConcurrentBranches: number,
      hasWorktreeInclude: z.boolean().nullable().optional().default(null),
    })
    .nullable()
    .optional()
    .default(null),
});

export type LaivelUpDeliveryConfidenceInput = z.infer<typeof laivelUpDeliveryConfidenceInputSchema>;
