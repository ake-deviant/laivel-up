import { DeveloperProfile } from '../entities/developer-profile';

interface DeveloperProfileField {
  path: string;
  read(profile: DeveloperProfile): unknown;
}

export interface DeveloperProfileTriageReport {
  blockingIssues: string[];
  impactingNulls: string[];
  ignoredNulls: string[];
}

export class DeveloperProfileTriageService {
  private readonly impactingFields: DeveloperProfileField[] = [
    { path: 'size.distribution.xs', read: (profile) => profile.size.distribution?.xs ?? null },
    { path: 'size.distribution.s', read: (profile) => profile.size.distribution?.s ?? null },
    { path: 'size.distribution.m', read: (profile) => profile.size.distribution?.m ?? null },
    { path: 'size.distribution.l', read: (profile) => profile.size.distribution?.l ?? null },
    { path: 'size.distribution.xl', read: (profile) => profile.size.distribution?.xl ?? null },
    { path: 'size.medianFilesChanged', read: (profile) => profile.size.medianFilesChanged },
    { path: 'size.medianLinesChanged', read: (profile) => profile.size.medianLinesChanged },
    {
      path: 'harness.contextEngineering.claudeMd',
      read: (profile) => profile.harness.contextEngineering?.claudeMd ?? null,
    },
    {
      path: 'harness.contextEngineering.docsContextCount',
      read: (profile) => profile.harness.contextEngineering?.docsContextCount ?? null,
    },
    {
      path: 'harness.contextEngineering.docsSpecsCount',
      read: (profile) => profile.harness.contextEngineering?.docsSpecsCount ?? null,
    },
    {
      path: 'harness.contextEngineering.docsBrainstormCount',
      read: (profile) => profile.harness.contextEngineering?.docsBrainstormCount ?? null,
    },
    {
      path: 'harness.contextEngineering.docsPlansCount',
      read: (profile) => profile.harness.contextEngineering?.docsPlansCount ?? null,
    },
    {
      path: 'harness.contextEngineering.memoryCount',
      read: (profile) => profile.harness.contextEngineering?.memoryCount ?? null,
    },
    {
      path: 'harness.contextEngineering.tasksCount',
      read: (profile) => profile.harness.contextEngineering?.tasksCount ?? null,
    },
    {
      path: 'harness.aiConfiguration.agentsMd',
      read: (profile) => profile.harness.aiConfiguration?.agentsMd ?? null,
    },
    {
      path: 'harness.aiConfiguration.settingsJson',
      read: (profile) => profile.harness.aiConfiguration?.settingsJson ?? null,
    },
    {
      path: 'harness.aiConfiguration.agentsCount',
      read: (profile) => profile.harness.aiConfiguration?.agentsCount ?? null,
    },
    {
      path: 'harness.aiConfiguration.skillsCount',
      read: (profile) => profile.harness.aiConfiguration?.skillsCount ?? null,
    },
    {
      path: 'harness.aiConfiguration.hooksCount',
      read: (profile) => profile.harness.aiConfiguration?.hooksCount ?? null,
    },
    {
      path: 'harness.aiConfiguration.rulesCount',
      read: (profile) => profile.harness.aiConfiguration?.rulesCount ?? null,
    },
    {
      path: 'harness.aiConfiguration.aiCoauthoredRatio',
      read: (profile) => profile.harness.aiConfiguration?.aiCoauthoredRatio ?? null,
    },
    {
      path: 'harness.loops.ciMedianRunsToGreen',
      read: (profile) => profile.harness.loops?.ciMedianRunsToGreen ?? null,
    },
    {
      path: 'intervention.medianCorrectionCommitsAfterOpen',
      read: (profile) => profile.intervention.medianCorrectionCommitsAfterOpen,
    },
    {
      path: 'intervention.mergedWithoutHumanEditCount',
      read: (profile) => profile.intervention.mergedWithoutHumanEditCount,
    },
    {
      path: 'intervention.mergedWithoutHumanEditRatio',
      read: (profile) => profile.intervention.mergedWithoutHumanEditRatio,
    },
    {
      path: 'intervention.medianReviewCommentsReceived',
      read: (profile) => profile.intervention.medianReviewCommentsReceived,
    },
    {
      path: 'intervention.humanCommitRatio',
      read: (profile) => profile.intervention.humanCommitRatio,
    },
    {
      path: 'parallelism.maxConcurrentBranches',
      read: (profile) => profile.parallelism.maxConcurrentBranches,
    },
    {
      path: 'parallelism.medianConcurrentBranches',
      read: (profile) => profile.parallelism.medianConcurrentBranches,
    },
    {
      path: 'parallelism.hasWorktreeInclude',
      read: (profile) => profile.parallelism.hasWorktreeInclude,
    },
  ];

  private readonly ignoredFields: DeveloperProfileField[] = [
    { path: 'profile.role', read: (profile) => profile.profile?.role ?? null },
    {
      path: 'profile.experienceYears',
      read: (profile) => profile.profile?.experienceYears ?? null,
    },
    { path: 'profile.stack', read: (profile) => profile.profile?.stack ?? null },
    { path: 'profile.teamSize', read: (profile) => profile.profile?.teamSize ?? null },
    { path: 'profile.note', read: (profile) => profile.profile?.note ?? null },
    {
      path: 'intervention.totalPrCount',
      read: (profile) => profile.intervention.totalPrCount,
    },
  ];

  triage(profile: DeveloperProfile): DeveloperProfileTriageReport {
    const blockingIssues: string[] = [];
    const impactingNulls = this.collectNulls(profile, this.impactingFields);
    const ignoredNulls = this.collectNulls(profile, this.ignoredFields);

    if (!profile.id) blockingIssues.push('id');

    return { blockingIssues, impactingNulls, ignoredNulls };
  }

  private collectNulls(profile: DeveloperProfile, fields: DeveloperProfileField[]): string[] {
    return fields.filter((field) => field.read(profile) === null).map((field) => field.path);
  }
}
