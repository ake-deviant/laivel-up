import { DataSource } from './data-source';

export interface DeveloperProfileSummary {
  id: string;
  role: string | null;
  experienceYears: number | null;
  stack: string[] | null;
  teamSize: number | null;
  note: string | null;
  availableSources: DataSource[];
}
