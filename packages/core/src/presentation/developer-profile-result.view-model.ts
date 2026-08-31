import { AiddLevelValue } from '../domain/entities/aidd-level-value';
import { ImprovementAxis } from '../domain/entities/improvement';

export interface LevelViewModel {
  value: AiddLevelValue;
  label: string;
  rank: number;
}

export interface SignalViewModel {
  name: string;
  label: string;
  validated: boolean;
  value: number | boolean | null;
}

export interface AxisFieldViewModel {
  name: string;
  label: string;
  description: string;
  value: number | boolean | null;
}

export interface AxisFieldGroupViewModel {
  name: string;
  label: string;
  fields: AxisFieldViewModel[];
}

export interface AxisViewModel {
  axis: ImprovementAxis;
  label: string;
  level: LevelViewModel;
  calculable: boolean;
  signals: SignalViewModel[];
  fieldGroups: AxisFieldGroupViewModel[];
}

export interface ImprovementViewModel {
  axis: ImprovementAxis;
  type: string;
  label: string;
  description: string;
  targetLevel?: AiddLevelValue;
}

export interface ImprovementOpportunityViewModel {
  axis: 'harness' | 'size' | 'intervention' | 'parallelism' | 'velocity' | 'deliveryConfidence';
  field: string;
  currentLevel: LevelViewModel;
  resultingLevel: LevelViewModel;
  levelGain: number;
  scoreDelta: number;
  effort: 'low' | 'medium' | 'high';
  fieldsToChange: number;
  overallResultingLevel: LevelViewModel;
  overallLevelGain: number;
}

export interface FormatWarningViewModel {
  field: string;
  reason: string;
}

export interface AxisReadinessViewModel {
  calculable: boolean;
  missingEssential: string[];
  missingImpacting: string[];
}

export type MissingDataAxisViewModel = 'profile' | ImprovementAxis;

export interface MissingDataFieldViewModel {
  path: string;
  label: string;
  description: string;
}

export interface MissingDataGroupViewModel {
  axis: MissingDataAxisViewModel;
  label: string;
  impactingFields: MissingDataFieldViewModel[];
  ignoredFields: MissingDataFieldViewModel[];
}

export interface DeveloperProfileResultViewModel {
  overallLevel: LevelViewModel;
  axes: AxisViewModel[];
  improvements: ImprovementViewModel[];
  busImprovements: ImprovementViewModel[];
  formatWarnings: FormatWarningViewModel[];
  missingDataGroups: MissingDataGroupViewModel[];
  improvementOpportunities: ImprovementOpportunityViewModel[];
}
