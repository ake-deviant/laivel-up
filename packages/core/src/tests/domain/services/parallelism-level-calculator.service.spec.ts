import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { ParallelismProfile } from '../../../domain/entities/parallelism-profile';
import {
  WORKTREE_DATA_MISSING,
  WORKTREE_NOT_CONFIGURED,
} from '../../../domain/events/parallelism-improvement.events';
import {
  ILevelImprovementBus,
  LevelImprovementEvent,
  noopLevelImprovementBus,
} from '../../../domain/ports/level-improvement-bus.port';
import { createWeightedParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { parallelismThresholdsConfigFixture } from '../../fixtures/parallelism-thresholds-config.fixture';

const cfg = parallelismThresholdsConfigFixture;

const toProfile = (
  medianConcurrentBranches: number | null,
  maxConcurrentBranches: number | null,
  hasWorktreeInclude: boolean | null,
): ParallelismProfile => ({ medianConcurrentBranches, maxConcurrentBranches, hasWorktreeInclude });

const createSpyBus = () => {
  const events: LevelImprovementEvent[] = [];
  const bus: ILevelImprovementBus = { emit: (e) => events.push(e) };
  return { bus, events };
};

describe('Parallelism level calculator', () => {
  it.each([
    {
      label: 'no data',
      profile: toProfile(null, null, null),
      expected: AiddLevelValue.white,
    },
    {
      label: 'score below red threshold',
      profile: toProfile(1, 1, null),
      expected: AiddLevelValue.white,
    },
    {
      label: 'score at red threshold without worktree',
      profile: toProfile(1, 2, false),
      expected: AiddLevelValue.red,
    },
    {
      label: 'score at blue threshold without worktree',
      profile: toProfile(2, 0, false),
      expected: AiddLevelValue.blue,
    },
    {
      label: 'score at green threshold without worktree',
      profile: toProfile(3, 0, false),
      expected: AiddLevelValue.green,
    },
    {
      label: 'score at copper threshold without worktree',
      profile: toProfile(4, 0, false),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'score at gold threshold with worktree',
      profile: toProfile(4, 0, true),
      expected: AiddLevelValue.gold,
    },
    {
      label: 'score at silver threshold without worktree',
      profile: toProfile(5, 0, false),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'high score without worktree',
      profile: toProfile(4, 7, false),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'high score with worktree',
      profile: toProfile(4, 7, true),
      expected: AiddLevelValue.gold,
    },
  ])('when $label — assigns $expected level', ({ profile, expected }) => {
    // arrange
    const calculator = createWeightedParallelismLevelCalculator(cfg, noopLevelImprovementBus);

    // act
    const result = calculator.calculate(profile);

    // assert
    expect(result).toBe(expected);
  });
});

describe('Parallelism level calculator — improvement events', () => {
  it('when score reaches gold threshold but worktree data is missing — emits worktree_data_missing', () => {
    // arrange
    const { bus, events } = createSpyBus();
    const calculator = createWeightedParallelismLevelCalculator(cfg, bus);

    // act
    calculator.calculate(toProfile(4, 0, null));

    // assert
    expect(events).toContainEqual({ type: WORKTREE_DATA_MISSING, axis: 'parallelism' });
  });

  it('when score reaches gold threshold but worktree is not configured — emits worktree_not_configured', () => {
    // arrange
    const { bus, events } = createSpyBus();
    const calculator = createWeightedParallelismLevelCalculator(cfg, bus);

    // act
    calculator.calculate(toProfile(4, 0, false));

    // assert
    expect(events).toContainEqual({ type: WORKTREE_NOT_CONFIGURED, axis: 'parallelism' });
  });

  it('when gold is reached — emits no improvement event', () => {
    // arrange
    const { bus, events } = createSpyBus();
    const calculator = createWeightedParallelismLevelCalculator(cfg, bus);

    // act
    calculator.calculate(toProfile(4, 0, true));

    // assert
    expect(events).toHaveLength(0);
  });

  it('when score does not reach gold threshold — emits no improvement event', () => {
    // arrange
    const { bus, events } = createSpyBus();
    const calculator = createWeightedParallelismLevelCalculator(cfg, bus);

    // act
    calculator.calculate(toProfile(1, 2, null));

    // assert
    expect(events).toHaveLength(0);
  });
});
