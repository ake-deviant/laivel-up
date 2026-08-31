import { AiddLevelValue } from '../entities/aidd-level-value';
import { DeliveryConfidenceProfile } from '../entities/delivery-confidence-profile';
import { DeliveryConfidenceReadinessChecker } from './delivery-confidence-readiness-checker';
import { DeliveryConfidenceConfig } from './delivery-confidence.config';

export interface DeliveryConfidenceScores {
  businessImpactScore: number | null;
  deliveryReliabilityScore: number | null;
  qualityAndRiskScore: number | null;
  autonomyScore: number | null;
  collectiveImpactScore: number | null;
  aiEffectivenessScore: number | null;
  complexityMultiplier: number;
  dataConfidenceScore: number;
  deliveryConfidenceScore: number | null;
}

export interface DeliveryConfidenceCalculation {
  level: AiddLevelValue;
  scores: DeliveryConfidenceScores;
}

export interface IDeliveryConfidenceLevelCalculator {
  calculate(profile: DeliveryConfidenceProfile): DeliveryConfidenceCalculation;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const positive = (value: number | null) => (value === null ? null : clamp(value * 100));
const inverse = (value: number | null) => (value === null ? null : clamp((1 - value) * 100));
const inverseRange = (value: number | null, maximum: number) =>
  value === null ? null : clamp((1 - value / maximum) * 100);
const average = (values: Array<number | null>): number | null => {
  const available = values.filter((value): value is number => value !== null);
  return available.length === 0
    ? null
    : available.reduce((sum, value) => sum + value, 0) / available.length;
};

function numericCoverage(profile: DeliveryConfidenceProfile): number {
  const values = Object.values(profile).flatMap((group) => Object.values(group));
  const measurable = values.filter((value) => typeof value === 'number' || value === null);
  return measurable.length === 0
    ? 0
    : (measurable.filter((value) => typeof value === 'number').length / measurable.length) * 100;
}

export class DeliveryConfidenceLevelCalculatorService implements IDeliveryConfidenceLevelCalculator {
  private readonly readiness = new DeliveryConfidenceReadinessChecker();

  constructor(private readonly config: DeliveryConfidenceConfig) {}

  calculate(profile: DeliveryConfidenceProfile): DeliveryConfidenceCalculation {
    const scores = this.calculateScores(profile);
    if (!this.readiness.check(profile).calculable || scores.deliveryConfidenceScore === null)
      return { level: AiddLevelValue.white, scores };

    const score = scores.deliveryConfidenceScore;
    const { levels, gates } = this.config;
    const changeFailureRate = profile.qualityAndRisk.changeFailureRate!;
    const securityRate = profile.qualityAndRisk.securityIssueIntroductionRate;
    const goldGates =
      changeFailureRate <= gates.maxChangeFailureRateForGold &&
      securityRate !== null &&
      securityRate <= gates.maxSecurityIssueIntroductionRateForGold &&
      scores.dataConfidenceScore >= gates.minDataConfidenceScoreForGold &&
      (scores.qualityAndRiskScore ?? 0) >= 85 &&
      (scores.businessImpactScore ?? 0) >= 80 &&
      (scores.deliveryReliabilityScore ?? 0) >= 80;
    const silverGates =
      changeFailureRate <= gates.maxChangeFailureRateForSilver &&
      scores.dataConfidenceScore >= gates.minDataConfidenceScoreForSilver &&
      (scores.qualityAndRiskScore ?? 0) >= 70;

    if (score >= levels.gold && goldGates) return { level: AiddLevelValue.gold, scores };
    if (score >= levels.silver && silverGates) return { level: AiddLevelValue.silver, scores };
    if (score >= levels.copper) return { level: AiddLevelValue.copper, scores };
    if (score >= levels.green) return { level: AiddLevelValue.green, scores };
    if (score >= levels.blue) return { level: AiddLevelValue.blue, scores };
    if (score >= levels.red) return { level: AiddLevelValue.red, scores };
    return { level: AiddLevelValue.white, scores };
  }

