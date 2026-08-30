import { z } from 'zod';

export const laivelUpProfileSummaryInputSchema = z.object({
  profile_id: z.string(),
  available: z.array(z.string()),
  role: z.string().nullable().optional(),
  experience_years: z.number().nullable().optional(),
  stack: z.array(z.string()).nullable().optional(),
  team_size: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type LaivelUpProfileSummaryInput = z.infer<typeof laivelUpProfileSummaryInputSchema>;
