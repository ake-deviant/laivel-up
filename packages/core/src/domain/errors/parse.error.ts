import { DomainError } from './domain.error';

export class ParseError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
