import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { SizeImprovementOpportunityDetector } from '../../../domain/services/size-improvement-opportunity-detector';
import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { defaultSizeThresholdsConfig } from '../../../domain/services/size-thresholds.config';

const toSize = (
  distribution: { xs: number; s: number; m: number; l: number; xl: number } | null,
): SizeProfile => ({
  distribution,
  medianFilesChanged: null,
  medianLinesChanged: null,
});

describe('SizeImprovementOpportunityDetector', () => {
  const detector = new SizeImprovementOpportunityDetector(
    new SizeLevelCalculatorService(defaultSizeThresholdsConfig),
    defaultSizeThresholdsConfig,
  );

  describe('when distribution is null', () => {
    it('returns no opportunities', () => {
      // arrange
      const size = toSize(null);

      // act
      const opportunities = detector.detect(size);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when already at gold level', () => {
    it('returns no opportunities', () => {
      // arrange — xl=0.4 and l+xl=0.6 both meet gold thresholds
      const size = toSize({ xs: 0.1, s: 0.1, m: 0.2, l: 0.2, xl: 0.4 });

      // act
      const opportunities = detector.detect(size);

      // assert
      expect(opportunities).toHaveLength(0);
    });
  });

  describe('when xl ratio is below the gold threshold — silver profile (Arthur-like)', () => {
    // Arthur: xl=0.311, l+xl=0.733 — silver (xl meets silver ≥0.2, l+xl ≥0.6; but xl < gold ≥0.4)
    const size = toSize({ xs: 0.019, s: 0.058, m: 0.188, l: 0.422, xl: 0.311 });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(size);
    });

    it('returns one opportunity', () => {
      expect(opportunities).toHaveLength(1);
    });

    it('when xl is below gold threshold — identifies xlRatio as the opportunity reaching gold', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities[0]).toMatchObject({
        axis: 'size',
        field: 'xlRatio',
        currentLevel: AiddLevelValue.silver,
        resultingLevel: AiddLevelValue.gold,
        levelGain: 1,
      });
    });
  });

  describe('when both xl and l+xl are below gold thresholds', () => {
    // xl=0.05 (< gold 0.4), l+xl=0.25 (< gold 0.6) — white level (m dominates at 0.4 < 0.5 for blue)
    const size = toSize({ xs: 0.1, s: 0.1, m: 0.4, l: 0.2, xl: 0.05 });
    let opportunities: ReturnType<typeof detector.detect>;

    beforeEach(() => {
      opportunities = detector.detect(size);
    });

    it('does not surface xlRatio — boosting xl leaves l+xl too low for any gain', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities.find((o) => o.field === 'xlRatio')).toBeUndefined();
    });

    it('when l+xl is below gold threshold — surfaces lxlRatio reaching green', () => {
      // arrange / act — done in beforeEach

      // assert
      expect(opportunities.find((o) => o.field === 'lxlRatio')).toMatchObject({
        axis: 'size',
        field: 'lxlRatio',
        currentLevel: AiddLevelValue.white,
        resultingLevel: AiddLevelValue.green,
        levelGain: 3,
      });
    });
  });
});
