import { DataSource } from '../../domain/entities/data-source';
import { DeveloperProfileSummary } from '../../domain/entities/developer-profile-summary';
import { LaivelUpProfileSummaryInput } from '../inputs/laivel-up-profile-summary-input';

const AVAILABLE_TO_DATA_SOURCE: Partial<Record<string, DataSource>> = {
  'git-activity.json': DataSource.gitActivity,
  'pull-requests.json': DataSource.pullRequests,
  'sonar-measures.json': DataSource.sonar,
  'repo-context/': DataSource.repoContext,
  'sprint-metrics.json': DataSource.sprintMetrics,
  'declaratif.md': DataSource.declarative,
  'session.md': DataSource.session,
  'code/': DataSource.code,
};

export class DeveloperProfileSummaryMapper {
  static toDomain(input: LaivelUpProfileSummaryInput): DeveloperProfileSummary {
    return {
      id: input.profile_id,
      role: input.role ?? null,
      experienceYears: input.experience_years ?? null,
      stack: input.stack ?? null,
      teamSize: input.team_size ?? null,
      note: input.note ?? null,
      availableSources: input.available
        .map((s) => AVAILABLE_TO_DATA_SOURCE[s])
        .filter((s): s is DataSource => s !== undefined),
    };
  }
}
