import { DataSource } from '../../domain/entities/data-source';
import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { HarnessProfile } from '../../domain/entities/harness-profile';
import { InterventionProfile } from '../../domain/entities/intervention-profile';
import { ParallelismProfile } from '../../domain/entities/parallelism-profile';
import { Profile } from '../../domain/entities/profile';
import { SizeProfile } from '../../domain/entities/size-profile';
import { VelocityProfile } from '../../domain/entities/velocity-profile';
import { DeliveryConfidenceProfile } from '../../domain/entities/delivery-confidence-profile';
import { LaivelUpAiContextInput } from '../inputs/laivel-up-ai-context-input';
import { LaivelUpGitActivityInput } from '../inputs/laivel-up-git-activity-input';
import { LaivelUpProfileInput } from '../inputs/laivel-up-profile-input';
import { LaivelUpSprintMetricsInput } from '../inputs/laivel-up-sprint-metrics-input';
import { LaivelUpDeliveryConfidenceInput } from '../inputs/laivel-up-delivery-confidence-input';

const AVAILABLE_TO_DATA_SOURCE: Partial<Record<string, DataSource>> = {
  'git-activity.json': DataSource.gitActivity,
  'pull-requests.json': DataSource.pullRequests,
  'sonar-measures.json': DataSource.sonar,
  'repo-context/': DataSource.repoContext,
  'sprint-metrics.json': DataSource.sprintMetrics,
  'declaratif.md': DataSource.declarative,
  'session.md': DataSource.session,
  'code/': DataSource.code,
  'delivery-confidence.json': DataSource.deliveryConfidence,
};

export class DeveloperProfileMapper {
  static toDomain(input: LaivelUpProfileInput): DeveloperProfile {
    const gitActivity = input.gitActivity ?? null;
    const aiContext = input.aiContext ?? null;
    const sprintMetrics = input.sprintMetrics ?? null;

    return {
      id: input.profile_id,
      availableSources: mapAvailableSources(input.available),
      profile: mapProfile(input),
      size: mapSize(gitActivity),
      harness: mapHarness(gitActivity, aiContext),
      intervention: mapIntervention(gitActivity),
      parallelism: mapParallelism(gitActivity, aiContext),
      velocity: mapVelocity(sprintMetrics),
      deliveryConfidence: mapDeliveryConfidence(input.deliveryConfidence ?? null),
    };
  }
}

