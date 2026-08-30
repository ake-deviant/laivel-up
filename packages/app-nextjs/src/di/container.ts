import { createContainer, ResolveFunction } from '@evyweb/ioctopus';
import {
  LaivelUpDeveloperProfileRepository,
  ZodProfileParser,
  ImprovementCollector,
  AiddReferentialLevelCalculatorService,
  EvaluateDeveloperProfileUseCase,
  ListDeveloperProfilesUseCase,
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
  SizeProfile,
  HarnessProfile,
  InterventionProfile,
  ParallelismProfile,
  VelocityProfile,
  VelocityImprovementOpportunityDetector,
  IAxisReadinessChecker,
} from '@laivel-up/core';
import { DI } from './di';
import type { EvaluationConfig } from '../types/evaluation-config';

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

const g = <T>(token: symbol): T => container.get<T>(token);

export function buildEvaluateUseCase(config: EvaluationConfig): EvaluateDeveloperProfileUseCase {
  const harnessConfig = {
    ...defaultHarnessThresholdsConfig,
    contextEngineeringWeights: config.harnessContextWeights,
    aiConfigurationWeights: config.harnessAiWeights,
  };
  const parallelismConfig = {
    ...defaultParallelismThresholdsConfig,
    weights: config.parallelismWeights,
  };

  return new EvaluateDeveloperProfileUseCase(
    g<IDeveloperProfileRepository>(DI.DEVELOPER_PROFILE_REPOSITORY),
    new AiddReferentialLevelCalculatorService(
      g<ISizeLevelCalculator>(DI.SIZE_LEVEL_CALCULATOR),
      createHarnessLevelCalculator(harnessConfig),
      g<IInterventionLevelCalculator>(DI.INTERVENTION_LEVEL_CALCULATOR),
      createWeightedParallelismLevelCalculator(parallelismConfig),
      g<IVelocityLevelCalculator>(DI.VELOCITY_LEVEL_CALCULATOR),
      new VelocityReadinessChecker(),
      { nonBlockingAxes: config.nonBlockingAxes },
    ),
    g<ImprovementCollector>(DI.IMPROVEMENT_COLLECTOR),
    g<IAxisSignalDetector<SizeProfile>>(DI.SIZE_SIGNAL_DETECTOR),
    g<IAxisSignalDetector<HarnessProfile>>(DI.HARNESS_SIGNAL_DETECTOR),
    g<IAxisSignalDetector<InterventionProfile>>(DI.INTERVENTION_SIGNAL_DETECTOR),
    g<IAxisSignalDetector<ParallelismProfile>>(DI.PARALLELISM_SIGNAL_DETECTOR),
    g<IAxisSignalDetector<VelocityProfile>>(DI.VELOCITY_SIGNAL_DETECTOR),
    new VelocityReadinessChecker() as IAxisReadinessChecker<VelocityProfile>,
    g<AxisImprovementService>(DI.AXIS_IMPROVEMENT_SERVICE),
    g<ImprovementOpportunityService>(DI.IMPROVEMENT_OPPORTUNITY_SERVICE),
  );
}

container
  .bind(DI.LIST_DEVELOPER_PROFILES_USE_CASE)
  .toFactory(
    (resolve: ResolveFunction) =>
      new ListDeveloperProfilesUseCase(
        r<IDeveloperProfileRepository>(resolve, DI.DEVELOPER_PROFILE_REPOSITORY),
      ),
    'scoped',
  );

export { container };
