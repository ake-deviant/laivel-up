import type { LevelViewModel } from '@laivel-up/core';

export const LEVELS = ['white', 'red', 'blue', 'green', 'copper', 'silver', 'gold'] as const;

export type LevelValue = (typeof LEVELS)[number];

export const LEVEL_PRESENTATION: Record<
  LevelValue,
  { accent: string; background: string; border: string; text: string; description: string }
> = {
  white: {
    accent: 'bg-white ring-1 ring-inset ring-stone-400',
    background: 'bg-white',
    border: 'border-stone-400',
    text: 'text-stone-700',
    description: 'Les premiers usages restent à observer.',
  },
  red: {
    accent: 'bg-rose-500',
    background: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    description: 'L’IA intervient sur des tâches ciblées.',
  },
  blue: {
    accent: 'bg-blue-500',
    background: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    description: 'Le contexte devient structuré et réutilisable.',
  },
  green: {
    accent: 'bg-emerald-500',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    description: 'Des travaux plus larges sont confiés à l’IA.',
  },
  copper: {
    accent: 'bg-orange-500',
    background: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    description: 'Plusieurs travaux peuvent progresser en parallèle.',
  },
  silver: {
    accent: 'bg-slate-500',
    background: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-700',
    description: 'Les boucles de réalisation deviennent autonomes.',
  },
  gold: {
    accent: 'bg-amber-400',
    background: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    description: 'Le cadrage et l’exécution sont pilotés avec l’IA.',
  },
};

export function getLevelPresentation(level: LevelViewModel) {
  return LEVEL_PRESENTATION[level.value];
}
