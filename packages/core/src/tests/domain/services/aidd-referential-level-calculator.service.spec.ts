import { AiddReferentialLevelCalculatorService } from '../../../domain/services/aidd-referential-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { IHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { IInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { IParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { ISizeLevelCalculator } from '../../../domain/services/size-level-calculator.service';
import { IVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { HarnessProfile } from '../../../domain/entities/harness-profile';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { VelocityProfile } from '../../../domain/entities/velocity-profile';
import {
  IAxisReadinessChecker,
  AxisReadiness,
} from '../../../domain/ports/axis-readiness-checker.port';
import { DeveloperProfileFixture } from '../../fixtures/developer-profile.fixture';

const stubSizeCalculator = (level: AiddLevelValue): ISizeLevelCalculator => ({
  calculate: (_profile: SizeProfile) => level,
});

const stubHarnessCalculator = (level: AiddLevelValue): IHarnessLevelCalculator => ({
  calculate: (_profile: HarnessProfile) => level,
});

const stubInterventionCalculator = (level: AiddLevelValue): IInterventionLevelCalculator => ({
  calculate: (_profile: InterventionProfile) => level,
});

const stubParallelismCalculator = (level: AiddLevelValue): IParallelismLevelCalculator => ({
  calculate: (_profile: ParallelismProfile) => level,
});

const stubVelocityCalculator = (level: AiddLevelValue): IVelocityLevelCalculator => ({
  calculate: (_profile: VelocityProfile) => level,
});

const stubVelocityReadinessChecker = (
  readiness: AxisReadiness,
): IAxisReadinessChecker<VelocityProfile> => ({
  check: (_profile: VelocityProfile) => readiness,
});

const notCalculable: AxisReadiness = {
  calculable: false,
  missingEssential: ['sprintCount'],
  missingImpacting: [],
};
const calculable: AxisReadiness = { calculable: true, missingEssential: [], missingImpacting: [] };

describe('AIDD level calculator', () => {
  describe('when the developer has no AI data', () => {
    it('assigns White level on all axes', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService(
        stubSizeCalculator(AiddLevelValue.white),
        stubHarnessCalculator(AiddLevelValue.white),
        stubInterventionCalculator(AiddLevelValue.white),
        stubParallelismCalculator(AiddLevelValue.white),
        stubVelocityCalculator(AiddLevelValue.white),
        stubVelocityReadinessChecker(notCalculable),
      );
      const profile = DeveloperProfileFixture.valid();

      // act
      const result = calculator.evaluate(profile);

      // assert
      expect(result.overallLevel).toBe(AiddLevelValue.white);
      expect(result.sizeLevel).toBe(AiddLevelValue.white);
      expect(result.harnessLevel).toBe(AiddLevelValue.white);
      expect(result.interventionLevel).toBe(AiddLevelValue.white);
      expect(result.parallelismLevel).toBe(AiddLevelValue.white);
      expect(result.velocityLevel).toBe(AiddLevelValue.white);
      expect(result.velocityReadiness).toEqual(notCalculable);
    });
  });

  describe('when axes have different levels', () => {
    it('assigns the lowest level as overallLevel', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService(
        stubSizeCalculator(AiddLevelValue.silver),
        stubHarnessCalculator(AiddLevelValue.gold),
        stubInterventionCalculator(AiddLevelValue.gold),
        stubParallelismCalculator(AiddLevelValue.gold),
        stubVelocityCalculator(AiddLevelValue.white),
        stubVelocityReadinessChecker(notCalculable),
      );
      const profile = DeveloperProfileFixture.valid();

      // act
      const result = calculator.evaluate(profile);

      // assert
      expect(result.overallLevel).toBe(AiddLevelValue.silver);
      expect(result.sizeLevel).toBe(AiddLevelValue.silver);
      expect(result.harnessLevel).toBe(AiddLevelValue.gold);
      expect(result.parallelismLevel).toBe(AiddLevelValue.gold);
    });

    it('when velocity is calculable — includes velocity in overall level', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService(
        stubSizeCalculator(AiddLevelValue.gold),
        stubHarnessCalculator(AiddLevelValue.gold),
        stubInterventionCalculator(AiddLevelValue.gold),
        stubParallelismCalculator(AiddLevelValue.gold),
        stubVelocityCalculator(AiddLevelValue.blue),
        stubVelocityReadinessChecker(calculable),
      );
      const profile = DeveloperProfileFixture.valid();

      // act
      const result = calculator.evaluate(profile);

      // assert
      expect(result.overallLevel).toBe(AiddLevelValue.blue);
      expect(result.velocityLevel).toBe(AiddLevelValue.blue);
    });
  });
});
