import { EvaluateDeveloperProfileUseCase } from '../../../../application/use-cases/evaluate-developer-profile/evaluate-developer-profile.use-case';
import { DeveloperInvalidProfileError } from '../../../../domain/errors/developer-invalid-profile.error';
import { IDeveloperProfileEvaluator } from '../../../../domain/ports/developer-profile-evaluator.port';
import { DeveloperProfile } from '../../../../domain/entities/developer-profile';
import { DeveloperProfileResult } from '../../../../domain/entities/developer-profile-result';
import { DeveloperProfileFixture } from '../../../fixtures/developer-profile.fixture';

const stubEvaluator: IDeveloperProfileEvaluator = {
  evaluate: (profile: DeveloperProfile): DeveloperProfileResult => ({
    id: profile.id,
    name: profile.name,
  }),
};

const useCase = new EvaluateDeveloperProfileUseCase(stubEvaluator);

describe('EvaluateDeveloperProfileUseCase', () => {
  it('should return DeveloperInvalidProfileError when id is empty', () => {
    const result = useCase.execute(DeveloperProfileFixture.withoutId());

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(DeveloperInvalidProfileError);
      expect(result.error.issues).toContain('id');
    }
  });

  it('should pass when name is null', () => {
    const result = useCase.execute(DeveloperProfileFixture.withoutName());

    expect(result.isOk).toBe(true);
  });

  it('should report all blocking issues when id is empty and name is null', () => {
    const result = useCase.execute(DeveloperProfileFixture.withoutIdAndName());

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error.issues).toContain('id');
    }
  });
});
