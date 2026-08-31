import { DeliveryConfidenceReadinessChecker } from '../../../domain/services/delivery-confidence-readiness-checker';
import { DeliveryConfidenceProfile } from '../../../domain/entities/delivery-confidence-profile';

describe('DeliveryConfidenceReadinessChecker', () => {
  it('requires a sufficient period, source diversity and essential outcomes', () => {
    const checker = new DeliveryConfidenceReadinessChecker();
    const profile = {
      context: {
        activeDays: 45,
        availableSources: ['product-outcomes', 'delivery-flow', 'deployments'],
      },
      businessImpact: { featuresAdoptedRatio: 0.8, businessOutcomeAchievementRatio: 0.7 },
      deliveryReliability: { completionRate: 0.9 },
      qualityAndRisk: { changeFailureRate: 0.02 },
      autonomy: { independentDeliveryRatio: 0.8 },
      collectiveImpact: { reviewHelpfulnessScore: 0.7 },
      aiEffectiveness: { aiVerificationCoverageRatio: 0.9 },
    } as DeliveryConfidenceProfile;

    expect(checker.check(profile).calculable).toBe(true);
  });
});
