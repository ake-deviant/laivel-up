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
  signals: SignalViewModel[];
  fieldGroups: AxisFieldGroupViewModel[];
}

export interface ImprovementViewModel {
  axis: ImprovementAxis;
  type: string;
  targetLevel?: AiddLevelValue;
}

export interface DeveloperProfileResultViewModel {
  overallLevel: LevelViewModel;
  axes: AxisViewModel[];
  improvements: ImprovementViewModel[];
  busImprovements: ImprovementViewModel[];
}
