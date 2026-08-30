// Domain shared
export type { Result } from './domain/shared/result';
export { ok, err, Ok, Err } from './domain/shared/result';
export { DomainError } from './domain/errors/domain.error';
export { ParseError } from './domain/errors/parse.error';
export type { DeveloperProfile } from './domain/entities/developer-profile';
export type { DeveloperProfileResult } from './domain/entities/developer-profile-result';
export type { Improvement, ImprovementAxis } from './domain/entities/improvement';

// Domain ports
export type {
  ILevelImprovementBus,
  LevelImprovementEvent,
} from './domain/ports/level-improvement-bus.port';
export { noopLevelImprovementBus } from './domain/ports/level-improvement-bus.port';

// Domain services
export { ImprovementCollector } from './domain/services/improvement-collector';
export { AiddReferentialLevelCalculatorService } from './domain/services/aidd-referential-level-calculator.service';
export { SizeLevelCalculatorService } from './domain/services/size-level-calculator.service';
export type { ISizeLevelCalculator } from './domain/services/size-level-calculator.service';
export { defaultSizeThresholdsConfig } from './domain/services/size-thresholds.config';
export { createInterventionLevelCalculator } from './domain/services/intervention-level-calculator.service';
export type { IInterventionLevelCalculator } from './domain/services/intervention-level-calculator.service';
export { defaultInterventionThresholdsConfig } from './domain/services/intervention-thresholds.config';
export { createWeightedParallelismLevelCalculator } from './domain/services/parallelism-level-calculator.service';
export type { IParallelismLevelCalculator } from './domain/services/parallelism-level-calculator.service';
export { defaultParallelismThresholdsConfig } from './domain/services/parallelism-thresholds.config';
export { createHarnessLevelCalculator } from './domain/services/harness-level-calculator.service';
export type { IHarnessLevelCalculator } from './domain/services/harness-level-calculator.service';
export { defaultHarnessThresholdsConfig } from './domain/services/harness-thresholds.config';

// Application ports
export type { IProfileParser } from './application/ports/profile-parser.port';
export type { IDeveloperProfileRepository } from './application/ports/developer-profile-repository.port';

// Domain ports
export type { IDeveloperProfileEvaluator } from './domain/ports/developer-profile-evaluator.port';

// Application use cases
export { EvaluateDeveloperProfileUseCase } from './application/use-cases/evaluate-developer-profile/evaluate-developer-profile.use-case';

// Infrastructure
export { ZodProfileParser } from './infrastructure/parsers/zod-profile-parser';
export { LaivelUpDeveloperProfileRepository } from './infrastructure/repositories/laivel-up-developer-profile-repository';
