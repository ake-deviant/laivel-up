import { Improvement } from '../entities/improvement';
import { ILevelImprovementBus, LevelImprovementEvent } from '../ports/level-improvement-bus.port';

export class ImprovementCollector implements ILevelImprovementBus {
  private readonly _improvements: Improvement[] = [];

  emit(event: LevelImprovementEvent): void {
    this._improvements.push({ axis: event.axis, type: event.type });
  }

  get improvements(): Improvement[] {
    return [...this._improvements];
  }
}
