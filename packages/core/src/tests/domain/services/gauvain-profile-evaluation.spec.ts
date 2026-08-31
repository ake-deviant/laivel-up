import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeveloperProfileMapper } from '../../../infrastructure/mappers/developer-profile-mapper';
import { AiddReferentialLevelCalculatorService } from '../../../domain/services/aidd-referential-level-calculator.service';
import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { createHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { createInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { createWeightedParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { createVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { VelocityReadinessChecker } from '../../../domain/services/velocity-readiness-checker';
import { createSizeSignalDetector } from '../../../domain/services/size-signal-detector';
import { createHarnessSignalDetector } from '../../../domain/services/harness-signal-detector';
import { createInterventionSignalDetector } from '../../../domain/services/intervention-signal-detector';
import { createParallelismSignalDetector } from '../../../domain/services/parallelism-signal-detector';
import { AxisImprovementService } from '../../../domain/services/axis-improvement.service';
import { defaultSizeThresholdsConfig } from '../../../domain/services/size-thresholds.config';
import { defaultHarnessThresholdsConfig } from '../../../domain/services/harness-thresholds.config';
import { defaultInterventionThresholdsConfig } from '../../../domain/services/intervention-thresholds.config';
import { defaultParallelismThresholdsConfig } from '../../../domain/services/parallelism-thresholds.config';
import { defaultVelocityThresholdsConfig } from '../../../domain/services/velocity-thresholds.config';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';

describe('Gauvain profile evaluation', () => {
  const input = LaivelUpDeveloperProfileInputFixture.gauvain();
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

  const matrices = [
    createSizeSignalDetector(defaultSizeThresholdsConfig).detect(profile.size),
    createHarnessSignalDetector(defaultHarnessThresholdsConfig).detect(profile.harness),
    createInterventionSignalDetector(defaultInterventionThresholdsConfig).detect(
      profile.intervention,
    ),
    createParallelismSignalDetector(defaultParallelismThresholdsConfig).detect(profile.parallelism),
  ];

  const improvements = new AxisImprovementService().derive(matrices);

  it('overall level is silver', () => {
    expect(result.overallLevel).toBe(AiddLevelValue.silver);
  });

  it('parallelism level is silver', () => {
    expect(result.parallelismLevel).toBe(AiddLevelValue.silver);
  });

  it('intervention level is gold', () => {
    expect(result.interventionLevel).toBe(AiddLevelValue.gold);
  });

  it('harness level is gold', () => {
    expect(result.harnessLevel).toBe(AiddLevelValue.gold);
  });

  it('has parallelism improvements for the gold score and worktree gate', () => {
    const parallelismImprovements = improvements.filter((i) => i.axis === 'parallelism');
    expect(parallelismImprovements).toHaveLength(3);
    expect(parallelismImprovements.map((improvement) => improvement.type)).toEqual([
      'medianConcurrentBranches',
      'maxConcurrentBranches',
      'hasWorktreeInclude',
    ]);
    expect(
      parallelismImprovements.every(
        (improvement) => improvement.targetLevel === AiddLevelValue.gold,
      ),
    ).toBe(true);
  });

  it('parallelism signal for hasWorktreeInclude is not validated', () => {
    const parallelismMatrix = matrices.find((m) => m.axis === 'parallelism')!;
    const worktreeSignal = parallelismMatrix.signals.find((s) => s.name === 'hasWorktreeInclude');
    expect(worktreeSignal).toBeDefined();
    expect(worktreeSignal!.validated).toBe(false);
    expect(worktreeSignal!.value).toBe(false);
  });
});
