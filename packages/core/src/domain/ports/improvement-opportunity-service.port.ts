import { DeveloperProfile } from '../entities/developer-profile';
import { ImprovementOpportunity } from '../services/improvement-opportunity.service';

export interface IImprovementOpportunityService {
  detect(profile: DeveloperProfile): ImprovementOpportunity[];
}

export interface IAxisImprovementOpportunityDetector<TProfile> {
  detect(profile: TProfile): ImprovementOpportunity[];
}
