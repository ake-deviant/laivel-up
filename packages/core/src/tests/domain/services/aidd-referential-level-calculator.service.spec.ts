import { AiddReferentialLevelCalculatorService } from '../../../domain/services/aidd-referential-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { IInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { IParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { ISizeLevelCalculator } from '../../../domain/services/size-level-calculator.service';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { DeveloperProfileFixture } from '../../fixtures/developer-profile.fixture';

const stubSizeCalculator = (level: AiddLevelValue): ISizeLevelCalculator => ({
  calculate: (_profile: SizeProfile) => level,
});

const stubInterventionCalculator = (level: AiddLevelValue): IInterventionLevelCalculator => ({
  calculate: (_profile: InterventionProfile) => level,
});

const stubParallelismCalculator = (level: AiddLevelValue): IParallelismLevelCalculator => ({
  calculate: (_profile: ParallelismProfile) => level,
});

describe('AIDD level calculator', () => {
  describe('when the developer has no AI data', () => {
    it('assigns White level on all axes', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService(
        stubSizeCalculator(AiddLevelValue.white),
        stubInterventionCalculator(AiddLevelValue.white),
        stubParallelismCalculator(AiddLevelValue.white),
      );
      const profile = DeveloperProfileFixture.valid();

      // act
      const result = calculator.evaluate(profile);

      // assert
      expect(result).toEqual({
        overallLevel: AiddLevelValue.white,
        sizeLevel: AiddLevelValue.white,
        harnessLevel: AiddLevelValue.white,
        interventionLevel: AiddLevelValue.white,
        parallelismLevel: AiddLevelValue.white,
        improvements: [],
      });
    });
  });

  describe('when axes have different levels', () => {
    it('assigns the lowest level as overallLevel', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService(
        stubSizeCalculator(AiddLevelValue.silver),
        stubInterventionCalculator(AiddLevelValue.gold),
        stubParallelismCalculator(AiddLevelValue.gold),
      );
      const profile = DeveloperProfileFixture.valid();

      // act
      const result = calculator.evaluate(profile);

      // assert
      expect(result.overallLevel).toBe(AiddLevelValue.silver);
      expect(result.sizeLevel).toBe(AiddLevelValue.silver);
      expect(result.parallelismLevel).toBe(AiddLevelValue.gold);
    });
  });
});
