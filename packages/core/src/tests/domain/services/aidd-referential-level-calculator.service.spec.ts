import { AiddReferentialLevelCalculatorService } from '../../../domain/services/aidd-referential-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeveloperProfileFixture } from '../../fixtures/developer-profile.fixture';

describe('AIDD level calculator', () => {
  describe('when the developer has no AI data', () => {
    it('assigns White level on all axes', () => {
      // arrange
      const calculator = new AiddReferentialLevelCalculatorService();
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
      });
    });
  });
});
