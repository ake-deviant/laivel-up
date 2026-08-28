import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeDistribution } from '../../../domain/entities/size-distribution';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { sizeThresholdsConfigFixture } from '../../fixtures/size-thresholds-config.fixture';

const toSize = (distribution: SizeDistribution | null): SizeProfile => ({
  distribution,
  medianFilesChanged: null,
  medianLinesChanged: null,
});

describe('Size level calculator', () => {
  let calculator: SizeLevelCalculatorService;

  beforeEach(() => {
    calculator = new SizeLevelCalculatorService(sizeThresholdsConfigFixture);
  });

  const cfg = sizeThresholdsConfigFixture;

  it.each([
    {
      label: 'no distribution data',
      distribution: null,
      expected: AiddLevelValue.white,
    },
    {
      label: 'small PRs dominate',
      distribution: { xs: 0.05, s: 0.7, m: 0.15, l: 0.05, xl: cfg.copper.minXl / 2 },
      expected: AiddLevelValue.red,
    },
    {
      label: 'medium PRs dominate',
      distribution: { xs: 0.05, s: 0.15, m: 0.6, l: 0.1, xl: cfg.copper.minXl / 2 },
      expected: AiddLevelValue.blue,
    },
    {
      label: 'large PRs dominate without enough XL for copper',
      distribution: { xs: 0.05, s: 0.1, m: 0.2, l: 0.55, xl: cfg.copper.minXl / 2 },
      expected: AiddLevelValue.green,
    },
    {
      label: 'XL ratio reaches copper minimum with enough L+XL cumul',
      distribution: {
        xs: 0.05,
        s: 0.1,
        m: 0.35,
        l: cfg.copper.minLXl - cfg.copper.minXl,
        xl: cfg.copper.minXl,
      },
      expected: AiddLevelValue.copper,
    },
    {
      label: 'XL ratio reaches silver minimum with enough L+XL cumul',
      distribution: {
        xs: 0.05,
        s: 0.05,
        m: 0.3,
        l: cfg.silver.minLXl - cfg.silver.minXl,
        xl: cfg.silver.minXl,
      },
      expected: AiddLevelValue.silver,
    },
    {
      label: 'XL ratio reaches gold minimum with enough L+XL cumul',
      distribution: {
        xs: 0.1,
        s: 0.1,
        m: 0.2,
        l: cfg.gold.minLXl - cfg.gold.minXl,
        xl: cfg.gold.minXl,
      },
      expected: AiddLevelValue.gold,
    },
  ])('when $label — assigns $expected level', ({ distribution, expected }) => {
    // arrange
    const size = toSize(distribution);

    // act
    const result = calculator.calculate(size);

    // assert
    expect(result).toBe(expected);
  });
});
