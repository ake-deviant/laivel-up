import { z } from 'zod';
import { ok, err } from '../../domain/shared/result';
import { ParseError } from '../../domain/errors/parse.error';
import { IProfileParser } from '../../application/ports/profile-parser.port';

const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
});

export class ZodProfileParser implements IProfileParser {
  parse(raw: unknown) {
    const result = profileSchema.safeParse(raw);
    if (!result.success) return err(new ParseError(result.error.message));
    return ok(result.data);
  }
}