  private calculateScores(profile: DeliveryConfidenceProfile): DeliveryConfidenceScores {
    const b = profile.businessImpact;
    const d = profile.deliveryReliability;
    const q = profile.qualityAndRisk;
    const a = profile.autonomy;
    const c = profile.collectiveImpact;
    const ai = profile.aiEffectiveness;
    const businessImpactScore = average([
      positive(b.featuresAdoptedRatio),
      positive(b.businessOutcomeAchievementRatio),
      inverse(b.abandonedWorkRatio),
      inverse(b.reworkRatio),
      inverseRange(b.timeToFirstValueDays, 20),
    ]);
    const deliveryReliabilityScore = average([
      positive(d.commitmentCompletionRatio),
      positive(d.deliveryForecastAccuracy),
      positive(d.scopeChangeAbsorptionRatio),
      inverse(d.blockedTimeRatio),
      inverseRange(d.dependencyWaitingTimeDays, 10),
      inverseRange(d.medianCycleTimeDays, 20),
      positive(d.completionRate),
    ]);
    const qualityAndRiskScore = average([
      inverse(q.changeFailureRate),
      inverse(q.escapedDefectRate),
      inverse(q.regressionRate),
      inverse(q.rollbackRate),
      inverse(q.hotfixRate),
      inverseRange(q.defectResolutionTimeDays, 15),
      inverse(q.criticalCodeWithoutTestsRatio),
      q.testCoverageDelta === null ? null : clamp((q.testCoverageDelta + 0.2) * 250),
      inverse(q.technicalDebtIntroducedRatio),
      positive(q.technicalDebtResolvedRatio),
      inverse(q.securityIssueIntroductionRate),
      inverseRange(q.securityIssueResolutionTimeDays, 15),
      inverse(q.productionIncidentContributionRate),
      positive(q.incidentRecoveryContributionScore),
      positive(q.observabilityCoverageRatio),
      positive(q.rollbackPreparedRatio),
    ]);
    const autonomyScore = average([
      positive(a.independentDeliveryRatio),
      positive(a.clarificationRequestQuality),
      positive(a.escalationRelevanceRatio),
      inverse(a.decisionReversalRate),
      inverseRange(a.medianCorrectionCommitsAfterOpen, 8),
      positive(a.mergedWithoutHumanEditRatio),
    ]);
    const collectiveImpactScore = average([
      positive(c.reviewHelpfulnessScore),
      inverseRange(c.reviewResponseTimeHours, 48),
      positive(c.reviewRiskDetectionRate),
      positive(c.knowledgeSharingFrequency),
      positive(c.busFactorContribution),
      positive(c.crossTeamDeliveryRatio),
      positive(c.mentoringImpactScore),
      positive(c.handoverSuccessRatio),
      c.teamThroughputImpact === null ? null : clamp((c.teamThroughputImpact + 0.2) * 250),
      inverse(c.codeOwnershipConcentration),
      positive(c.documentationFreshnessRatio),
    ]);
    const aiEffectivenessScore = average([
      positive(ai.aiGeneratedChangeAcceptanceRatio),
      inverse(ai.aiRelatedDefectRate),
      positive(ai.aiVerificationCoverageRatio),
      inverseRange(ai.aiCostPerDeliveredOutcome, 25),
      positive(ai.aiContextReuseRatio),
      positive(ai.parallelWorkCompletionRatio),
    ]);
    const complexityScore =
      average([
        positive(profile.complexity.problemAmbiguityScore),
        positive(profile.complexity.domainComplexityScore),
        positive(profile.complexity.technicalComplexityScore),
        positive(profile.complexity.dependencyComplexityScore),
      ]) ?? 50;
    const { min, max } = this.config.complexityMultiplier;
    const complexityMultiplier = min + (complexityScore / 100) * (max - min);
    const weighted = [
      [businessImpactScore, this.config.weights.businessImpact],
      [deliveryReliabilityScore, this.config.weights.deliveryReliability],
      [qualityAndRiskScore, this.config.weights.qualityAndRisk],
      [autonomyScore, this.config.weights.autonomy],
      [collectiveImpactScore, this.config.weights.collectiveImpact],
      [aiEffectivenessScore, this.config.weights.aiEffectiveness],
    ] as Array<[number | null, number]>;
    const available = weighted.filter((entry): entry is [number, number] => entry[0] !== null);
    const weightTotal = available.reduce((sum, [, weight]) => sum + weight, 0);
    const baseScore =
      weightTotal === 0
        ? null
        : available.reduce((sum, [score, weight]) => sum + score * weight, 0) / weightTotal;
    return {
      businessImpactScore,
      deliveryReliabilityScore,
      qualityAndRiskScore,
      autonomyScore,
      collectiveImpactScore,
      aiEffectivenessScore,
      complexityMultiplier,
      dataConfidenceScore: numericCoverage(profile),
      deliveryConfidenceScore: baseScore === null ? null : clamp(baseScore * complexityMultiplier),
    };
  }
}

export const createDeliveryConfidenceLevelCalculator = (
  config: DeliveryConfidenceConfig,
): IDeliveryConfidenceLevelCalculator => new DeliveryConfidenceLevelCalculatorService(config);
