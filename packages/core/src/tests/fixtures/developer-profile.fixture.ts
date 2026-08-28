import { DeveloperProfile } from '../../domain/entities/developer-profile';

export class DeveloperProfileFixture {
  static valid(): DeveloperProfile {
    return { id: '1', name: 'Alice' };
  }

  static withoutName(): DeveloperProfile {
    return { id: '1', name: null };
  }

  static withoutId(): DeveloperProfile {
    return { id: '', name: 'Alice' };
  }

  static withoutIdAndName(): DeveloperProfile {
    return { id: '', name: null };
  }
}
