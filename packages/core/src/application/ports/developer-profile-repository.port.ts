import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { ParseError } from '../../domain/errors/parse.error';
import { Result } from '../../domain/shared/result';

export interface IDeveloperProfileRepository {
  findById(profileId: string): Result<DeveloperProfile, ParseError>;
}
