import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeveloperProfileMapper } from '../../../infrastructure/mappers/developer-profile-mapper';
import { AiddReferentialLevelCalculatorService } from '../../../domain/services/aidd-referential-level-calculator.service';
import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { createHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { createInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { createWeightedParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { createVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { VelocityReadinessChecker } from '../../../domain/services/velocity-readiness-checker';
import { defaultSizeThresholdsConfig } from '../../../domain/services/size-thresholds.config';
import { defaultHarnessThresholdsConfig } from '../../../domain/services/harness-thresholds.config';
import { defaultInterventionThresholdsConfig } from '../../../domain/services/intervention-thresholds.config';
import { defaultParallelismThresholdsConfig } from '../../../domain/services/parallelism-thresholds.config';
import { defaultVelocityThresholdsConfig } from '../../../domain/services/velocity-thresholds.config';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';

describe('Lancelot profile evaluation — gold everywhere, velocity red and calculable', () => {
  const input = LaivelUpDeveloperProfileInputFixture.lancelot();
  const profile = DeveloperProfileMapper.toDomain(input);

  const evaluator = new AiddReferentialLevelCalculatorService(
    new SizeLevelCalculatorService(defaultSizeThresholdsConfig),
    createHarnessLevelCalculator(defaultHarnessThresholdsConfig),
    createInterventionLevelCalculator(defaultInterventionThresholdsConfig),
    createWeightedParallelismLevelCalculator(defaultParallelismThresholdsConfig),
    createVelocityLevelCalculator(defaultVelocityThresholdsConfig),
    new VelocityReadinessChecker(),
  );

  const result = evaluator.evaluate(profile);

  it('velocity is calculable', () => {
    expect(result.velocityReadiness.calculable).toBe(true);
  });

  it('velocity level is red', () => {
    expect(result.velocityLevel).toBe(AiddLevelValue.red);
  });

  it('size level is gold', () => {
    expect(result.sizeLevel).toBe(AiddLevelValue.gold);
  });

  it('harness level is gold', () => {
    expect(result.harnessLevel).toBe(AiddLevelValue.gold);
  });

  it('intervention level is gold', () => {
    expect(result.interventionLevel).toBe(AiddLevelValue.gold);
  });

  it('parallelism level is gold', () => {
    expect(result.parallelismLevel).toBe(AiddLevelValue.gold);
  });

  it('overall level is red because calculable velocity drags it down', () => {
    expect(result.overallLevel).toBe(AiddLevelValue.red);
  });
});
