import { IDeveloperProfileRepository } from '../../ports/developer-profile-repository.port';
import { DeveloperProfileSummary } from '../../../domain/entities/developer-profile-summary';

export class ListDeveloperProfilesUseCase {
  constructor(private readonly repository: IDeveloperProfileRepository) {}

  execute(): DeveloperProfileSummary[] {
    return this.repository.findAll();
  }
}
