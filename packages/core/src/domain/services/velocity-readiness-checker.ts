import { AxisReadiness, IAxisReadinessChecker } from '../ports/axis-readiness-checker.port';
import { VelocityProfile } from '../entities/velocity-profile';

export class VelocityReadinessChecker implements IAxisReadinessChecker<VelocityProfile> {
  check(profile: VelocityProfile): AxisReadiness {
    const missingEssential: string[] = [];
    const missingImpacting: string[] = [];

    if (profile.sprintCount === null) missingEssential.push('sprintCount');
    if (profile.storyPointsPerSprint === null) missingEssential.push('storyPointsPerSprint');
    if (profile.teamAvgStoryPointsPerSprint === null)
      missingEssential.push('teamAvgStoryPointsPerSprint');

    if (profile.completionRate === null) missingImpacting.push('completionRate');
    if (profile.medianDaysTicketToPr === null) missingImpacting.push('medianDaysTicketToPr');
    if (profile.teamAvgMedianDaysTicketToPr === null)
      missingImpacting.push('teamAvgMedianDaysTicketToPr');

    return {
      calculable: missingEssential.length === 0,
      missingEssential,
      missingImpacting,
    };
  }
}
