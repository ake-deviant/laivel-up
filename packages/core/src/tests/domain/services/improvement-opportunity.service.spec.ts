import { AiddLevelValue } from '../../../domain/entities/aidd-level-value';
import { DeveloperProfileMapper } from '../../../infrastructure/mappers/developer-profile-mapper';
import { createHarnessLevelCalculator } from '../../../domain/services/harness-level-calculator.service';
import { defaultHarnessThresholdsConfig } from '../../../domain/services/harness-thresholds.config';
import { SizeLevelCalculatorService } from '../../../domain/services/size-level-calculator.service';
import { defaultSizeThresholdsConfig } from '../../../domain/services/size-thresholds.config';
import { createInterventionLevelCalculator } from '../../../domain/services/intervention-level-calculator.service';
import { defaultInterventionThresholdsConfig } from '../../../domain/services/intervention-thresholds.config';
import { createWeightedParallelismLevelCalculator } from '../../../domain/services/parallelism-level-calculator.service';
import { defaultParallelismThresholdsConfig } from '../../../domain/services/parallelism-thresholds.config';
import { createVelocityLevelCalculator } from '../../../domain/services/velocity-level-calculator.service';
import { VelocityReadinessChecker } from '../../../domain/services/velocity-readiness-checker';
import { defaultVelocityThresholdsConfig } from '../../../domain/services/velocity-thresholds.config';

import { SizeImprovementOpportunityDetector } from '../../../domain/services/size-improvement-opportunity-detector';
import { InterventionImprovementOpportunityDetector } from '../../../domain/services/intervention-improvement-opportunity-detector';
import { ParallelismImprovementOpportunityDetector } from '../../../domain/services/parallelism-improvement-opportunity-detector';
import { VelocityImprovementOpportunityDetector } from '../../../domain/services/velocity-improvement-opportunity-detector';
import { ImprovementOpportunityService } from '../../../domain/services/improvement-opportunity.service';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';

function makeService() {
  const sizeCalculator = new SizeLevelCalculatorService(defaultSizeThresholdsConfig);
  const interventionCalculator = createInterventionLevelCalculator(
    defaultInterventionThresholdsConfig,
  );
  return new ImprovementOpportunityService(
    createHarnessLevelCalculator(defaultHarnessThresholdsConfig),
    sizeCalculator,
    interventionCalculator,
    createWeightedParallelismLevelCalculator(defaultParallelismThresholdsConfig),
    new SizeImprovementOpportunityDetector(sizeCalculator, defaultSizeThresholdsConfig),
    new InterventionImprovementOpportunityDetector(
      interventionCalculator,
      defaultInterventionThresholdsConfig,
    ),
    new ParallelismImprovementOpportunityDetector(
      createWeightedParallelismLevelCalculator(defaultParallelismThresholdsConfig),
      defaultParallelismThresholdsConfig,
    ),
    new VelocityImprovementOpportunityDetector(
      createVelocityLevelCalculator(defaultVelocityThresholdsConfig),
      defaultVelocityThresholdsConfig,
    ),
    createVelocityLevelCalculator(defaultVelocityThresholdsConfig),
    new VelocityReadinessChecker(),
  );
}

describe('ImprovementOpportunityService', () => {
  describe('when Arthur is red on harness — harness axis opportunities', () => {
    // Arthur: harness=red (no memory), size=silver, intervention=copper, parallelism=gold → overall=red
    const profile = DeveloperProfileMapper.toDomain(LaivelUpDeveloperProfileInputFixture.arthur());
    const service = makeService();
    const opportunities = service.detect(profile);

    it('ranks memoryCount as the top opportunity', () => {
      // arrange / act — done above

      // assert
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

    it('when memoryCount brings harness to copper — overall goes from red to copper', () => {
      // arrange / act — done above
      // Arthur overall=red, after harness→copper: lowestLevel(silver,copper,copper,gold)=copper

      // assert
      expect(opportunities[0].overallResultingLevel).toBe(AiddLevelValue.copper);
      expect(opportunities[0].overallLevelGain).toBe(3);
    });

    it('does not surface size xlRatio — improving size to gold leaves overall at red (harness still red)', () => {
      // arrange / act — done above
      // size improvement: silver→gold but overall stays red (harness=red is the bottleneck)

      // assert
      const sizeOpportunity = opportunities.find((o) => o.field === 'xlRatio');
      expect(sizeOpportunity?.overallLevelGain).toBe(0);
    });
  });
});
