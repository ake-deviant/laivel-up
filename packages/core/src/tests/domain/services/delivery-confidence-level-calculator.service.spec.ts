import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeliveryConfidenceProfile } from '../../../domain/entities/delivery-confidence-profile';
import { createDeliveryConfidenceLevelCalculator } from '../../../domain/services/delivery-confidence-level-calculator.service';
import { defaultDeliveryConfidenceConfig } from '../../../domain/services/delivery-confidence.config';

const emptyProfile = (): DeliveryConfidenceProfile => ({
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
});

describe('DeliveryConfidenceLevelCalculatorService', () => {
  const calculator = createDeliveryConfidenceLevelCalculator(defaultDeliveryConfidenceConfig);

  it('returns white when readiness is not met', () => {
    expect(calculator.calculate(emptyProfile()).level).toBe(AiddLevelValue.white);
  });

  it('returns gold for complete high-confidence data', () => {
    const profile = emptyProfile();
    profile.context = {
      ...profile.context,
      activeDays: 90,
      availableSources: ['product-outcomes', 'delivery-flow', 'deployments', 'reviews'],
    };
    for (const group of [
      profile.businessImpact,
      profile.deliveryReliability,
      profile.qualityAndRisk,
      profile.autonomy,
      profile.collectiveImpact,
      profile.complexity,
      profile.aiEffectiveness,
    ]) {
      for (const key of Object.keys(group)) {
        if (key !== 'sizeDistribution' && key !== 'hasWorktreeInclude')
          (group as Record<string, unknown>)[key] = 0.95;
      }
    }
    profile.businessImpact.featuresCompletedCount = 12;
    profile.businessImpact.abandonedWorkRatio = 0;
    profile.businessImpact.reworkRatio = 0;
    profile.businessImpact.timeToFirstValueDays = 1;
    profile.deliveryReliability.blockedTimeRatio = 0;
    profile.deliveryReliability.dependencyWaitingTimeDays = 0;
    profile.deliveryReliability.medianCycleTimeDays = 1;
    profile.qualityAndRisk.changeFailureRate = 0;
    profile.qualityAndRisk.escapedDefectRate = 0;
    profile.qualityAndRisk.regressionRate = 0;
    profile.qualityAndRisk.rollbackRate = 0;
    profile.qualityAndRisk.hotfixRate = 0;
    profile.qualityAndRisk.criticalCodeWithoutTestsRatio = 0;
    profile.qualityAndRisk.technicalDebtIntroducedRatio = 0;
    profile.qualityAndRisk.securityIssueIntroductionRate = 0;
    profile.qualityAndRisk.productionIncidentContributionRate = 0;
    profile.qualityAndRisk.testCoverageDelta = 0.2;
    profile.qualityAndRisk.defectResolutionTimeDays = 0;
    profile.qualityAndRisk.securityIssueResolutionTimeDays = 0;
    profile.collectiveImpact.reviewResponseTimeHours = 1;
    profile.collectiveImpact.codeOwnershipConcentration = 0;
    profile.autonomy.decisionReversalRate = 0;
    profile.autonomy.medianCorrectionCommitsAfterOpen = 0;
    profile.aiEffectiveness.aiRelatedDefectRate = 0;
    profile.aiEffectiveness.aiCostPerDeliveredOutcome = 1;
    profile.aiEffectiveness.hasWorktreeInclude = true;

    expect(calculator.calculate(profile).level).toBe(AiddLevelValue.gold);
  });

  it('caps a high score below silver when the change failure gate fails', () => {
    const profile = emptyProfile();
    profile.context = {
      ...profile.context,
      activeDays: 90,
      availableSources: ['product-outcomes', 'delivery-flow', 'deployments'],
    };
    profile.businessImpact = {
      ...profile.businessImpact,
      featuresAdoptedRatio: 1,
      businessOutcomeAchievementRatio: 1,
    };
    profile.deliveryReliability = {
      ...profile.deliveryReliability,
      commitmentCompletionRatio: 1,
      completionRate: 1,
    };
    profile.qualityAndRisk = {
      ...profile.qualityAndRisk,
      changeFailureRate: 0.3,
      securityIssueIntroductionRate: 0,
    };
    profile.autonomy = { ...profile.autonomy, independentDeliveryRatio: 1 };

    expect(calculator.calculate(profile).level).not.toBe(AiddLevelValue.silver);
    expect(calculator.calculate(profile).level).not.toBe(AiddLevelValue.gold);
  });
});
