import { IDeveloperProfileRepository } from '../../ports/developer-profile-repository.port';
import { IDeveloperProfileEvaluator } from '../../../domain/ports/developer-profile-evaluator.port';
import { IAxisSignalDetector } from '../../../domain/ports/axis-signal-detector.port';
import { IAxisReadinessChecker } from '../../../domain/ports/axis-readiness-checker.port';
import { ImprovementCollector } from '../../../domain/services/improvement-collector';
import { AxisImprovementService } from '../../../domain/services/axis-improvement.service';
import { DeveloperProfileResult } from '../../../domain/entities/developer-profile-result';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import { DeveloperInvalidProfileError } from '../../../domain/errors/developer-invalid-profile.error';
import { DomainError } from '../../../domain/errors/domain.error';
import { DeveloperProfileTriageService } from '../../../domain/services/developer-profile-triage.service';
import { Result, ok, err } from '../../../domain/shared/result';
import { ImprovementOpportunityService } from '../../../domain/services/improvement-opportunity.service';
import { DeliveryConfidenceProfile } from '../../../domain/entities/delivery-confidence-profile';
import { createDeliveryConfidenceLevelCalculator } from '../../../domain/services/delivery-confidence-level-calculator.service';
import { defaultDeliveryConfidenceConfig } from '../../../domain/services/delivery-confidence.config';
import { DeliveryConfidenceReadinessChecker } from '../../../domain/services/delivery-confidence-readiness-checker';
import { createDeliveryConfidenceSignalDetector } from '../../../domain/services/delivery-confidence-signal-detector';

export class EvaluateDeveloperProfileUseCase {
  private readonly triage = new DeveloperProfileTriageService();

  constructor(
    private readonly repository: IDeveloperProfileRepository,
    private readonly evaluator: IDeveloperProfileEvaluator,
    private readonly collector: ImprovementCollector,
    private readonly sizeDetector: IAxisSignalDetector<SizeProfile>,
    private readonly harnessDetector: IAxisSignalDetector<HarnessProfile>,
    private readonly interventionDetector: IAxisSignalDetector<InterventionProfile>,
    private readonly parallelismDetector: IAxisSignalDetector<ParallelismProfile>,
    private readonly velocityDetector: IAxisSignalDetector<VelocityProfile>,
    private readonly velocityReadinessChecker: IAxisReadinessChecker<VelocityProfile>,
    private readonly improvementService: AxisImprovementService,
    private readonly opportunityService?: ImprovementOpportunityService,
    private readonly deliveryConfidenceDetector: IAxisSignalDetector<DeliveryConfidenceProfile> = createDeliveryConfidenceSignalDetector(
      createDeliveryConfidenceLevelCalculator(defaultDeliveryConfidenceConfig),
      defaultDeliveryConfidenceConfig,
    ),
    private readonly deliveryConfidenceReadinessChecker: IAxisReadinessChecker<DeliveryConfidenceProfile> = new DeliveryConfidenceReadinessChecker(),
  ) {}

  execute(profileId: string): Result<DeveloperProfileResult, DomainError> {
    const profileResult = this.repository.findById(profileId);
    if (profileResult.isErr) return profileResult;

    const report = this.triage.triage(profileResult.value.profile);
    if (report.blockingIssues.length > 0) {
      return err(new DeveloperInvalidProfileError(report.blockingIssues));
    }

    const { profile, formatWarnings } = profileResult.value;
    const evaluated = this.evaluator.evaluate(profile);

    const velocityReadiness = this.velocityReadinessChecker.check(profile.velocity);
    const deliveryConfidenceReadiness = this.deliveryConfidenceReadinessChecker.check(
      profile.deliveryConfidence,
    );

    const signalMatrices = [
      this.sizeDetector.detect(profile.size),
      this.harnessDetector.detect(profile.harness),
      this.interventionDetector.detect(profile.intervention),
      this.parallelismDetector.detect(profile.parallelism),
      ...(velocityReadiness.calculable ? [this.velocityDetector.detect(profile.velocity)] : []),
      ...(deliveryConfidenceReadiness.calculable
        ? [this.deliveryConfidenceDetector.detect(profile.deliveryConfidence)]
        : []),
    ];

    const improvements = this.improvementService.derive(signalMatrices);

    return ok({
      ...evaluated,
      signalMatrices,
      improvements,
      busImprovements: this.collector.improvements,
      formatWarnings,
      impactingNulls: report.impactingNulls,
      ignoredNulls: report.ignoredNulls,
      improvementOpportunities: this.opportunityService?.detect(profile),
    });
  }
}
