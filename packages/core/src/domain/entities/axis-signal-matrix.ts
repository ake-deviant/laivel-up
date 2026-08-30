import { AiddLevelValue } from './aidd-level-value';
import { ImprovementAxis } from './improvement';
import { Signal } from './signal';

export interface AxisSignalMatrix {
  axis: ImprovementAxis;
  currentLevel: AiddLevelValue;
  nextLevel: AiddLevelValue | null;
  signals: Signal[];
}
