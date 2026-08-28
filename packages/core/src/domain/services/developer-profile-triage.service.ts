import { DeveloperProfile } from '../entities/developer-profile';

export interface DeveloperProfileTriageReport {
  blockingIssues: string[];
  impactingNulls: string[];
  ignoredNulls: string[];
}

export class DeveloperProfileTriageService {
  triage(profile: DeveloperProfile): DeveloperProfileTriageReport {
    const blockingIssues: string[] = [];
    const impactingNulls: string[] = [];
    const ignoredNulls: string[] = [];

    if (!profile.id) blockingIssues.push('id');

    return { blockingIssues, impactingNulls, ignoredNulls };
  }
}
