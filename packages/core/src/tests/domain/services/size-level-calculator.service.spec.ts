import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeDistribution } from '../../../domain/entities/size-distribution';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { sizeThresholdsConfigFixture } from '../../fixtures/size-thresholds-config.fixture';

const cfg = sizeThresholdsConfigFixture;

const toSize = (distribution: SizeDistribution | null): SizeProfile => ({
  distribution,
  medianFilesChanged: null,
  medianLinesChanged: null,
});

describe('Size level calculator', () => {
  let calculator: SizeLevelCalculatorService;

  beforeEach(() => {
    calculator = new SizeLevelCalculatorService(cfg);
  });

  it.each([
    {
      label: 'no distribution data',
      distribution: null,
      expected: AiddLevelValue.white,
    },
    {
      label: 'xs meets minXs and no other level qualifies',
      distribution: { xs: cfg.white.minXs, s: 0, m: 0, l: 0, xl: 0 },
      expected: AiddLevelValue.white,
    },
    {
      label: 's is highest but below minS',
      distribution: {
        xs: 0,
        s: cfg.red.minS - 0.01,
        m: cfg.red.minS - 0.02,
        l: cfg.red.minS - 0.02,
        xl: 0,
      },
      expected: AiddLevelValue.white,
    },
    {
      label: 'm is highest but below minM',
      distribution: {
        xs: 0,
        s: cfg.blue.minM - 0.02,
        m: cfg.blue.minM - 0.01,
        l: cfg.blue.minM - 0.02,
        xl: 0,
      },
      expected: AiddLevelValue.white,
    },
    {
      label: 'l is highest but below minL',
      distribution: {
        xs: 0,
        s: cfg.green.minL - 0.02,
        m: cfg.green.minL - 0.02,
        l: cfg.green.minL - 0.01,
        xl: 0,
      },
      expected: AiddLevelValue.white,
    },
    {
      label: 's reaches minS and dominates',
      distribution: {
        xs: 0,
        s: cfg.red.minS,
        m: cfg.red.minS - 0.01,
        l: cfg.red.minS - 0.01,
        xl: cfg.copper.minXl / 2,
      },
      expected: AiddLevelValue.red,
    },
    {
      label: 'm reaches minM and dominates',
      distribution: {
        xs: 0,
        s: cfg.blue.minM - 0.01,
        m: cfg.blue.minM,
        l: cfg.blue.minM - 0.01,
        xl: cfg.copper.minXl / 2,
      },
      expected: AiddLevelValue.blue,
    },
    {
      label: 'l reaches minL and dominates without enough XL for copper',
      distribution: {
        xs: 0,
        s: cfg.green.minL - 0.01,
        m: cfg.green.minL - 0.01,
        l: cfg.green.minL,
        xl: cfg.copper.minXl / 2,
      },
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