function mapDeliveryConfidence(
  input: LaivelUpDeliveryConfidenceInput | null,
): DeliveryConfidenceProfile {
  return {
    context: {
      periodStart: input?.context?.periodStart ?? null,
      periodEnd: input?.context?.periodEnd ?? null,
      activeDays: input?.context?.activeDays ?? null,
      expectedRole: input?.context?.expectedRole ?? null,
      productCriticality: input?.context?.productCriticality ?? null,
      codebaseMaturity: input?.context?.codebaseMaturity ?? null,
      teamStability: input?.context?.teamStability ?? null,
      supportWorkRatio: input?.context?.supportWorkRatio ?? null,
      incidentWorkRatio: input?.context?.incidentWorkRatio ?? null,
      availableSources: input?.context?.availableSources ?? [],
    },
    businessImpact: {
      featuresCompletedCount: input?.businessImpact?.featuresCompletedCount ?? null,
      featuresAdoptedRatio: input?.businessImpact?.featuresAdoptedRatio ?? null,
      businessOutcomeAchievementRatio:
        input?.businessImpact?.businessOutcomeAchievementRatio ?? null,
      abandonedWorkRatio: input?.businessImpact?.abandonedWorkRatio ?? null,
      reworkRatio: input?.businessImpact?.reworkRatio ?? null,
      timeToFirstValueDays: input?.businessImpact?.timeToFirstValueDays ?? null,
    },
    deliveryReliability: {
      commitmentCompletionRatio: input?.deliveryReliability?.commitmentCompletionRatio ?? null,
      deliveryForecastAccuracy: input?.deliveryReliability?.deliveryForecastAccuracy ?? null,
      scopeChangeAbsorptionRatio: input?.deliveryReliability?.scopeChangeAbsorptionRatio ?? null,
      blockedTimeRatio: input?.deliveryReliability?.blockedTimeRatio ?? null,
      dependencyWaitingTimeDays: input?.deliveryReliability?.dependencyWaitingTimeDays ?? null,
      medianCycleTimeDays: input?.deliveryReliability?.medianCycleTimeDays ?? null,
      completionRate: input?.deliveryReliability?.completionRate ?? null,
    },
    qualityAndRisk: {
      changeFailureRate: input?.qualityAndRisk?.changeFailureRate ?? null,
      escapedDefectRate: input?.qualityAndRisk?.escapedDefectRate ?? null,
      regressionRate: input?.qualityAndRisk?.regressionRate ?? null,
      rollbackRate: input?.qualityAndRisk?.rollbackRate ?? null,
      hotfixRate: input?.qualityAndRisk?.hotfixRate ?? null,
      defectResolutionTimeDays: input?.qualityAndRisk?.defectResolutionTimeDays ?? null,
      criticalCodeWithoutTestsRatio: input?.qualityAndRisk?.criticalCodeWithoutTestsRatio ?? null,
      testCoverageDelta: input?.qualityAndRisk?.testCoverageDelta ?? null,
      technicalDebtIntroducedRatio: input?.qualityAndRisk?.technicalDebtIntroducedRatio ?? null,
      technicalDebtResolvedRatio: input?.qualityAndRisk?.technicalDebtResolvedRatio ?? null,
      securityIssueIntroductionRate: input?.qualityAndRisk?.securityIssueIntroductionRate ?? null,
      securityIssueResolutionTimeDays:
        input?.qualityAndRisk?.securityIssueResolutionTimeDays ?? null,
      productionIncidentContributionRate:
        input?.qualityAndRisk?.productionIncidentContributionRate ?? null,
      incidentRecoveryContributionScore:
        input?.qualityAndRisk?.incidentRecoveryContributionScore ?? null,
      observabilityCoverageRatio: input?.qualityAndRisk?.observabilityCoverageRatio ?? null,
      rollbackPreparedRatio: input?.qualityAndRisk?.rollbackPreparedRatio ?? null,
    },
    autonomy: {
      independentDeliveryRatio: input?.autonomy?.independentDeliveryRatio ?? null,
      clarificationRequestQuality: input?.autonomy?.clarificationRequestQuality ?? null,
      escalationRelevanceRatio: input?.autonomy?.escalationRelevanceRatio ?? null,
      decisionReversalRate: input?.autonomy?.decisionReversalRate ?? null,
      humanCommitRatio: input?.autonomy?.humanCommitRatio ?? null,
      medianCorrectionCommitsAfterOpen: input?.autonomy?.medianCorrectionCommitsAfterOpen ?? null,
      mergedWithoutHumanEditRatio: input?.autonomy?.mergedWithoutHumanEditRatio ?? null,
    },
    collectiveImpact: {
      reviewHelpfulnessScore: input?.collectiveImpact?.reviewHelpfulnessScore ?? null,
      reviewResponseTimeHours: input?.collectiveImpact?.reviewResponseTimeHours ?? null,
      reviewRiskDetectionRate: input?.collectiveImpact?.reviewRiskDetectionRate ?? null,
      knowledgeSharingFrequency: input?.collectiveImpact?.knowledgeSharingFrequency ?? null,
      busFactorContribution: input?.collectiveImpact?.busFactorContribution ?? null,
      crossTeamDeliveryRatio: input?.collectiveImpact?.crossTeamDeliveryRatio ?? null,
      mentoringImpactScore: input?.collectiveImpact?.mentoringImpactScore ?? null,
      handoverSuccessRatio: input?.collectiveImpact?.handoverSuccessRatio ?? null,
      teamThroughputImpact: input?.collectiveImpact?.teamThroughputImpact ?? null,
      codeOwnershipConcentration: input?.collectiveImpact?.codeOwnershipConcentration ?? null,
      documentationFreshnessRatio: input?.collectiveImpact?.documentationFreshnessRatio ?? null,
    },
    complexity: {
      problemAmbiguityScore: input?.complexity?.problemAmbiguityScore ?? null,
      domainComplexityScore: input?.complexity?.domainComplexityScore ?? null,
      technicalComplexityScore: input?.complexity?.technicalComplexityScore ?? null,
      dependencyComplexityScore: input?.complexity?.dependencyComplexityScore ?? null,
      successfulComplexWorkRatio: input?.complexity?.successfulComplexWorkRatio ?? null,
      simplificationImpactScore: input?.complexity?.simplificationImpactScore ?? null,
      architectureDecisionQualityScore: input?.complexity?.architectureDecisionQualityScore ?? null,
      sizeDistribution: input?.complexity?.sizeDistribution ?? null,
    },
    aiEffectiveness: {
      aiGeneratedChangeAcceptanceRatio:
        input?.aiEffectiveness?.aiGeneratedChangeAcceptanceRatio ?? null,
      aiRelatedDefectRate: input?.aiEffectiveness?.aiRelatedDefectRate ?? null,
      aiVerificationCoverageRatio: input?.aiEffectiveness?.aiVerificationCoverageRatio ?? null,
      aiCostPerDeliveredOutcome: input?.aiEffectiveness?.aiCostPerDeliveredOutcome ?? null,
      aiContextReuseRatio: input?.aiEffectiveness?.aiContextReuseRatio ?? null,
      parallelWorkCompletionRatio: input?.aiEffectiveness?.parallelWorkCompletionRatio ?? null,
      aiCoauthoredRatio: input?.aiEffectiveness?.aiCoauthoredRatio ?? null,
      medianConcurrentBranches: input?.aiEffectiveness?.medianConcurrentBranches ?? null,
      maxConcurrentBranches: input?.aiEffectiveness?.maxConcurrentBranches ?? null,
      hasWorktreeInclude: input?.aiEffectiveness?.hasWorktreeInclude ?? null,
    },
  };
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
            agentsMd: aiContext
              ? aiContext.hasAgentsMd
                ? 1
                : 0
              : gitActivity?.context_files?.agents_md === undefined
                ? null
                : gitActivity.context_files.agents_md
                  ? 1
                  : 0,
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

function mapVelocity(sprintMetrics: LaivelUpSprintMetricsInput | null): VelocityProfile {
  return {
    sprintCount: sprintMetrics?.period?.sprint_count ?? null,
    storyPointsPerSprint: sprintMetrics?.throughput?.story_points_per_sprint ?? null,
    teamAvgStoryPointsPerSprint:
      sprintMetrics?.throughput?.team_avg_story_points_per_sprint ?? null,
    completionRate: sprintMetrics?.throughput?.completion_rate ?? null,
    medianDaysTicketToPr: sprintMetrics?.cycle_time?.median_days_ticket_to_pr ?? null,
    teamAvgMedianDaysTicketToPr:
      sprintMetrics?.cycle_time?.team_avg_median_days_ticket_to_pr ?? null,
    featuresPerSprint: sprintMetrics?.scope?.features_per_sprint ?? null,
    bugsPerSprint: sprintMetrics?.scope?.bugs_per_sprint ?? null,
  };
}
