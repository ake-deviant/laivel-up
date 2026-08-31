import { IDeveloperProfileEvaluator } from '../ports/developer-profile-evaluator.port';
import { IHarnessLevelCalculator } from './harness-level-calculator.service';
import { IInterventionLevelCalculator } from './intervention-level-calculator.service';
import { IParallelismLevelCalculator } from './parallelism-level-calculator.service';
import { ISizeLevelCalculator } from './size-level-calculator.service';
import { IVelocityLevelCalculator } from './velocity-level-calculator.service';
import { DeveloperProfile } from '../entities/developer-profile';
import { DeveloperProfileResult } from '../entities/developer-profile-result';
import { AiddLevelValue, lowestLevel } from '../entities/aidd-level-value';
import { IAxisReadinessChecker } from '../ports/axis-readiness-checker.port';
import { VelocityProfile } from '../entities/velocity-profile';
import { AiddEvaluatorConfig } from '../entities/aidd-evaluator-config';
import { DeliveryConfidenceProfile } from '../entities/delivery-confidence-profile';
import {
  IDeliveryConfidenceLevelCalculator,
  createDeliveryConfidenceLevelCalculator,
} from './delivery-confidence-level-calculator.service';
import { defaultDeliveryConfidenceConfig } from './delivery-confidence.config';
import { DeliveryConfidenceReadinessChecker } from './delivery-confidence-readiness-checker';

const DEFAULT_CONFIG: AiddEvaluatorConfig = { nonBlockingAxes: ['deliveryConfidence'] };

export class AiddReferentialLevelCalculatorService implements IDeveloperProfileEvaluator {
  constructor(
    private readonly sizeCalculator: ISizeLevelCalculator,
    private readonly harnessCalculator: IHarnessLevelCalculator,
    private readonly interventionCalculator: IInterventionLevelCalculator,
    private readonly parallelismCalculator: IParallelismLevelCalculator,
    private readonly velocityCalculator: IVelocityLevelCalculator,
    private readonly velocityReadinessChecker: IAxisReadinessChecker<VelocityProfile>,
    private readonly config: AiddEvaluatorConfig = DEFAULT_CONFIG,
    private readonly deliveryConfidenceCalculator: IDeliveryConfidenceLevelCalculator = createDeliveryConfidenceLevelCalculator(
      defaultDeliveryConfidenceConfig,
    ),
    private readonly deliveryConfidenceReadinessChecker: IAxisReadinessChecker<DeliveryConfidenceProfile> = new DeliveryConfidenceReadinessChecker(),
  ) {}

  evaluate(profile: DeveloperProfile): DeveloperProfileResult {
    const sizeLevel = this.sizeCalculator.calculate(profile.size);
    const harnessLevel = this.harnessCalculator.calculate(profile.harness);
    const interventionLevel = this.interventionCalculator.calculate(profile.intervention);
    const parallelismLevel = this.parallelismCalculator.calculate(profile.parallelism);
    const velocityReadiness = this.velocityReadinessChecker.check(profile.velocity);
    const velocityLevel = velocityReadiness.calculable
      ? this.velocityCalculator.calculate(profile.velocity)
      : AiddLevelValue.white;
    const deliveryConfidenceReadiness = this.deliveryConfidenceReadinessChecker.check(
      profile.deliveryConfidence,
    );
    const deliveryConfidenceLevel = deliveryConfidenceReadiness.calculable
      ? this.deliveryConfidenceCalculator.calculate(profile.deliveryConfidence).level
      : AiddLevelValue.white;

    const nonBlocking = new Set(this.config.nonBlockingAxes);

    const axisLevels: AiddLevelValue[] = [];
    if (!nonBlocking.has('size')) axisLevels.push(sizeLevel);
    if (!nonBlocking.has('harness')) axisLevels.push(harnessLevel);
    if (!nonBlocking.has('intervention')) axisLevels.push(interventionLevel);
    if (!nonBlocking.has('parallelism')) axisLevels.push(parallelismLevel);
    if (velocityReadiness.calculable && !nonBlocking.has('velocity'))
      axisLevels.push(velocityLevel);
    if (deliveryConfidenceReadiness.calculable && !nonBlocking.has('deliveryConfidence'))
      axisLevels.push(deliveryConfidenceLevel);

    return {
      overallLevel: lowestLevel(...axisLevels),
      sizeLevel,
      harnessLevel,
      interventionLevel,
      parallelismLevel,
      velocityLevel,
      deliveryConfidenceLevel,
      velocityReadiness,
      deliveryConfidenceReadiness,
      axisProfiles: {
        size: profile.size,
        harness: profile.harness,
        intervention: profile.intervention,
        parallelism: profile.parallelism,
        velocity: profile.velocity,
        deliveryConfidence: profile.deliveryConfidence,
      },
      signalMatrices: [],
      improvements: [],
      busImprovements: [],
      formatWarnings: [],
      impactingNulls: [],
      ignoredNulls: [],
    };
  }
}
