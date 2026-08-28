import { z } from 'zod';

export const laivelUpSonarMeasuresInputSchema = z.object({
  component: z
    .object({
      key: z.string().optional(),
      name: z.string().optional(),
      qualifier: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
  measures: z
    .array(
      z.object({
        metric: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  analysedAt: z.string().optional(),
});

export type LaivelUpSonarMeasuresInput = z.infer<typeof laivelUpSonarMeasuresInputSchema>;
