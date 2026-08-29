import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { InterventionProfile } from '../../../domain/entities/intervention-profile';
import { noopLevelImprovementBus } from '../../../domain/ports/level-improvement-bus.port';
import { createInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { interventionThresholdsConfigFixture } from '../../fixtures/intervention-thresholds-config.fixture';

const cfg = interventionThresholdsConfigFixture;

const toProfile = (
  medianCorrectionCommitsAfterOpen: number | null,
  humanCommitRatio: number | null,
  mergedWithoutHumanEditRatio: number | null,
  medianReviewCommentsReceived: number | null,
): InterventionProfile => ({
  totalPrCount: null,
  medianCorrectionCommitsAfterOpen,
  mergedWithoutHumanEditCount: null,
  mergedWithoutHumanEditRatio,
  medianReviewCommentsReceived,
  humanCommitRatio,
});

describe('Intervention level calculator', () => {
  it.each([
    {
      label: 'no data',
      profile: toProfile(null, null, null, null),
      expected: AiddLevelValue.white,
    },
    {
      label: 'Perceval — many correction commits, high human ratio',
      profile: toProfile(4, 0.96, 0.05, 7),
      expected: AiddLevelValue.red,
    },
    {
      label: 'Bohort — some correction commits, moderate human ratio',
      profile: toProfile(2, 0.42, 0.21, 3),
      expected: AiddLevelValue.blue,
    },
    {
      label: 'Arthur — rare correction commit, low human ratio',
      profile: toProfile(1, 0.09, 0.3, 1),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'Leodagan — zero correction commits, low human ratio, half merged without edit',
      profile: toProfile(0, 0.13, 0.52, 2),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'gold — no correction, no human commits, all merged without edit',
      profile: toProfile(0, 0, 1, 0),
      expected: AiddLevelValue.gold,
    },
    {
      label: 'silver boundary values',
      profile: toProfile(0, 0.15, 0.5, 2),
      expected: AiddLevelValue.silver,
    },
    {
      label: 'human ratio just above silver threshold — falls to copper',
      profile: toProfile(0, 0.16, 0.52, 2),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'merged ratio just below silver threshold — falls to copper',
      profile: toProfile(0, 0.13, 0.49, 2),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'review comments just above silver threshold — falls to copper',
      profile: toProfile(0, 0.13, 0.52, 3),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'copper boundary values',
      profile: toProfile(1, null, null, 3),
      expected: AiddLevelValue.copper,
    },
    {
      label: 'blue boundary values',
      profile: toProfile(3, null, null, 5),
      expected: AiddLevelValue.blue,
    },
    {
      label: 'correction commits just above blue threshold — falls to red',
      profile: toProfile(4, null, null, 5),
      expected: AiddLevelValue.red,
    },
    {
      label: 'review comments above blue threshold — falls to red',
      profile: toProfile(2, null, null, 6),
      expected: AiddLevelValue.red,
    },
  ])('when $label — assigns $expected level', ({ profile, expected }) => {
    // arrange
    const calculator = createInterventionLevelCalculator(cfg, noopLevelImprovementBus);

    // act
    const result = calculator.calculate(profile);

    // assert
    expect(result).toBe(expected);
  });
});
