import { IDeveloperProfileRepository } from '../../ports/developer-profile-repository.port';
import { IDeveloperProfileEvaluator } from '../../../domain/ports/developer-profile-evaluator.port';
import { IAxisSignalDetector } from '../../../domain/ports/axis-signal-detector.port';
import { ImprovementCollector } from '../../../domain/services/improvement-collector';
import { AxisImprovementService } from '../../../domain/services/axis-improvement.service';
import { DeveloperProfileResult } from '../../../domain/entities/developer-profile-result';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { DeveloperInvalidProfileError } from '../../../domain/errors/developer-invalid-profile.error';
import { DomainError } from '../../../domain/errors/domain.error';
import { DeveloperProfileTriageService } from '../../../domain/services/developer-profile-triage.service';
import { Result, ok, err } from '../../../domain/shared/result';

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
    private readonly improvementService: AxisImprovementService,
  ) {}

  execute(profileId: string): Result<DeveloperProfileResult, DomainError> {
    const profileResult = this.repository.findById(profileId);
    if (profileResult.isErr) return profileResult;

    const report = this.triage.triage(profileResult.value);
    if (report.blockingIssues.length > 0) {
      return err(new DeveloperInvalidProfileError(report.blockingIssues));
    }

    const profile = profileResult.value;
    const evaluated = this.evaluator.evaluate(profile);

    const signalMatrices = [
      this.sizeDetector.detect(profile.size),
      this.harnessDetector.detect(profile.harness),
      this.interventionDetector.detect(profile.intervention),
      this.parallelismDetector.detect(profile.parallelism),
    ];

    const improvements = this.improvementService.derive(signalMatrices);

    return ok({
      ...evaluated,
      signalMatrices,
      improvements,
      busImprovements: this.collector.improvements,
    });
  }
}
