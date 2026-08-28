import { DeveloperProfile } from '../../../domain/entities/developer-profile';
import { DeveloperProfileResult } from '../../../domain/entities/developer-profile-result';
import { DeveloperInvalidProfileError } from '../../../domain/errors/developer-invalid-profile.error';
import { IDeveloperProfileEvaluator } from '../../../domain/ports/developer-profile-evaluator.port';
import { DeveloperProfileTriageService } from '../../../domain/services/developer-profile-triage.service';
import { Result, ok, err } from '../../../domain/shared/result';

export class EvaluateDeveloperProfileUseCase {
  private readonly triage = new DeveloperProfileTriageService();

  constructor(private readonly evaluator: IDeveloperProfileEvaluator) {}

  execute(profile: DeveloperProfile): Result<DeveloperProfileResult, DeveloperInvalidProfileError> {
    const report = this.triage.triage(profile);

    if (report.blockingIssues.length > 0) {
      return err(new DeveloperInvalidProfileError(report.blockingIssues));
    }

    return ok(this.evaluator.evaluate(profile));
  }
}
