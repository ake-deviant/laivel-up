import { z } from 'zod';
import { IProfileParser, ProfileParseResult } from '../../application/ports/profile-parser.port';
import { ParseError } from '../../domain/errors/parse.error';
import { FormatWarning } from '../../domain/shared/format-warning';
import { err, ok } from '../../domain/shared/result';
import { DeveloperProfileMapper } from '../mappers/developer-profile-mapper';
import { laivelUpAiContextInputSchema } from '../inputs/laivel-up-ai-context-input';
import { laivelUpGitActivityInputSchema } from '../inputs/laivel-up-git-activity-input';
import { laivelUpProfileInputSchema } from '../inputs/laivel-up-profile-input';
import { laivelUpPullRequestInputSchema } from '../inputs/laivel-up-pull-request-input';
import { laivelUpSonarMeasuresInputSchema } from '../inputs/laivel-up-sonar-measures-input';
import { laivelUpSprintMetricsInputSchema } from '../inputs/laivel-up-sprint-metrics-input';
import { laivelUpDeliveryConfidenceInputSchema } from '../inputs/laivel-up-delivery-confidence-input';

const BLOCKING_FIELDS = new Set(['profile_id', 'available']);

const permissiveSchema = z.object({
  profile_id: z.string(),
  available: z.array(z.string()),
  role: z.string().nullable().optional().catch(null),
  experience_years: z.number().nullable().optional().catch(null),
  stack: z.array(z.string()).nullable().optional().catch(null),
  team_size: z.number().nullable().optional().catch(null),
  note: z.string().nullable().optional().catch(null),
  gitActivity: laivelUpGitActivityInputSchema.nullable().optional().catch(null),
  pullRequests: z.array(laivelUpPullRequestInputSchema).nullable().optional().catch(null),
  sonarMeasures: laivelUpSonarMeasuresInputSchema.nullable().optional().catch(null),
  sprintMetrics: laivelUpSprintMetricsInputSchema.nullable().optional().catch(null),
  aiContext: laivelUpAiContextInputSchema.nullable().optional().catch(null),
  declaratif: z.string().nullable().optional().catch(null),
  session: z.string().nullable().optional().catch(null),
  deliveryConfidence: laivelUpDeliveryConfidenceInputSchema.nullable().optional().catch(null),
});

export class ZodProfileParser implements IProfileParser {
  parse(raw: unknown): ReturnType<IProfileParser['parse']> {
    const strictResult = laivelUpProfileInputSchema.safeParse(raw);

    if (!strictResult.success) {
      const issues = strictResult.error.issues;
      const hasBlockingError = issues.some((issue) => BLOCKING_FIELDS.has(issue.path[0] as string));

      if (hasBlockingError) {
        const blockingFields = [
          ...new Set(
            issues
              .filter((issue) => BLOCKING_FIELDS.has(issue.path[0] as string))
              .map((issue) => issue.path[0] as string),
          ),
        ];
        return err(new ParseError(strictResult.error.message, blockingFields));
      }

      const formatWarnings: FormatWarning[] = issues.map((issue) => ({
        field: issue.path.join('.'),
        reason: issue.message,
      }));

      const permissiveResult = permissiveSchema.safeParse(raw);
      if (!permissiveResult.success) {
        const blockingFields = [
          ...new Set(
            permissiveResult.error.issues
              .filter((issue) => BLOCKING_FIELDS.has(issue.path[0] as string))
              .map((issue) => issue.path[0] as string),
          ),
        ];
        return err(new ParseError(permissiveResult.error.message, blockingFields));
      }

      return ok<ProfileParseResult>({
        profile: DeveloperProfileMapper.toDomain(permissiveResult.data),
        formatWarnings,
      });
    }

    return ok<ProfileParseResult>({
      profile: DeveloperProfileMapper.toDomain(strictResult.data),
      formatWarnings: [],
    });
  }
}
