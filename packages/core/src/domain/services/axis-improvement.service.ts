import { Improvement } from '../entities/improvement';
import { AxisSignalMatrix } from '../entities/axis-signal-matrix';

export class AxisImprovementService {
  derive(matrices: AxisSignalMatrix[]): Improvement[] {
    return matrices.flatMap((matrix) => {
      if (matrix.nextLevel === null) return [];
      return matrix.signals
        .filter((signal) => !signal.validated)
        .map((signal) => ({
          axis: matrix.axis,
          type: signal.name,
          targetLevel: matrix.nextLevel!,
        }));
    });
  }
}
