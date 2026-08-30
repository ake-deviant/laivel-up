import { DeveloperProfile } from '../../../domain/entities/developer-profile';
import { DeveloperProfileTriageService } from '../../../domain/services/developer-profile-triage.service';
import { DeveloperProfileFixture } from '../../fixtures/developer-profile.fixture';

describe('Developer profile triage service', () => {
  const service = new DeveloperProfileTriageService();

  it('when all optional data is missing — classifies every accessible null by score impact', () => {
    const report = service.triage(DeveloperProfileFixture.valid());

    expect(report.blockingIssues).toEqual([]);
    expect(report.impactingNulls).toEqual([
      'size.distribution.xs',
      'size.distribution.s',
      'size.distribution.m',
      'size.distribution.l',
      'size.distribution.xl',
      'size.medianFilesChanged',
      'size.medianLinesChanged',
      'harness.contextEngineering.claudeMd',
      'harness.contextEngineering.docsContextCount',
      'harness.contextEngineering.docsSpecsCount',
      'harness.contextEngineering.docsBrainstormCount',
      'harness.contextEngineering.docsPlansCount',
      'harness.contextEngineering.memoryCount',
      'harness.contextEngineering.tasksCount',
      'harness.aiConfiguration.agentsMd',
      'harness.aiConfiguration.settingsJson',
      'harness.aiConfiguration.agentsCount',
      'harness.aiConfiguration.skillsCount',
      'harness.aiConfiguration.hooksCount',
      'harness.aiConfiguration.rulesCount',
      'harness.aiConfiguration.aiCoauthoredRatio',
      'harness.loops.ciMedianRunsToGreen',
      'intervention.medianCorrectionCommitsAfterOpen',
      'intervention.mergedWithoutHumanEditCount',
      'intervention.mergedWithoutHumanEditRatio',
      'intervention.medianReviewCommentsReceived',
      'intervention.humanCommitRatio',
      'parallelism.maxConcurrentBranches',
      'parallelism.medianConcurrentBranches',
      'parallelism.hasWorktreeInclude',
    ]);
    expect(report.ignoredNulls).toEqual([
      'profile.role',
      'profile.experienceYears',
      'profile.stack',
      'profile.teamSize',
      'profile.note',
      'intervention.totalPrCount',
    ]);
  });

  it('when values are zero or false — does not classify them as null', () => {
    const profile: DeveloperProfile = {
      ...DeveloperProfileFixture.valid(),
      size: {
        distribution: { xs: 0, s: 0, m: 0, l: 0, xl: 0 },
        medianFilesChanged: 0,
        medianLinesChanged: 0,
      },
      parallelism: {
        maxConcurrentBranches: 0,
        medianConcurrentBranches: 0,
        hasWorktreeInclude: false,
      },
    };

    const report = service.triage(profile);

    expect(report.impactingNulls).not.toContain('size.distribution.xs');
    expect(report.impactingNulls).not.toContain('size.medianFilesChanged');
    expect(report.impactingNulls).not.toContain('parallelism.hasWorktreeInclude');
  });

  it('when id is missing — reports a blocking issue', () => {
    const report = service.triage(DeveloperProfileFixture.withoutId());

    expect(report.blockingIssues).toEqual(['id']);
  });
});
