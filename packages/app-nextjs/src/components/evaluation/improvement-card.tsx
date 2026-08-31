import type { ImprovementViewModel } from '@laivel-up/core';

export function ImprovementCard({ improvement }: { improvement: ImprovementViewModel }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-100 text-lg text-lime-800">
        ↗
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
          {improvement.axis}
        </p>
        <p className="mt-1 text-sm font-semibold text-stone-800">{improvement.label}</p>
        <p className="mt-1 text-xs leading-5 text-stone-500">{improvement.description}</p>
      </div>
      {improvement.targetLevel && (
        <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
          Objectif {improvement.targetLevel}
        </span>
      )}
    </li>
  );
}
