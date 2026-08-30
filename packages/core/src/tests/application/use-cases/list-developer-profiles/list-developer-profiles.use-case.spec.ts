import { ListDeveloperProfilesUseCase } from '../../../../application/use-cases/list-developer-profiles/list-developer-profiles.use-case';
import { IDeveloperProfileRepository } from '../../../../application/ports/developer-profile-repository.port';
import { DeveloperProfileSummary } from '../../../../domain/entities/developer-profile-summary';
import { DataSource } from '../../../../domain/entities/data-source';
import { Result } from '../../../../domain/shared/result';
import { DeveloperProfileRepositoryResult } from '../../../../application/ports/developer-profile-repository.port';
import { ParseError } from '../../../../domain/errors/parse.error';

const makeSummary = (id: string): DeveloperProfileSummary => ({
  id,
  role: 'développeur senior',
  experienceYears: 5,
  stack: ['TypeScript'],
  teamSize: 4,
  note: null,
  availableSources: [DataSource.gitActivity],
});

class StubRepository implements IDeveloperProfileRepository {
  constructor(private readonly summaries: DeveloperProfileSummary[]) {}
  findAll(): DeveloperProfileSummary[] {
    return this.summaries;
  }
  findById(_id: string): Result<DeveloperProfileRepositoryResult, ParseError> {
    throw new Error('not used');
  }
}

describe('List developer profiles use case', () => {
  describe('when the repository returns profiles', () => {
    it('returns all summaries', () => {
      // arrange
      const summaries = [makeSummary('arthur'), makeSummary('gauvain')];
      const useCase = new ListDeveloperProfilesUseCase(new StubRepository(summaries));

      // act
      const result = useCase.execute();

      // assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('arthur');
      expect(result[1].id).toBe('gauvain');
    });
  });

  describe('when the repository returns an empty list', () => {
    it('returns an empty array', () => {
      // arrange
      const useCase = new ListDeveloperProfilesUseCase(new StubRepository([]));

      // act
      const result = useCase.execute();

      // assert
      expect(result).toEqual([]);
    });
  });
});
