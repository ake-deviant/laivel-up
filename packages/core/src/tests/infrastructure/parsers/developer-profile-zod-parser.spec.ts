import * as fs from 'fs';
import * as path from 'path';
import { ParseError } from '../../../domain/errors/parse.error';
import { ZodProfileParser } from '../../../infrastructure/parsers/zod-profile-parser';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';
import { createEmptyDeliveryConfidenceProfile } from '../../../domain/entities/delivery-confidence-profile';

const parser = new ZodProfileParser();

const SCENARIOS_DIR = path.resolve(__dirname, '../../fixtures/scenarios');

function loadScenario(category: 'valid' | 'invalid', name: string) {
  const dir = path.join(SCENARIOS_DIR, category, name);
  const input = JSON.parse(fs.readFileSync(path.join(dir, 'input.json'), 'utf-8'));
  const outputPath = path.join(dir, 'output.json');
  const output = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    : null;
  return { input, output };
}

function withDeliveryConfidence(output: { profile: object }) {
  return {
    ...output,
    profile: { ...output.profile, deliveryConfidence: createEmptyDeliveryConfidenceProfile() },
  };
}

describe('ZodProfileParser', () => {
  describe('scenarios — valid', () => {
    it('all-nullable-null: all nullable fields set to null', () => {
      const { input, output } = loadScenario('valid', 'all-nullable-null');
      const result = parser.parse(input);
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value).toEqual(withDeliveryConfidence(output));
    });

    it('non-blocking-wrong-type: wrong type on a non-blocking field produces a format warning', () => {
      const { input, output } = loadScenario('valid', 'non-blocking-wrong-type');
      const result = parser.parse(input);
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value).toEqual(withDeliveryConfidence(output));
    });
  });

  describe('valid inputs', () => {
    it('should parse a complete profile', () => {
      const result = parser.parse(LaivelUpDeveloperProfileInputFixture.bohort());
      expect(result.isOk).toBe(true);
    });

    it('should parse a profile without pull-requests', () => {
      const result = parser.parse(LaivelUpDeveloperProfileInputFixture.arthur());
      expect(result.isOk).toBe(true);
    });

    it('should parse a profile without ai-context', () => {
      const result = parser.parse(LaivelUpDeveloperProfileInputFixture.perceval());
      expect(result.isOk).toBe(true);
    });

    it('should accept null for a nullable field', () => {
      const input = { ...LaivelUpDeveloperProfileInputFixture.arthur(), note: null };
      const result = parser.parse(input);
      expect(result.isOk).toBe(true);
    });

    it('should return formatWarning when a non-blocking field has wrong type', () => {
      const result = parser.parse({
        ...LaivelUpDeveloperProfileInputFixture.arthur(),
        experience_years: 'nine',
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.formatWarnings).toHaveLength(1);
        expect(result.value.formatWarnings[0].field).toBe('experience_years');
      }
    });
  });

  describe('scenarios — invalid', () => {
    it('missing-profile-id: should return ParseError with blockingFields', () => {
      const { input, output } = loadScenario('invalid', 'missing-profile-id');
      const result = parser.parse(input);
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toEqual(output.error.blockingFields);
      }
    });

    it('missing-available: should return ParseError with blockingFields', () => {
      const { input, output } = loadScenario('invalid', 'missing-available');
      const result = parser.parse(input);
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toEqual(output.error.blockingFields);
      }
    });

    it('wrong-type-profile-id: should return ParseError with blockingFields', () => {
      const { input, output } = loadScenario('invalid', 'wrong-type-profile-id');
      const result = parser.parse(input);
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toEqual(output.error.blockingFields);
      }
    });

    it('wrong-type-available: should return ParseError with blockingFields', () => {
      const { input, output } = loadScenario('invalid', 'wrong-type-available');
      const result = parser.parse(input);
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(ParseError);
        expect((result.error as ParseError).blockingFields).toEqual(output.error.blockingFields);
      }
    });
  });
});
