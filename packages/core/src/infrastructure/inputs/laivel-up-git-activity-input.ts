import { z } from 'zod';

export const laivelUpGitActivityInputSchema = z.object({
  period: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  repositories: z.number().optional(),
  pull_requests: z
    .object({
      total: z.number().optional(),
      size_distribution: z
        .object({
          xs: z.number(),
          s: z.number(),
          m: z.number(),
          l: z.number(),
          xl: z.number(),
        })
        .optional(),
      median_files_changed: z.number().optional(),
      median_lines_changed: z.number().optional(),
      median_correction_commits_after_open: z.number().optional(),
      merged_without_human_edit_after_open: z.number().optional(),
      reverted: z.number().optional(),
      median_review_comments_received: z.number().optional(),
    })
    .optional(),
  commits: z
    .object({
      total: z.number().optional(),
      median_per_pr: z.number().optional(),
      ai_coauthored_ratio: z.number().optional(),
      message_convention_compliance: z.number().optional(),
    })
    .optional(),
  tests: z
    .object({
      coverage_start: z.number().optional(),
      coverage_end: z.number().optional(),
      prs_with_tests_ratio: z.number().optional(),
    })
    .optional(),
  parallelism: z
    .object({
      max_concurrent_branches: z.number().optional(),
      median_concurrent_branches: z.number().optional(),
    })
    .optional(),
  ci: z
    .object({
      failure_rate: z.number().optional(),
      median_runs_to_green: z.number().optional(),
    })
    .optional(),
  context_files: z
    .object({
      agents_md: z.boolean().optional(),
      rules_count: z.number().optional(),
      skills_count: z.number().optional(),
      hooks_count: z.number().optional(),
      agents_count: z.number().optional(),
      last_updated: z.string().nullable().optional(),
    })
    .optional(),
  assistant_usage: z
    .object({
      declared_tools: z.array(z.string()).optional(),
      editor_integration: z.boolean().optional(),
      sessions_per_week: z.number().optional(),
      tokens_per_week: z.number().optional(),
    })
    .optional(),
});

export type LaivelUpGitActivityInput = z.infer<typeof laivelUpGitActivityInputSchema>;
