// Domain shared
export type { Result } from './domain/shared/result';
export { ok, err, Ok, Err } from './domain/shared/result';
export { DomainError } from './domain/errors/domain.error';
export { ParseError } from './domain/errors/parse.error';
export type { DeveloperProfile } from './domain/entities/developer-profile';
export type { DeveloperProfileSummary } from './domain/entities/developer-profile-summary';
export type {
  DeveloperProfileResult,
  AxisProfiles,
} from './domain/entities/developer-profile-result';
export type { Improvement, ImprovementAxis } from './domain/entities/improvement';
export type { AxisSignalMatrix } from './domain/entities/axis-signal-matrix';
export type { Signal } from './domain/entities/signal';
export type { SizeProfile } from './domain/entities/size-profile';
export type { HarnessProfile } from './domain/entities/harness-profile';
export type { InterventionProfile } from './domain/entities/intervention-profile';
export type { ParallelismProfile } from './domain/entities/parallelism-profile';
export type { VelocityProfile } from './domain/entities/velocity-profile';
export type { AiddEvaluatorConfig, AxisName } from './domain/entities/aidd-evaluator-config';
export type {
  HarnessContextEngineeringWeights,
  HarnessAiConfigurationWeights,
} from './domain/services/harness-level-calculator.service';

// Domain ports
export type {
  ILevelImprovementBus,
  LevelImprovementEvent,
} from './domain/ports/level-improvement-bus.port';
export { noopLevelImprovementBus } from './domain/ports/level-improvement-bus.port';
export type { IAxisSignalDetector } from './domain/ports/axis-signal-detector.port';
export type {
  IAxisReadinessChecker,
  AxisReadiness,
} from './domain/ports/axis-readiness-checker.port';

// Domain services
export { ImprovementCollector } from './domain/services/improvement-collector';
export { AiddReferentialLevelCalculatorService } from './domain/services/aidd-referential-level-calculator.service';
export { SizeLevelCalculatorService } from './domain/services/size-level-calculator.service';
export type { ISizeLevelCalculator } from './domain/services/size-level-calculator.service';
export { defaultSizeThresholdsConfig } from './domain/services/size-thresholds.config';
export { createInterventionLevelCalculator } from './domain/services/intervention-level-calculator.service';
export type { IInterventionLevelCalculator } from './domain/services/intervention-level-calculator.service';
export { defaultInterventionThresholdsConfig } from './domain/services/intervention-thresholds.config';
export {
  createParallelismLevelCalculator,
  createWeightedParallelismLevelCalculator,
  WeightedParallelismScoringStrategy,
  MedianOnlyParallelismScoringStrategy,
} from './domain/services/parallelism-level-calculator.service';
export type {
  IParallelismLevelCalculator,
  IParallelismScoringStrategy,
} from './domain/services/parallelism-level-calculator.service';
export { defaultParallelismThresholdsConfig } from './domain/services/parallelism-thresholds.config';
export { createHarnessLevelCalculator } from './domain/services/harness-level-calculator.service';
export type { IHarnessLevelCalculator } from './domain/services/harness-level-calculator.service';
export { defaultHarnessThresholdsConfig } from './domain/services/harness-thresholds.config';
export {
  CapabilityGatesHarnessLevelCalculator,
  createCapabilityGatesHarnessLevelCalculator,
  defaultCapabilityGatesHarnessConfig,
} from './domain/services/capability-gates-harness-level-calculator.service';
export type { CapabilityGatesHarnessConfig } from './domain/services/capability-gates-harness-level-calculator.service';
export { createSizeSignalDetector } from './domain/services/size-signal-detector';
export { createHarnessSignalDetector } from './domain/services/harness-signal-detector';
export { createCapabilityGatesHarnessSignalDetector } from './domain/services/capability-gates-harness-signal-detector';
export { createInterventionSignalDetector } from './domain/services/intervention-signal-detector';
export { createParallelismSignalDetector } from './domain/services/parallelism-signal-detector';
export { createVelocitySignalDetector } from './domain/services/velocity-signal-detector';
export { createVelocityLevelCalculator } from './domain/services/velocity-level-calculator.service';
export type { IVelocityLevelCalculator } from './domain/services/velocity-level-calculator.service';
export { defaultVelocityThresholdsConfig } from './domain/services/velocity-thresholds.config';
export { VelocityReadinessChecker } from './domain/services/velocity-readiness-checker';
export { AxisImprovementService } from './domain/services/axis-improvement.service';
export { ImprovementOpportunityService } from './domain/services/improvement-opportunity.service';
export type {
  ImprovementOpportunity,
  OpportunityAxis,
} from './domain/services/improvement-opportunity.service';
export { ImprovementFieldDefinitionRegistry } from './domain/services/improvement-field-definition-registry';
export type { ImprovementFieldDefinition } from './domain/services/improvement-field-definition-registry';
export { SizeImprovementOpportunityDetector } from './domain/services/size-improvement-opportunity-detector';
export { InterventionImprovementOpportunityDetector } from './domain/services/intervention-improvement-opportunity-detector';
export { ParallelismImprovementOpportunityDetector } from './domain/services/parallelism-improvement-opportunity-detector';
export { VelocityImprovementOpportunityDetector } from './domain/services/velocity-improvement-opportunity-detector';
export type {
  IImprovementOpportunityService,
  IAxisImprovementOpportunityDetector,
} from './domain/ports/improvement-opportunity-service.port';

// Application ports
export type { IProfileParser } from './application/ports/profile-parser.port';
export type {
  IDeveloperProfileRepository,
  DeveloperProfileRepositoryResult,
} from './application/ports/developer-profile-repository.port';

// Domain ports
export type { IDeveloperProfileEvaluator } from './domain/ports/developer-profile-evaluator.port';

// Application use cases
export { EvaluateDeveloperProfileUseCase } from './application/use-cases/evaluate-developer-profile/evaluate-developer-profile.use-case';
export { ListDeveloperProfilesUseCase } from './application/use-cases/list-developer-profiles/list-developer-profiles.use-case';

// Infrastructure
export { ZodProfileParser } from './infrastructure/parsers/zod-profile-parser';
export { LaivelUpDeveloperProfileRepository } from './infrastructure/repositories/laivel-up-developer-profile-repository';

// Presentation
export { DeveloperProfileResultPresenter } from './presentation/developer-profile-result.presenter';
export type {
  DeveloperProfileResultViewModel,
  LevelViewModel,
  AxisViewModel,
  AxisReadinessViewModel,
  ImprovementViewModel,
  ImprovementOpportunityViewModel,
  SignalViewModel,
  AxisFieldViewModel,
  AxisFieldGroupViewModel,
  FormatWarningViewModel,
  MissingDataAxisViewModel,
  MissingDataFieldViewModel,
  MissingDataGroupViewModel,
} from './presentation/developer-profile-result.view-model';
