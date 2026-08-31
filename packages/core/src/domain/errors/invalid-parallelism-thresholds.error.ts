import { DomainError } from './domain.error';

export class InvalidParallelismThresholdsError extends DomainError {
  constructor(readonly reason: string) {
    super(`Invalid parallelism thresholds: ${reason}`);
  }
}
