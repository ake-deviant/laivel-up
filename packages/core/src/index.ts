// Domain shared
export type { Result } from './domain/shared/result';
export { ok, err, Ok, Err } from './domain/shared/result';
export { DomainError } from './domain/errors/domain.error';
export { ParseError } from './domain/errors/parse.error';
export type { DeveloperProfile } from './domain/entities/developer-profile';

// Application ports
export type { IProfileParser } from './application/ports/profile-parser.port';

// Infrastructure
export { ZodProfileParser } from './infrastructure/parsers/zod-profile-parser';
