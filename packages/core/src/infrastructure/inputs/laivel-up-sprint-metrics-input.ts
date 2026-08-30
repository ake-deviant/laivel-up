import { z } from 'zod';

export const laivelUpSprintMetricsInputSchema = z.object({
  period: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
      sprint_count: z.number().optional(),
      sprint_duration_days: z.number().optional(),
    })
    .optional(),
  throughput: z
    .object({
      story_points_per_sprint: z.number().optional(),
      team_avg_story_points_per_sprint: z.number().optional(),
      completion_rate: z.number().optional(),
    })
    .optional(),
  cycle_time: z
    .object({
      median_days_ticket_to_pr: z.number().optional(),
      team_avg_median_days_ticket_to_pr: z.number().optional(),
    })
    .optional(),
  scope: z
    .object({
      features_per_sprint: z.number().optional(),
      bugs_per_sprint: z.number().optional(),
    })
    .optional(),
});

export type LaivelUpSprintMetricsInput = z.infer<typeof laivelUpSprintMetricsInputSchema>;
