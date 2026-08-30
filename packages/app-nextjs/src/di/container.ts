import { createContainer, ResolveFunction } from '@evyweb/ioctopus';
import {
  LaivelUpDeveloperProfileRepository,
  ZodProfileParser,
  ImprovementCollector,
  AiddReferentialLevelCalculatorService,
  EvaluateDeveloperProfileUseCase,
  AxisImprovementService,
  ImprovementOpportunityService,
  SizeImprovementOpportunityDetector,
  InterventionImprovementOpportunityDetector,
  ParallelismImprovementOpportunityDetector,
  createWeightedParallelismLevelCalculator,
  defaultParallelismThresholdsConfig,
  createInterventionLevelCalculator,
  defaultInterventionThresholdsConfig,
  SizeLevelCalculatorService,
  defaultSizeThresholdsConfig,
  createHarnessLevelCalculator,
  defaultHarnessThresholdsConfig,
  createVelocityLevelCalculator,
  defaultVelocityThresholdsConfig,
  VelocityReadinessChecker,
  createSizeSignalDetector,
  createHarnessSignalDetector,
  createInterventionSignalDetector,
  createParallelismSignalDetector,
  createVelocitySignalDetector,
  IHarnessLevelCalculator,
  IInterventionLevelCalculator,
  IParallelismLevelCalculator,
  ISizeLevelCalculator,
  IVelocityLevelCalculator,
  IAxisSignalDetector,
  IDeveloperProfileRepository,
  IDeveloperProfileEvaluator,
  SizeProfile,
  HarnessProfile,
  InterventionProfile,
  ParallelismProfile,
  VelocityProfile,
  VelocityImprovementOpportunityDetector,
  IAxisReadinessChecker,
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
  .bind(DI.VELOCITY_LEVEL_CALCULATOR)
  .toFactory(() => createVelocityLevelCalculator(defaultVelocityThresholdsConfig));

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

container
  .bind(DI.VELOCITY_SIGNAL_DETECTOR)
  .toFactory(() => createVelocitySignalDetector(defaultVelocityThresholdsConfig));

container.bind(DI.AXIS_IMPROVEMENT_SERVICE).toClass(AxisImprovementService, []);
container.bind(DI.IMPROVEMENT_OPPORTUNITY_SERVICE).toFactory((resolve: ResolveFunction) => {
  const sizeCalculator = r<ISizeLevelCalculator>(resolve, DI.SIZE_LEVEL_CALCULATOR);
  return new ImprovementOpportunityService(
    r<IHarnessLevelCalculator>(resolve, DI.HARNESS_LEVEL_CALCULATOR),
    sizeCalculator,
    r<IInterventionLevelCalculator>(resolve, DI.INTERVENTION_LEVEL_CALCULATOR),
    r<IParallelismLevelCalculator>(resolve, DI.PARALLELISM_LEVEL_CALCULATOR),
    new SizeImprovementOpportunityDetector(sizeCalculator, defaultSizeThresholdsConfig),
    new InterventionImprovementOpportunityDetector(
      r<IInterventionLevelCalculator>(resolve, DI.INTERVENTION_LEVEL_CALCULATOR),
      defaultInterventionThresholdsConfig,
    ),
    new ParallelismImprovementOpportunityDetector(
      r<IParallelismLevelCalculator>(resolve, DI.PARALLELISM_LEVEL_CALCULATOR),
      defaultParallelismThresholdsConfig,
    ),
    new VelocityImprovementOpportunityDetector(
      r<IVelocityLevelCalculator>(resolve, DI.VELOCITY_LEVEL_CALCULATOR),
      defaultVelocityThresholdsConfig,
    ),
    r<IVelocityLevelCalculator>(resolve, DI.VELOCITY_LEVEL_CALCULATOR),
    new VelocityReadinessChecker(),
  );
});

container
  .bind(DI.DEVELOPER_PROFILE_EVALUATOR)
  .toFactory(
    (resolve: ResolveFunction) =>
      new AiddReferentialLevelCalculatorService(
        r<ISizeLevelCalculator>(resolve, DI.SIZE_LEVEL_CALCULATOR),
        r<IHarnessLevelCalculator>(resolve, DI.HARNESS_LEVEL_CALCULATOR),
        r<IInterventionLevelCalculator>(resolve, DI.INTERVENTION_LEVEL_CALCULATOR),
        r<IParallelismLevelCalculator>(resolve, DI.PARALLELISM_LEVEL_CALCULATOR),
        r<IVelocityLevelCalculator>(resolve, DI.VELOCITY_LEVEL_CALCULATOR),
        new VelocityReadinessChecker(),
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
        r<IAxisSignalDetector<VelocityProfile>>(resolve, DI.VELOCITY_SIGNAL_DETECTOR),
        new VelocityReadinessChecker() as IAxisReadinessChecker<VelocityProfile>,
        r<AxisImprovementService>(resolve, DI.AXIS_IMPROVEMENT_SERVICE),
        r<ImprovementOpportunityService>(resolve, DI.IMPROVEMENT_OPPORTUNITY_SERVICE),
      ),
    'scoped',
  );

export { container };
