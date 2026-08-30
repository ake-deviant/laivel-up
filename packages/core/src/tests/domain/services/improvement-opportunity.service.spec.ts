import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeveloperProfileMapper } from '../../../infrastructure/mappers/developer-profile-mapper';
import { createHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { defaultHarnessThresholdsConfig } from '../../../domain/services/harness-thresholds.config';
import { ImprovementOpportunityService } from '../../../domain/services/improvement-opportunity.service';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';

describe('ImprovementOpportunityService', () => {
  it('when Arthur is red on harness — ranks a single memory field addition as the best opportunity', () => {
    const profile = DeveloperProfileMapper.toDomain(LaivelUpDeveloperProfileInputFixture.arthur());
    const service = new ImprovementOpportunityService(
      createHarnessLevelCalculator(defaultHarnessThresholdsConfig),
    );

    const opportunities = service.detect(profile);

    expect(opportunities[0]).toMatchObject({
      axis: 'harness',
      field: 'memoryCount',
      currentLevel: AiddLevelValue.red,
      resultingLevel: AiddLevelValue.copper,
      levelGain: 3,
      scoreDelta: 4,
      fieldsToChange: 1,
    });
  });
});
