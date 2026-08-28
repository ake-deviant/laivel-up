import { ParseError } from '../../../domain/errors/parse.error';
import { ZodProfileParser } from '../../../infrastructure/parsers/zod-profile-parser';
import { DeveloperProfileFixture } from '../../fixtures/developer-profile.fixture';

const parser = new ZodProfileParser();

describe('ZodProfileParser', () => {
  it('should parse a valid profile', () => {
    const result = parser.parse(DeveloperProfileFixture.valid());
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toEqual(DeveloperProfileFixture.valid());
    }
  });

  it('should accept name as null', () => {
    const result = parser.parse(DeveloperProfileFixture.withoutName());
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.name).toBeNull();
    }
  });

  it('should return ParseError when id is missing', () => {
    const result = parser.parse({ name: 'Alice' });
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(ParseError);
    }
  });

  it('should return ParseError on empty object', () => {
    const result = parser.parse({});
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toBeInstanceOf(ParseError);
    }
  });
});
