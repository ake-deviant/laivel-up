import { z } from 'zod';
import { ok, err } from '../../domain/shared/result';
import { ParseError } from '../../domain/errors/parse.error';
import { IProfileParser } from '../../application/ports/profile-parser.port';
import { DeveloperProfileMapper } from '../mappers/developer-profile.mapper';

const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
});

export type DeveloperProfileInput = z.infer<typeof profileSchema>;

export class ZodProfileParser implements IProfileParser {
  parse(raw: unknown) {
    const result = profileSchema.safeParse(raw);
    if (!result.success) return err(new ParseError(result.error.message));
    return ok(DeveloperProfileMapper.toDomain(result.data));
  }
}
