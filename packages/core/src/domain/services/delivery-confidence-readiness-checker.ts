import { DeliveryConfidenceProfile } from '../entities/delivery-confidence-profile';
import { AxisReadiness, IAxisReadinessChecker } from '../ports/axis-readiness-checker.port';
import { defaultDeliveryConfidenceConfig } from './delivery-confidence.config';

export class DeliveryConfidenceReadinessChecker implements IAxisReadinessChecker<DeliveryConfidenceProfile> {
  check(profile: DeliveryConfidenceProfile): AxisReadiness {
    const missingEssential: string[] = [];
    const missingImpacting: string[] = [];
    const requiredDays = defaultDeliveryConfidenceConfig.readiness.requiredDays;
    const minSources = defaultDeliveryConfidenceConfig.readiness.minSourceDiversityCount;

    if (profile.context.activeDays === null || profile.context.activeDays < requiredDays)
      missingEssential.push('context.activeDays');
    if (profile.context.availableSources.length < minSources)
      missingEssential.push('context.availableSources');
    if (profile.businessImpact.featuresAdoptedRatio === null)
      missingEssential.push('businessImpact.featuresAdoptedRatio');
    if (profile.businessImpact.businessOutcomeAchievementRatio === null)
      missingEssential.push('businessImpact.businessOutcomeAchievementRatio');
    if (profile.deliveryReliability.completionRate === null)
      missingEssential.push('deliveryReliability.completionRate');
    if (profile.qualityAndRisk.changeFailureRate === null)
      missingEssential.push('qualityAndRisk.changeFailureRate');
    if (profile.autonomy.independentDeliveryRatio === null)
      missingEssential.push('autonomy.independentDeliveryRatio');

    if (profile.collectiveImpact.reviewHelpfulnessScore === null)
      missingImpacting.push('collectiveImpact.reviewHelpfulnessScore');
    if (profile.aiEffectiveness.aiVerificationCoverageRatio === null)
      missingImpacting.push('aiEffectiveness.aiVerificationCoverageRatio');

    return { calculable: missingEssential.length === 0, missingEssential, missingImpacting };
  }
}
