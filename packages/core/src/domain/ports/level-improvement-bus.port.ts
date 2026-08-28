import { ImprovementAxis } from '../entities/improvement';

export interface LevelImprovementEvent {
  type: string;
  axis: ImprovementAxis;
}

export interface ILevelImprovementBus {
  emit(event: LevelImprovementEvent): void;
}

export const noopLevelImprovementBus: ILevelImprovementBus = { emit: () => {} };
