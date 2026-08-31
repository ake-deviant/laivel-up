import { AiddLevelValue } from '../entities/aidd-level-value';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';
import { DeliveryConfidenceProfile } from '../entities/delivery-confidence-profile';
import { IAxisSignalDetector } from '../ports/axis-signal-detector.port';
import { IDeliveryConfidenceLevelCalculator } from './delivery-confidence-level-calculator.service';
import { DeliveryConfidenceConfig } from './delivery-confidence.config';

export class DeliveryConfidenceSignalDetector implements IAxisSignalDetector<DeliveryConfidenceProfile> {
  constructor(
    private readonly calculator: IDeliveryConfidenceLevelCalculator,
    private readonly config: DeliveryConfidenceConfig,
  ) {}

  detect(profile: DeliveryConfidenceProfile): AxisSignalMatrix {
    const calculation = this.calculator.calculate(profile);
    const levels = [
      AiddLevelValue.white,
      AiddLevelValue.red,
      AiddLevelValue.blue,
      AiddLevelValue.green,
      AiddLevelValue.copper,
      AiddLevelValue.silver,
      AiddLevelValue.gold,
    ];
    const target = levels[levels.indexOf(calculation.level) + 1] ?? null;
    const targetScore =
      target === null || target === AiddLevelValue.white
        ? null
        : this.config.levels[target as keyof DeliveryConfidenceConfig['levels']];
    const entries = [
      ['businessImpactScore', calculation.scores.businessImpactScore],
      ['deliveryReliabilityScore', calculation.scores.deliveryReliabilityScore],
      ['qualityAndRiskScore', calculation.scores.qualityAndRiskScore],
      ['autonomyScore', calculation.scores.autonomyScore],
      ['collectiveImpactScore', calculation.scores.collectiveImpactScore],
      ['aiEffectivenessScore', calculation.scores.aiEffectivenessScore],
      ['dataConfidenceScore', calculation.scores.dataConfidenceScore],
      ['deliveryConfidenceScore', calculation.scores.deliveryConfidenceScore],
    ] as const;
    return {
      axis: 'deliveryConfidence',
      currentLevel: calculation.level,
      nextLevel: target,
      signals: entries.map(([name, value]) => ({
        name,
        value,
        validated: value !== null && targetScore !== null && value >= targetScore,
      })),
    };
  }
}

export const createDeliveryConfidenceSignalDetector = (
  calculator: IDeliveryConfidenceLevelCalculator,
  config: DeliveryConfidenceConfig,
) => new DeliveryConfidenceSignalDetector(calculator, config);
