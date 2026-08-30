import { DeveloperProfileResultPresenter } from '../../presentation/developer-profile-result.presenter';
import { DeveloperProfileResult } from '../../domain/entities/developer-profile-result';
import { AiddLevelValue } from '../../domain/entities/aidd-level-value';

const makeResult = (overrides: Partial<DeveloperProfileResult> = {}): DeveloperProfileResult => ({
  overallLevel: AiddLevelValue.gold,
  sizeLevel: AiddLevelValue.gold,
  harnessLevel: AiddLevelValue.silver,
  interventionLevel: AiddLevelValue.copper,
  parallelismLevel: AiddLevelValue.gold,
  axisProfiles: {
    size: {
      distribution: { xs: 0.1, s: 0.2, m: 0.3, l: 0.25, xl: 0.15 },
      medianFilesChanged: 8,
      medianLinesChanged: 240,
    },
    harness: {
      contextEngineering: {
        claudeMd: 1,
        docsContextCount: 2,
        docsSpecsCount: 3,
        docsBrainstormCount: 1,
        docsPlansCount: 2,
        memoryCount: 4,
        tasksCount: 3,
      },
      aiConfiguration: {
        agentsMd: 1,
        settingsJson: 1,
        agentsCount: 2,
        skillsCount: 3,
        hooksCount: 1,
        rulesCount: 4,
        aiCoauthoredRatio: 0.85,
      },
      loops: { ciMedianRunsToGreen: 1 },
    },
    intervention: {
      totalPrCount: 20,
      medianCorrectionCommitsAfterOpen: 1,
      mergedWithoutHumanEditCount: 12,
      mergedWithoutHumanEditRatio: 0.6,
      medianReviewCommentsReceived: 2,
      humanCommitRatio: 0.15,
    },
    parallelism: {
      medianConcurrentBranches: 3,
      maxConcurrentBranches: 6,
      hasWorktreeInclude: true,
    },
  },
  signalMatrices: [],
  improvements: [],
  busImprovements: [],
  ...overrides,
});

describe('DeveloperProfileResult presenter', () => {
  it('when presenting a result — maps overall level with value, label and rank', () => {
    // arrange
    const result = makeResult({ overallLevel: AiddLevelValue.silver });

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.overallLevel).toEqual({ value: 'silver', label: 'Silver', rank: 5 });
  });

  it('when presenting a result — produces 4 axes in order: size, harness, intervention, parallelism', () => {
    // arrange
    const result = makeResult();

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.axes.map((a) => a.axis)).toEqual(['size', 'harness', 'intervention', 'parallelism']);
  });

  it('when presenting a result — maps axis display labels', () => {
    // arrange
    const result = makeResult();

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.axes.map((a) => a.label)).toEqual(['Taille', 'Harness', 'Intervention', 'Parallèle']);
  });

  it('when presenting a result — maps each axis level with value, label and rank', () => {
    // arrange
    const result = makeResult({
      sizeLevel: AiddLevelValue.gold,
      harnessLevel: AiddLevelValue.silver,
      interventionLevel: AiddLevelValue.copper,
      parallelismLevel: AiddLevelValue.blue,
    });

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.axes[0].level).toEqual({ value: 'gold', label: 'Gold', rank: 6 });
    expect(vm.axes[1].level).toEqual({ value: 'silver', label: 'Silver', rank: 5 });
    expect(vm.axes[2].level).toEqual({ value: 'copper', label: 'Copper', rank: 4 });
    expect(vm.axes[3].level).toEqual({ value: 'blue', label: 'Blue', rank: 2 });
  });

  it('when presenting a result with improvements — maps them preserving axis, type and targetLevel', () => {
    // arrange
    const result = makeResult({
      improvements: [
        { axis: 'parallelism', type: 'hasWorktreeInclude', targetLevel: AiddLevelValue.gold },
      ],
    });

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.improvements).toEqual([
      { axis: 'parallelism', type: 'hasWorktreeInclude', targetLevel: AiddLevelValue.gold },
    ]);
  });

  it('when presenting a result with no improvements — returns empty array', () => {
    // arrange
    const result = makeResult({ improvements: [] });

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.improvements).toHaveLength(0);
  });

  it('when presenting the white level — assigns rank 0', () => {
    // arrange
    const result = makeResult({ overallLevel: AiddLevelValue.white });

    // act
    const vm = DeveloperProfileResultPresenter.present(result);

    // assert
    expect(vm.overallLevel).toEqual({ value: 'white', label: 'White', rank: 0 });
  });

  it('when presenting axis profiles — maps every field detail defined by the schema', () => {
    const vm = DeveloperProfileResultPresenter.present(makeResult());

    expect(vm.axes.map((axis) => axis.fieldGroups.flatMap((group) => group.fields).length)).toEqual(
      [7, 15, 6, 3],
    );
    expect(vm.axes[0].fieldGroups[0]).toEqual({
      name: 'distribution',
      label: 'Distribution',
      fields: expect.arrayContaining([
        {
          name: 'xs',
          label: 'PRs XS (ratio)',
          description:
            'Part des PRs de moins de 10 lignes — correctifs ponctuels ou ajustements triviaux',
          value: 0.1,
        },
      ]),
    });
    expect(vm.axes[1].fieldGroups.map((group) => group.name)).toEqual([
      'contextEngineering',
      'aiConfiguration',
      'loops',
    ]);
    expect(vm.axes[2].fieldGroups[0].fields.map((field) => field.name)).toEqual([
      'totalPrCount',
      'medianCorrectionCommitsAfterOpen',
      'mergedWithoutHumanEditCount',
      'mergedWithoutHumanEditRatio',
      'medianReviewCommentsReceived',
      'humanCommitRatio',
    ]);
    expect(vm.axes[3].fieldGroups[0].fields[2]).toEqual({
      name: 'hasWorktreeInclude',
      label: '.worktreeinclude présent',
      description:
        'Fichier Git permettant de partager la config IA entre plusieurs worktrees actifs',
      value: true,
    });
  });

  it('when an axis profile is unavailable — preserves null values in field details', () => {
    const baseResult = makeResult();
    const result = makeResult({
      axisProfiles: {
        ...baseResult.axisProfiles,
        harness: { contextEngineering: null, aiConfiguration: null, loops: null },
      },
    });

    const vm = DeveloperProfileResultPresenter.present(result);

    expect(
      vm.axes[1].fieldGroups
        .flatMap((group) => group.fields)
        .every((field) => field.value === null),
    ).toBe(true);
  });
});
