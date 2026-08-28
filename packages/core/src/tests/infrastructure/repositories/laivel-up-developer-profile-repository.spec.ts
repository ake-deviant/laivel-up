import * as path from 'path';
import { ParseError } from '../../../domain/errors/parse.error';
import { ZodProfileParser } from '../../../infrastructure/parsers/zod-profile-parser';
import { LaivelUpDeveloperProfileRepository } from '../../../infrastructure/repositories/laivel-up-developer-profile-repository';

const PROFILES_DIR = path.resolve(__dirname, '../../fixtures/profiles');
const parser = new ZodProfileParser();

describe('LaivelUpDeveloperProfileRepository', () => {
  const repo = new LaivelUpDeveloperProfileRepository(parser);

  describe('findByPath', () => {
    it('should return a DeveloperProfile for arthur', () => {
      const result = repo.findByPath(path.join(PROFILES_DIR, 'arthur'));
      expect(result.isOk).toBe(true);
    });

    it('should return a DeveloperProfile for bohort', () => {
      const result = repo.findByPath(path.join(PROFILES_DIR, 'bohort'));
      expect(result.isOk).toBe(true);
    });

    it('should return a DeveloperProfile for perceval', () => {
      const result = repo.findByPath(path.join(PROFILES_DIR, 'perceval'));
      expect(result.isOk).toBe(true);
    });

    it('should return a ParseError when profile.json has blocking field missing', () => {
      const result = repo.findByPath(path.join(PROFILES_DIR, 'invalid-profile'));
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toContain('profile_id');
      }
    });

    it('should throw when the directory does not exist', () => {
      expect(() => repo.findByPath(path.join(PROFILES_DIR, 'non-existent'))).toThrow();
    });
  });
});
