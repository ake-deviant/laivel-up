import { DomainError } from './domain.error';

export class ParseError extends DomainError {
  constructor(
    message: string,
    public readonly blockingFields: string[],
  ) {
    super(message);
  }
}
