import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { ParseError } from '../../domain/errors/parse.error';
import { FormatWarning } from '../../domain/shared/format-warning';
import { Result } from '../../domain/shared/result';

export interface ProfileParseResult {
  profile: DeveloperProfile;
  formatWarnings: FormatWarning[];
}

export interface IProfileParser {
  parse(raw: unknown): Result<ProfileParseResult, ParseError>;
}
