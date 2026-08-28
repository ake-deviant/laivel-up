import { z } from 'zod';

export const laivelUpAiContextInputSchema = z.object({
  hasClaude: z.boolean(),
  hasAgentsMd: z.boolean(),
  hasWorktreeInclude: z.boolean(),
  hasDocsContext: z.boolean(),
  hasDocsSpecs: z.boolean(),
  hasDocsBrainstorm: z.boolean(),
  hasDocsPlans: z.boolean(),
  hasMemory: z.boolean(),
  hasTasks: z.boolean(),
  settings: z
    .object({
      hasSettings: z.boolean(),
      hasHooks: z.boolean(),
      rulesCount: z.number(),
      skillsCount: z.number(),
      agentsCount: z.number(),
    })
    .nullable(),
});

export type LaivelUpAiContextInput = z.infer<typeof laivelUpAiContextInputSchema>;
