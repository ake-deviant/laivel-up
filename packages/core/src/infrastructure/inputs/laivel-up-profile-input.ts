import { z } from 'zod';
import { laivelUpAiContextInputSchema } from './laivel-up-ai-context-input';
import { laivelUpGitActivityInputSchema } from './laivel-up-git-activity-input';
import { laivelUpPullRequestInputSchema } from './laivel-up-pull-request-input';
import { laivelUpSonarMeasuresInputSchema } from './laivel-up-sonar-measures-input';
import { laivelUpSprintMetricsInputSchema } from './laivel-up-sprint-metrics-input';
import { laivelUpDeliveryConfidenceInputSchema } from './laivel-up-delivery-confidence-input';

export const laivelUpProfileInputSchema = z.object({
  profile_id: z.string(),
  available: z.array(z.string()),
  role: z.string().nullable().optional(),
  experience_years: z.number().nullable().optional(),
  stack: z.array(z.string()).nullable().optional(),
  team_size: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  gitActivity: laivelUpGitActivityInputSchema.nullable().optional(),
  pullRequests: z.array(laivelUpPullRequestInputSchema).nullable().optional(),
  sonarMeasures: laivelUpSonarMeasuresInputSchema.nullable().optional(),
  aiContext: laivelUpAiContextInputSchema.nullable().optional(),
  declaratif: z.string().nullable().optional(),
  session: z.string().nullable().optional(),
  sprintMetrics: laivelUpSprintMetricsInputSchema.nullable().optional(),
  deliveryConfidence: laivelUpDeliveryConfidenceInputSchema.nullable().optional(),
});

export type LaivelUpProfileInput = z.infer<typeof laivelUpProfileInputSchema>;
