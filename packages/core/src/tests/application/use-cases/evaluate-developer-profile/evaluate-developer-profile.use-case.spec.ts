import { EvaluateDeveloperProfileUseCase } from '../../../../application/use-cases/evaluate-developer-profile/evaluate-developer-profile.use-case';
import { IDeveloperProfileRepository } from '../../../../application/ports/developer-profile-repository.port';
import { IDeveloperProfileEvaluator } from '../../../../domain/ports/developer-profile-evaluator.port';
import { IAxisSignalDetector } from '../../../../domain/ports/axis-signal-detector.port';
import { DeveloperProfile } from '../../../../domain/entities/developer-profile';
import { DeveloperProfileResult } from '../../../../domain/entities/developer-profile-result';
import { AxisSignalMatrix } from '../../../../domain/entities/axis-signal-matrix';
import { AiddLevelValue } from '../../../../domain/entities/aidd-level-value';
import { ParseError } from '../../../../domain/errors/parse.error';
import { DeveloperInvalidProfileError } from '../../../../domain/errors/developer-invalid-profile.error';
import { Result, ok, err } from '../../../../domain/shared/result';
import { DeveloperProfileFixture } from '../../../fixtures/developer-profile.fixture';
import { ImprovementCollector } from '../../../../domain/services/improvement-collector';
import { AxisImprovementService } from '../../../../domain/services/axis-improvement.service';
import { SizeProfile } from '../../../../domain/entities/size-profile';
import { HarnessProfile } from '../../../../domain/entities/harness-profile';
import { InterventionProfile } from '../../../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../../../domain/entities/parallelism-profile';

class InMemoryDeveloperProfileRepository implements IDeveloperProfileRepository {
  constructor(private readonly result: Result<DeveloperProfile, ParseError>) {}
  findById(_profileId: string): Result<DeveloperProfile, ParseError> {
    return this.result;
  }
}

const stubMatrix = (axis: AxisSignalMatrix['axis']): AxisSignalMatrix => ({
  axis,
  currentLevel: AiddLevelValue.white,
  nextLevel: AiddLevelValue.red,
  signals: [],
});

const stubDetector = <T>(axis: AxisSignalMatrix['axis']): IAxisSignalDetector<T> => ({
  detect: (_profile: T) => stubMatrix(axis),
});

const stubResult: DeveloperProfileResult = {
  overallLevel: AiddLevelValue.white,
  sizeLevel: AiddLevelValue.white,
  harnessLevel: AiddLevelValue.white,
  interventionLevel: AiddLevelValue.white,
  parallelismLevel: AiddLevelValue.white,
  axisProfiles: {
    size: DeveloperProfileFixture.valid().size,
    harness: DeveloperProfileFixture.valid().harness,
    intervention: DeveloperProfileFixture.valid().intervention,
    parallelism: DeveloperProfileFixture.valid().parallelism,
  },
  signalMatrices: [],
  improvements: [],
  busImprovements: [],
};

const stubEvaluator: IDeveloperProfileEvaluator = {
  evaluate: (): DeveloperProfileResult => stubResult,
};

function makeUseCase(repo: IDeveloperProfileRepository) {
  return new EvaluateDeveloperProfileUseCase(
    repo,
    stubEvaluator,
    new ImprovementCollector(),
    stubDetector<SizeProfile>('size'),
    stubDetector<HarnessProfile>('harness'),
    stubDetector<InterventionProfile>('intervention'),
    stubDetector<ParallelismProfile>('parallelism'),
    new AxisImprovementService(),
  );
}

describe('EvaluateDeveloperProfileUseCase', () => {
  it('should return ParseError when repository fails', () => {
    const parseError = new ParseError('missing profile_id', ['profile_id']);
    const repo = new InMemoryDeveloperProfileRepository(err(parseError));
    const useCase = makeUseCase(repo);

    const result = useCase.execute('arthur');

    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error).toBeInstanceOf(ParseError);
  });

  it('should return DeveloperProfileResult when profile is valid', () => {
    const repo = new InMemoryDeveloperProfileRepository(ok(DeveloperProfileFixture.valid()));
    const useCase = makeUseCase(repo);

    const result = useCase.execute('arthur');

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.overallLevel).toBe(AiddLevelValue.white);
      expect(result.value.signalMatrices).toHaveLength(4);
      expect(result.value.improvements).toHaveLength(0);
      expect(result.value.busImprovements).toHaveLength(0);
    }
  });

  it('should return DeveloperInvalidProfileError when profile has no id', () => {
    const repo = new InMemoryDeveloperProfileRepository(ok(DeveloperProfileFixture.withoutId()));
    const useCase = makeUseCase(repo);

    const result = useCase.execute('arthur');

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(DeveloperInvalidProfileError);
      expect((result.error as DeveloperInvalidProfileError).issues).toContain('id');
    }
  });
});
