import { DataSource } from '../../domain/entities/data-source';
import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { HarnessProfile } from '../../domain/entities/harness-profile';
import { InterventionProfile } from '../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../domain/entities/parallelism-profile';
import { Profile } from '../../domain/entities/profile';
import { SizeProfile } from '../../domain/entities/size-profile';
import { LaivelUpAiContextInput } from '../inputs/laivel-up-ai-context-input';
import { LaivelUpGitActivityInput } from '../inputs/laivel-up-git-activity-input';
import { LaivelUpProfileInput } from '../inputs/laivel-up-profile-input';

const AVAILABLE_TO_DATA_SOURCE: Partial<Record<string, DataSource>> = {
  'git-activity.json': DataSource.gitActivity,
  'pull-requests.json': DataSource.pullRequests,
  'sonar-measures.json': DataSource.sonar,
  'repo-context/': DataSource.repoContext,
  'declaratif.md': DataSource.declarative,
  'session.md': DataSource.session,
  'code/': DataSource.code,
};

export class DeveloperProfileMapper {
  static toDomain(input: LaivelUpProfileInput): DeveloperProfile {
    const gitActivity = input.gitActivity ?? null;
    const aiContext = input.aiContext ?? null;

    return {
      id: input.profile_id,
      availableSources: mapAvailableSources(input.available),
      profile: mapProfile(input),
      size: mapSize(gitActivity),
      harness: mapHarness(gitActivity, aiContext),
      intervention: mapIntervention(gitActivity),
      parallelism: mapParallelism(gitActivity, aiContext),
    };
  }
}

function mapAvailableSources(available: string[]): DataSource[] {
  return available
    .map((s) => AVAILABLE_TO_DATA_SOURCE[s])
    .filter((s): s is DataSource => s !== undefined);
}

function mapProfile(input: LaivelUpProfileInput): Profile {
  return {
    role: input.role ?? null,
    experienceYears: input.experience_years ?? null,
    stack: input.stack ?? null,
    teamSize: input.team_size ?? null,
    note: input.note ?? null,
  };
}

function mapSize(gitActivity: LaivelUpGitActivityInput | null): SizeProfile {
  const pr = gitActivity?.pull_requests;
  return {
    distribution: pr?.size_distribution
      ? {
          xs: pr.size_distribution.xs ?? null,
          s: pr.size_distribution.s ?? null,
          m: pr.size_distribution.m ?? null,
          l: pr.size_distribution.l ?? null,
          xl: pr.size_distribution.xl ?? null,
        }
      : null,
    medianFilesChanged: pr?.median_files_changed ?? null,
    medianLinesChanged: pr?.median_lines_changed ?? null,
  };
}

function mapHarness(
  gitActivity: LaivelUpGitActivityInput | null,
  aiContext: LaivelUpAiContextInput | null,
): HarnessProfile {
  return {
    contextEngineering: aiContext
      ? {
          hasClaude: aiContext.hasClaude,
          hasAgentsMd: aiContext.hasAgentsMd,
          hasDocsContext: aiContext.hasDocsContext,
          hasDocsSpecs: aiContext.hasDocsSpecs,
          hasDocsBrainstorm: aiContext.hasDocsBrainstorm,
          hasDocsPlans: aiContext.hasDocsPlans,
          hasMemory: aiContext.hasMemory,
          hasTasks: aiContext.hasTasks,
        }
      : null,
    behavior:
      gitActivity || aiContext
        ? {
            rulesCount: gitActivity?.context_files?.rules_count ?? null,
            agentsCount: gitActivity?.context_files?.agents_count ?? null,
            hooksCount: gitActivity?.context_files?.hooks_count ?? null,
            skillsCount: gitActivity?.context_files?.skills_count ?? null,
            hasSettings: aiContext?.settings?.hasSettings ?? null,
            aiCoauthoredRatio: gitActivity?.commits?.ai_coauthored_ratio ?? null,
          }
        : null,
    loops: gitActivity?.ci
      ? { ciMedianRunsToGreen: gitActivity.ci.median_runs_to_green ?? null }
      : null,
  };
}

function mapIntervention(gitActivity: LaivelUpGitActivityInput | null): InterventionProfile {
  const pr = gitActivity?.pull_requests;
  const aiRatio = gitActivity?.commits?.ai_coauthored_ratio;
  return {
    medianCorrectionCommitsAfterOpen: pr?.median_correction_commits_after_open ?? null,
    mergedWithoutHumanEditRatio: pr?.merged_without_human_edit_after_open ?? null,
    medianReviewCommentsReceived: pr?.median_review_comments_received ?? null,
    humanCommitRatio: aiRatio != null ? 1 - aiRatio : null,
  };
}

function mapParallelism(
  gitActivity: LaivelUpGitActivityInput | null,
  aiContext: LaivelUpAiContextInput | null,
): ParallelismProfile {
  return {
    maxConcurrentBranches: gitActivity?.parallelism?.max_concurrent_branches ?? null,
    medianConcurrentBranches: gitActivity?.parallelism?.median_concurrent_branches ?? null,
    hasWorktreeInclude: aiContext ? aiContext.hasWorktreeInclude : null,
  };
}
