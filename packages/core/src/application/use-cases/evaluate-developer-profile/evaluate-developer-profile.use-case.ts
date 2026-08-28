import { IDeveloperProfileRepository } from '../../ports/developer-profile-repository.port';
import { IDeveloperProfileEvaluator } from '../../../domain/ports/developer-profile-evaluator.port';
import { DeveloperProfileResult } from '../../../domain/entities/developer-profile-result';
import { DeveloperInvalidProfileError } from '../../../domain/errors/developer-invalid-profile.error';
import { DomainError } from '../../../domain/errors/domain.error';
import { DeveloperProfileTriageService } from '../../../domain/services/developer-profile-triage.service';
import { Result, ok, err } from '../../../domain/shared/result';

export class EvaluateDeveloperProfileUseCase {
  private readonly triage = new DeveloperProfileTriageService();

  constructor(
    private readonly repository: IDeveloperProfileRepository,
    private readonly evaluator: IDeveloperProfileEvaluator,
  ) {}

  execute(profileId: string): Result<DeveloperProfileResult, DomainError> {
    const profileResult = this.repository.findById(profileId);
    if (profileResult.isErr) return profileResult;

    const report = this.triage.triage(profileResult.value);
    if (report.blockingIssues.length > 0) {
      return err(new DeveloperInvalidProfileError(report.blockingIssues));
    }

    return ok(this.evaluator.evaluate(profileResult.value));
  }
}
