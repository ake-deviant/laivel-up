import { createContainer, ResolveFunction } from '@evyweb/ioctopus';
import {
  LaivelUpDeveloperProfileRepository,
  ZodProfileParser,
  ImprovementCollector,
  AiddReferentialLevelCalculatorService,
  EvaluateDeveloperProfileUseCase,
  AxisImprovementService,
  ImprovementOpportunityService,
  createWeightedParallelismLevelCalculator,
  defaultParallelismThresholdsConfig,
  createInterventionLevelCalculator,
  defaultInterventionThresholdsConfig,
  SizeLevelCalculatorService,
  defaultSizeThresholdsConfig,
  createHarnessLevelCalculator,
  defaultHarnessThresholdsConfig,
  createSizeSignalDetector,
  createHarnessSignalDetector,
  createInterventionSignalDetector,
  createParallelismSignalDetector,
  IHarnessLevelCalculator,
  IInterventionLevelCalculator,
  IParallelismLevelCalculator,
  ISizeLevelCalculator,
  IAxisSignalDetector,
  IDeveloperProfileRepository,
  IDeveloperProfileEvaluator,
  SizeProfile,
  HarnessProfile,
  InterventionProfile,
  ParallelismProfile,
} from '@laivel-up/core';
import { DI } from './di';

const r = <T>(resolve: ResolveFunction, token: symbol): T => resolve(token) as T;

const container = createContainer();

container.bind(DI.PROFILES_BASE_DIR).toValue(process.env.PROFILES_BASE_DIR ?? '');

container.bind(DI.PROFILE_PARSER).toClass(ZodProfileParser, []);

container
  .bind(DI.DEVELOPER_PROFILE_REPOSITORY)
  .toClass(LaivelUpDeveloperProfileRepository, [DI.PROFILE_PARSER, DI.PROFILES_BASE_DIR]);

container.bind(DI.IMPROVEMENT_COLLECTOR).toClass(ImprovementCollector, [], 'scoped');

container
  .bind(DI.SIZE_LEVEL_CALCULATOR)
  .toFactory(() => new SizeLevelCalculatorService(defaultSizeThresholdsConfig));

container
  .bind(DI.INTERVENTION_LEVEL_CALCULATOR)
  .toFactory(() => createInterventionLevelCalculator(defaultInterventionThresholdsConfig));

container
  .bind(DI.PARALLELISM_LEVEL_CALCULATOR)
  .toFactory(() => createWeightedParallelismLevelCalculator(defaultParallelismThresholdsConfig));

container
  .bind(DI.HARNESS_LEVEL_CALCULATOR)
  .toFactory(() => createHarnessLevelCalculator(defaultHarnessThresholdsConfig));

container
  .bind(DI.SIZE_SIGNAL_DETECTOR)
  .toFactory(() => createSizeSignalDetector(defaultSizeThresholdsConfig));

container
  .bind(DI.HARNESS_SIGNAL_DETECTOR)
  .toFactory(() => createHarnessSignalDetector(defaultHarnessThresholdsConfig));

container
  .bind(DI.INTERVENTION_SIGNAL_DETECTOR)
  .toFactory(() => createInterventionSignalDetector(defaultInterventionThresholdsConfig));

container
  .bind(DI.PARALLELISM_SIGNAL_DETECTOR)
  .toFactory(() => createParallelismSignalDetector(defaultParallelismThresholdsConfig));

container.bind(DI.AXIS_IMPROVEMENT_SERVICE).toClass(AxisImprovementService, []);
container
  .bind(DI.IMPROVEMENT_OPPORTUNITY_SERVICE)
  .toFactory(
    (resolve: ResolveFunction) =>
      new ImprovementOpportunityService(
        r<IHarnessLevelCalculator>(resolve, DI.HARNESS_LEVEL_CALCULATOR),
      ),
  );

container
  .bind(DI.DEVELOPER_PROFILE_EVALUATOR)
  .toFactory(
    (resolve: ResolveFunction) =>
      new AiddReferentialLevelCalculatorService(
        r<ISizeLevelCalculator>(resolve, DI.SIZE_LEVEL_CALCULATOR),
        r<IHarnessLevelCalculator>(resolve, DI.HARNESS_LEVEL_CALCULATOR),
        r<IInterventionLevelCalculator>(resolve, DI.INTERVENTION_LEVEL_CALCULATOR),
        r<IParallelismLevelCalculator>(resolve, DI.PARALLELISM_LEVEL_CALCULATOR),
      ),
    'scoped',
  );

container
  .bind(DI.EVALUATE_DEVELOPER_PROFILE_USE_CASE)
  .toFactory(
    (resolve: ResolveFunction) =>
      new EvaluateDeveloperProfileUseCase(
        r<IDeveloperProfileRepository>(resolve, DI.DEVELOPER_PROFILE_REPOSITORY),
        r<IDeveloperProfileEvaluator>(resolve, DI.DEVELOPER_PROFILE_EVALUATOR),
        r<ImprovementCollector>(resolve, DI.IMPROVEMENT_COLLECTOR),
        r<IAxisSignalDetector<SizeProfile>>(resolve, DI.SIZE_SIGNAL_DETECTOR),
        r<IAxisSignalDetector<HarnessProfile>>(resolve, DI.HARNESS_SIGNAL_DETECTOR),
        r<IAxisSignalDetector<InterventionProfile>>(resolve, DI.INTERVENTION_SIGNAL_DETECTOR),
        r<IAxisSignalDetector<ParallelismProfile>>(resolve, DI.PARALLELISM_SIGNAL_DETECTOR),
        r<AxisImprovementService>(resolve, DI.AXIS_IMPROVEMENT_SERVICE),
        r<ImprovementOpportunityService>(resolve, DI.IMPROVEMENT_OPPORTUNITY_SERVICE),
      ),
    'scoped',
  );

export { container };
