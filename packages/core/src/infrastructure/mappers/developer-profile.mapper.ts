import { DeveloperProfile } from '../../domain/entities/developer-profile';
import { DeveloperProfileInput } from '../parsers/zod-profile-parser';

export class DeveloperProfileMapper {
  static toDomain(input: DeveloperProfileInput): DeveloperProfile {
    return {
      id: input.id,
      name: input.name,
    };
  }
}
