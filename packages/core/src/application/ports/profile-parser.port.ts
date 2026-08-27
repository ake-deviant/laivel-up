import { Result } from '../../domain/shared/result';
import { DeveloperProfile } from '../../domain/entities/developer-profile.entity';
import { ParseError } from '../../domain/errors/parse.error';

export interface IProfileParser {
  parse(raw: unknown): Result<DeveloperProfile, ParseError>;
}
