import { DomainError } from './domain.error';

export class DeveloperInvalidProfileError extends DomainError {
  constructor(public readonly issues: string[]) {
    super(`Invalid profile: ${issues.join(', ')}`);
  }
}
