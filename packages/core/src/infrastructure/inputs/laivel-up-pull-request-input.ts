import { z } from 'zod';

export const laivelUpPullRequestInputSchema = z.object({
  number: z.number().optional(),
  title: z.string().optional(),
  state: z.enum(['open', 'closed']).optional(),
  draft: z.boolean().optional(),
  merged: z.boolean().optional(),
  created_at: z.string().optional(),
  merged_at: z.string().nullable().optional(),
  closed_at: z.string().nullable().optional(),
  head: z.object({ ref: z.string() }).optional(),
  base: z.object({ ref: z.string() }).optional(),
  changed_files: z.number().optional(),
  additions: z.number().optional(),
  deletions: z.number().optional(),
  commits: z.number().optional(),
  review_comments: z.number().optional(),
  body: z.string().nullable().optional(),
});

export type LaivelUpPullRequestInput = z.infer<typeof laivelUpPullRequestInputSchema>;
