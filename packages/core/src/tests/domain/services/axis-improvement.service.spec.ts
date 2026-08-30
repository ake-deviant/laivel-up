import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { AxisSignalMatrix } from '../../../domain/entities/axis-signal-matrix';
import { AxisImprovementService } from '../../../domain/services/axis-improvement.service';

const makeMatrix = (overrides: Partial<AxisSignalMatrix>): AxisSignalMatrix => ({
  axis: 'parallelism',
  currentLevel: AiddLevelValue.silver,
  nextLevel: AiddLevelValue.gold,
  signals: [],
  ...overrides,
});

describe('AxisImprovementService', () => {
  it('when all signals are validated — returns no improvements', () => {
    // arrange
    const service = new AxisImprovementService();
    const matrix = makeMatrix({
      signals: [
        { name: 'medianConcurrentBranches', validated: true, value: 5 },
        { name: 'hasWorktreeInclude', validated: true, value: true },
      ],
    });

    // act
    const result = service.derive([matrix]);

    // assert
    expect(result).toHaveLength(0);
  });

  it('when a signal is not validated — returns one improvement per unvalidated signal', () => {
    // arrange
    const service = new AxisImprovementService();
    const matrix = makeMatrix({
      signals: [
        { name: 'medianConcurrentBranches', validated: true, value: 5 },
        { name: 'hasWorktreeInclude', validated: false, value: null },
      ],
    });

    // act
    const result = service.derive([matrix]);

    // assert
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      axis: 'parallelism',
      type: 'hasWorktreeInclude',
      targetLevel: AiddLevelValue.gold,
    });
  });

  it('when next level is null — returns no improvements', () => {
    // arrange
    const service = new AxisImprovementService();
    const matrix = makeMatrix({
      nextLevel: null,
      signals: [{ name: 'score', validated: false, value: 10 }],
    });

    // act
    const result = service.derive([matrix]);

    // assert
    expect(result).toHaveLength(0);
  });

  it('when multiple axes have unvalidated signals — returns improvements for all axes', () => {
    // arrange
    const service = new AxisImprovementService();
    const matrices: AxisSignalMatrix[] = [
      makeMatrix({
        axis: 'parallelism',
        nextLevel: AiddLevelValue.gold,
        signals: [{ name: 'hasWorktreeInclude', validated: false, value: false }],
      }),
      makeMatrix({
        axis: 'intervention',
        currentLevel: AiddLevelValue.copper,
        nextLevel: AiddLevelValue.silver,
        signals: [{ name: 'humanCommitRatio', validated: false, value: 0.5 }],
      }),
    ];

    // act
    const result = service.derive(matrices);

    // assert
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      axis: 'parallelism',
      type: 'hasWorktreeInclude',
      targetLevel: AiddLevelValue.gold,
    });
    expect(result[1]).toEqual({
      axis: 'intervention',
      type: 'humanCommitRatio',
      targetLevel: AiddLevelValue.silver,
    });
  });
});
