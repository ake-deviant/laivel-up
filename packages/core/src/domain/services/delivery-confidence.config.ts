export interface DeliveryConfidenceConfig {
  weights: {
    businessImpact: number;
    deliveryReliability: number;
    qualityAndRisk: number;
    autonomy: number;
    collectiveImpact: number;
    aiEffectiveness: number;
  };
  levels: {
    red: number;
    blue: number;
    green: number;
    copper: number;
    silver: number;
    gold: number;
  };
  gates: {
    maxChangeFailureRateForSilver: number;
    maxChangeFailureRateForGold: number;
    maxSecurityIssueIntroductionRateForGold: number;
    minDataConfidenceScoreForSilver: number;
    minDataConfidenceScoreForGold: number;
  };
  readiness: { requiredDays: number; minSourceDiversityCount: number };
  complexityMultiplier: { min: number; max: number };
}

export const defaultDeliveryConfidenceConfig: DeliveryConfidenceConfig = {
  weights: {
    businessImpact: 25,
    deliveryReliability: 20,
    qualityAndRisk: 25,
    autonomy: 15,
    collectiveImpact: 10,
    aiEffectiveness: 5,
  },
  levels: { red: 20, blue: 35, green: 50, copper: 65, silver: 78, gold: 90 },
  gates: {
    maxChangeFailureRateForSilver: 0.1,
    maxChangeFailureRateForGold: 0.05,
    maxSecurityIssueIntroductionRateForGold: 0,
    minDataConfidenceScoreForSilver: 45,
    minDataConfidenceScoreForGold: 75,
  },
  readiness: { requiredDays: 30, minSourceDiversityCount: 3 },
  complexityMultiplier: { min: 0.95, max: 1.05 },
};
