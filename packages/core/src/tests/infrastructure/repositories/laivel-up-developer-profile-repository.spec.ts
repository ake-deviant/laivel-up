import * as path from 'path';
import { ParseError } from '../../../domain/errors/parse.error';
import { ZodProfileParser } from '../../../infrastructure/parsers/zod-profile-parser';
import { LaivelUpDeveloperProfileRepository } from '../../../infrastructure/repositories/laivel-up-developer-profile-repository';

const PROFILES_DIR = path.resolve(process.cwd(), process.env.PROFILES_BASE_DIR!);
const parser = new ZodProfileParser();

describe('LaivelUpDeveloperProfileRepository', () => {
  const repo = new LaivelUpDeveloperProfileRepository(parser, PROFILES_DIR);

  describe('findById', () => {
    it('should return a DeveloperProfile for arthur', () => {
      expect(repo.findById('arthur').isOk).toBe(true);
    });

    it('should return a DeveloperProfile for bohort', () => {
      expect(repo.findById('bohort').isOk).toBe(true);
    });

    it('should return a DeveloperProfile for perceval', () => {
      expect(repo.findById('perceval').isOk).toBe(true);
    });

    it('should return a ParseError when profile.json has a blocking field missing', () => {
      const result = repo.findById('invalid-profile');
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toContain('profile_id');
      }
    });

    it('should throw when the profile directory does not exist', () => {
      expect(() => repo.findById('non-existent')).toThrow();
    });
  });
});
