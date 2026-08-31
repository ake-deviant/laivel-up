import type { HarnessAlgorithm, ParallelismAlgorithm } from '../types/evaluation-config';

export interface AlgorithmOption<TId extends string> {
  id: TId;
  label: string;
  description: string;
  formula: string;
}

export const PARALLELISM_ALGORITHMS: AlgorithmOption<ParallelismAlgorithm>[] = [
  {
    id: 'weighted',
    label: 'Pondéré',
    description: "La médiane reflète l'usage habituel et le maximum ajoute un signal secondaire.",
    formula: 'médiane × poids + maximum × poids',
  },
  {
    id: 'median-only',
    label: 'Médiane uniquement',
    description: "Seule la pratique habituelle compte. Les pics isolés n'influencent pas le level.",
    formula: 'médiane × poids',
  },
];

export const HARNESS_ALGORITHMS: AlgorithmOption<HarnessAlgorithm>[] = [
  {
    id: 'weighted-score',
    label: 'Scores cumulés',
    description: 'Les fichiers et capacités ajoutent des points jusqu’aux seuils de chaque level.',
    formula: 'context engineering score → AI configuration score → CI',
  },
  {
    id: 'capability-gates',
    label: 'Capacités obligatoires',
    description:
      'Chaque level exige une chaîne complète. Un signal absent ne peut pas être compensé.',
    formula: 'CLAUDE.md + contexte → AGENTS.md + configuration → CI',
  },
];
