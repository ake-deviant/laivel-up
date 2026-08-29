import { EvaluateDeveloperProfileUseCase } from '../../../../application/use-cases/evaluate-developer-profile/evaluate-developer-profile.use-case';
import { IDeveloperProfileRepository } from '../../../../application/ports/developer-profile-repository.port';
import { IDeveloperProfileEvaluator } from '../../../../domain/ports/developer-profile-evaluator.port';
import { DeveloperProfile } from '../../../../domain/entities/developer-profile';
import { DeveloperProfileResult } from '../../../../domain/entities/developer-profile-result';
import { AiddLevelValue } from '../../../../domain/entities/aidd-level-value';
import { ParseError } from '../../../../domain/errors/parse.error';
import { DeveloperInvalidProfileError } from '../../../../domain/errors/developer-invalid-profile.error';
import { Result, ok, err } from '../../../../domain/shared/result';
import { DeveloperProfileFixture } from '../../../fixtures/developer-profile.fixture';
import { ImprovementCollector } from '../../../../domain/services/improvement-collector';

class InMemoryDeveloperProfileRepository implements IDeveloperProfileRepository {
  constructor(private readonly result: Result<DeveloperProfile, ParseError>) {}
  findById(_profileId: string): Result<DeveloperProfile, ParseError> {
    return this.result;
  }
}

const stubResult: DeveloperProfileResult = {
  overallLevel: AiddLevelValue.white,
  sizeLevel: AiddLevelValue.white,
  harnessLevel: AiddLevelValue.white,
  interventionLevel: AiddLevelValue.white,
  parallelismLevel: AiddLevelValue.white,
  improvements: [],
};

const stubEvaluator: IDeveloperProfileEvaluator = {
  evaluate: (): DeveloperProfileResult => stubResult,
};

describe('EvaluateDeveloperProfileUseCase', () => {
  it('should return ParseError when repository fails', () => {
    const parseError = new ParseError('missing profile_id', ['profile_id']);
    const repo = new InMemoryDeveloperProfileRepository(err(parseError));
    const useCase = new EvaluateDeveloperProfileUseCase(
      repo,
      stubEvaluator,
      new ImprovementCollector(),
    );

    const result = useCase.execute('arthur');

    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error).toBeInstanceOf(ParseError);
  });

  it('should return DeveloperProfileResult when profile is valid', () => {
    const repo = new InMemoryDeveloperProfileRepository(ok(DeveloperProfileFixture.valid()));
    const useCase = new EvaluateDeveloperProfileUseCase(
      repo,
      stubEvaluator,
      new ImprovementCollector(),
    );

    const result = useCase.execute('arthur');

    expect(result.isOk).toBe(true);
    if (result.isOk) expect(result.value).toEqual(stubResult);
  });

  it('should return DeveloperInvalidProfileError when profile has no id', () => {
    const repo = new InMemoryDeveloperProfileRepository(ok(DeveloperProfileFixture.withoutId()));
    const useCase = new EvaluateDeveloperProfileUseCase(
      repo,
      stubEvaluator,
      new ImprovementCollector(),
    );

    const result = useCase.execute('arthur');

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(DeveloperInvalidProfileError);
      expect((result.error as DeveloperInvalidProfileError).issues).toContain('id');
    }
  });
});
