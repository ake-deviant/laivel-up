import { createContainer, ResolveFunction } from '@evyweb/ioctopus';
import {
  LaivelUpDeveloperProfileRepository,
  ZodProfileParser,
  ImprovementCollector,
  AiddReferentialLevelCalculatorService,
  EvaluateDeveloperProfileUseCase,
  createWeightedParallelismLevelCalculator,
  defaultParallelismThresholdsConfig,
  createInterventionLevelCalculator,
  defaultInterventionThresholdsConfig,
  SizeLevelCalculatorService,
  defaultSizeThresholdsConfig,
  ILevelImprovementBus,
  IInterventionLevelCalculator,
  IParallelismLevelCalculator,
  ISizeLevelCalculator,
  IDeveloperProfileRepository,
  IDeveloperProfileEvaluator,
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
  .toFactory(
    (resolve: ResolveFunction) =>
      createInterventionLevelCalculator(
        defaultInterventionThresholdsConfig,
        r<ILevelImprovementBus>(resolve, DI.IMPROVEMENT_COLLECTOR),
      ),
    'scoped',
  );

container
  .bind(DI.PARALLELISM_LEVEL_CALCULATOR)
  .toFactory(
    (resolve: ResolveFunction) =>
      createWeightedParallelismLevelCalculator(
        defaultParallelismThresholdsConfig,
        r<ILevelImprovementBus>(resolve, DI.IMPROVEMENT_COLLECTOR),
      ),
    'scoped',
  );

container
  .bind(DI.DEVELOPER_PROFILE_EVALUATOR)
  .toFactory(
    (resolve: ResolveFunction) =>
      new AiddReferentialLevelCalculatorService(
        r<ISizeLevelCalculator>(resolve, DI.SIZE_LEVEL_CALCULATOR),
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
      ),
    'scoped',
  );

export { container };
