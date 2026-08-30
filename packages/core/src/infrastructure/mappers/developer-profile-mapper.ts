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
  const totalPrCount = pr?.total ?? 0;
  return {
    distribution:
      pr?.size_distribution && totalPrCount > 0
        ? {
            xs: pr.size_distribution.xs / totalPrCount,
            s: pr.size_distribution.s / totalPrCount,
            m: pr.size_distribution.m / totalPrCount,
            l: pr.size_distribution.l / totalPrCount,
            xl: pr.size_distribution.xl / totalPrCount,
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
          claudeMd: aiContext.hasClaude ? 1 : 0,
          docsContextCount: aiContext.hasDocsContext ? 1 : 0,
          docsSpecsCount: aiContext.hasDocsSpecs ? 1 : 0,
          docsBrainstormCount: aiContext.hasDocsBrainstorm ? 1 : 0,
          docsPlansCount: aiContext.hasDocsPlans ? 1 : 0,
          memoryCount: aiContext.hasMemory ? 1 : 0,
          tasksCount: aiContext.hasTasks ? 1 : 0,
        }
      : null,
    aiConfiguration:
      gitActivity || aiContext
        ? {
            agentsMd: aiContext ? (aiContext.hasAgentsMd ? 1 : 0) : null,
            settingsJson: aiContext ? (aiContext.settings?.hasSettings ? 1 : 0) : null,
            agentsCount: gitActivity?.context_files?.agents_count ?? null,
            skillsCount: gitActivity?.context_files?.skills_count ?? null,
            hooksCount: gitActivity?.context_files?.hooks_count ?? null,
            rulesCount: gitActivity?.context_files?.rules_count ?? null,
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
  const count = pr?.merged_without_human_edit_after_open ?? null;
  const total = pr?.total ?? null;
  return {
    totalPrCount: total,
    medianCorrectionCommitsAfterOpen: pr?.median_correction_commits_after_open ?? null,
    mergedWithoutHumanEditCount: count,
    mergedWithoutHumanEditRatio: count != null && total ? count / total : null,
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
