import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { sizeThresholdsConfigFixture } from '../../fixtures/size-thresholds-config.fixture';

const noData: SizeProfile = {
  distribution: null,
  medianFilesChanged: null,
  medianLinesChanged: null,
};

describe('Size level calculator', () => {
  let calculator: SizeLevelCalculatorService;

  beforeEach(() => {
    calculator = new SizeLevelCalculatorService(sizeThresholdsConfigFixture);
  });

  describe('when size distribution is null', () => {
    it('assigns white level', () => {
      // arrange
      const size = noData;

      // act
      const result = calculator.calculate(size);

      // assert
      expect(result).toBe(AiddLevelValue.white);
    });
  });
});
