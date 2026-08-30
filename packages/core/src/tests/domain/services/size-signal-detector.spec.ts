import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { SizeProfile } from '../../../domain/entities/size-profile';
import { createSizeSignalDetector } from '../../../domain/services/size-signal-detector';
import { sizeThresholdsConfigFixture as cfg } from '../../fixtures/size-thresholds-config.fixture';

const toProfile = (xs = 0, s = 0, m = 0, l = 0, xl = 0): SizeProfile => ({
  distribution: { xs, s, m, l, xl },
  medianFilesChanged: null,
  medianLinesChanged: null,
});

const noDistribution: SizeProfile = {
  distribution: null,
  medianFilesChanged: null,
  medianLinesChanged: null,
};

describe('Size signal detector', () => {
  describe('when no distribution data', () => {
    it('when distribution is null — returns white with next level red and no signals', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(noDistribution);

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.white);
      expect(matrix.nextLevel).toBe(AiddLevelValue.red);
      expect(matrix.signals).toHaveLength(0);
    });
  });

  describe('when level is white', () => {
    it('when s ratio below threshold — returns white with next red and s signal unvalidated', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(1, 0.3, 0, 0, 0));

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.white);
      expect(matrix.nextLevel).toBe(AiddLevelValue.red);
      expect(matrix.signals).toEqual([{ name: 's', validated: false, value: 0.3 }]);
    });
  });

  describe('when level is blue', () => {
    it('when m is dominant and meets threshold — returns blue with next green and l signal', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(0, 0, 0.6, 0, 0));

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.blue);
      expect(matrix.nextLevel).toBe(AiddLevelValue.green);
      expect(matrix.signals).toEqual([{ name: 'l', validated: false, value: 0 }]);
    });
  });

  describe('when level is green', () => {
    it('when l is dominant — returns green with next copper and xl + lXl signals', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(0, 0, 0, 0.6, 0));

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.green);
      expect(matrix.nextLevel).toBe(AiddLevelValue.copper);
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({ name: 'xl', validated: false, value: 0 });
      expect(matrix.signals[1]).toEqual({ name: 'lXl', validated: true, value: 0.6 });
    });
  });

  describe('when level is copper', () => {
    it('when copper met but silver not — returns copper with next silver and signals', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(0, 0, 0, 0.3, 0.25)); // xl=0.25≥0.2, lXl=0.55≥0.5 → copper, lXl<0.6 → not silver

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.copper);
      expect(matrix.nextLevel).toBe(AiddLevelValue.silver);
      expect(matrix.signals[0]).toEqual({ name: 'xl', validated: true, value: 0.25 });
      expect(matrix.signals[1]).toEqual({ name: 'lXl', validated: false, value: 0.55 });
    });
  });

  describe('when level is silver', () => {
    it('when silver met but xl below gold threshold — returns silver with next gold and unvalidated xl', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(0, 0, 0, 0.4, 0.25)); // xl=0.25 < gold.minXl=0.4 → silver

      // assert
      // xl=0.25 ≥ silver.minXl=0.2 ✓, lXl=0.65 ≥ silver.minLXl=0.6 ✓ → silver
      expect(matrix.currentLevel).toBe(AiddLevelValue.silver);
      expect(matrix.nextLevel).toBe(AiddLevelValue.gold);
      expect(matrix.signals[0]).toEqual({ name: 'xl', validated: false, value: 0.25 }); // 0.25 < gold.minXl 0.4
      expect(matrix.signals[1]).toEqual({ name: 'lXl', validated: true, value: 0.65 });
    });
  });

  describe('when level is gold', () => {
    it('when gold is reached — returns gold with null next level and validated xl and lXl signals', () => {
      // arrange
      const detector = createSizeSignalDetector(cfg);

      // act
      const matrix = detector.detect(toProfile(0, 0, 0, 0.3, 0.45)); // xl=0.45≥0.4, lXl=0.75≥0.6 → gold

      // assert
      expect(matrix.currentLevel).toBe(AiddLevelValue.gold);
      expect(matrix.nextLevel).toBeNull();
      expect(matrix.signals).toHaveLength(2);
      expect(matrix.signals[0]).toEqual({ name: 'xl', validated: true, value: 0.45 });
      expect(matrix.signals[1]).toEqual({ name: 'lXl', validated: true, value: 0.75 });
    });
  });
});
