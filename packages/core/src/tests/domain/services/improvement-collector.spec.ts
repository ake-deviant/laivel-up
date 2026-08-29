import { ImprovementCollector } from '../../../domain/services/improvement-collector';

describe('ImprovementCollector', () => {
  it('when an event is emitted — stores it as an improvement', () => {
    // arrange
    const collector = new ImprovementCollector();

    // act
    collector.emit({ axis: 'parallelism', type: 'worktree_not_configured' });

    // assert
    expect(collector.improvements).toEqual([
      { axis: 'parallelism', type: 'worktree_not_configured' },
    ]);
  });

  it('when multiple events are emitted — stores all of them in order', () => {
    // arrange
    const collector = new ImprovementCollector();

    // act
    collector.emit({ axis: 'parallelism', type: 'worktree_data_missing' });
    collector.emit({ axis: 'parallelism', type: 'worktree_not_configured' });

    // assert
    expect(collector.improvements).toHaveLength(2);
  });

  it('when improvements are read — returns a copy, not the internal array', () => {
    // arrange
    const collector = new ImprovementCollector();
    collector.emit({ axis: 'parallelism', type: 'worktree_not_configured' });

    // act
    const result = collector.improvements;
    result.pop();

    // assert
    expect(collector.improvements).toHaveLength(1);
  });
});
