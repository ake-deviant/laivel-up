import { AiddEvaluatorConfig } from '../../domain/entities/aidd-evaluator-config';

export class AiddEvaluatorConfigFixture {
  static allBlocking(): AiddEvaluatorConfig {
    return { nonBlockingAxes: [] };
  }

  static withVelocityNonBlocking(): AiddEvaluatorConfig {
    return { nonBlockingAxes: ['velocity'] };
  }
}
