'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { MissingDataGroupViewModel } from '@laivel-up/core';

interface MissingDataSummaryProps {
  groups?: MissingDataGroupViewModel[];
  profileId: string;
}

export function MissingDataSummary({ groups = [], profileId }: MissingDataSummaryProps) {
  const [selectedKind, setSelectedKind] = useState<'impacting' | 'contextual'>('impacting');
  const impactingCount = groups.reduce((count, group) => count + group.impactingFields.length, 0);
  const ignoredCount = groups.reduce((count, group) => count + group.ignoredFields.length, 0);
  if (impactingCount === 0 && ignoredCount === 0) return null;

  return (
    <section
      aria-labelledby="missing-data-title"
      className="rounded-[28px] bg-stone-950 p-7 text-white"
    >
      <div className="flex items-end justify-between gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
            Couverture des données
          </p>
          <h2 id="missing-data-title" className="mt-2 text-3xl font-semibold tracking-tight">
            Données non collectées
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Les absences sont regroupées par axe pour identifier rapidement les zones incomplètes.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-bold" aria-label="Type de données manquantes">
          <button
            type="button"
            aria-pressed={selectedKind === 'impacting'}
            onClick={() => setSelectedKind('impacting')}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              selectedKind === 'impacting'
                ? 'bg-orange-400 text-stone-950'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
            }`}
          >
            {impactingCount} impactantes
          </button>
          <button
            type="button"
            aria-pressed={selectedKind === 'contextual'}
            onClick={() => setSelectedKind('contextual')}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              selectedKind === 'contextual'
                ? 'bg-stone-200 text-stone-950'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
            }`}
          >
            {ignoredCount} contextuelles
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {groups.map((group) => {
          const selectedFields =
            selectedKind === 'impacting' ? group.impactingFields : group.ignoredFields;
          if (selectedFields.length === 0) return null;

          const visibleFields = selectedFields.slice(0, 3);
          const remainingCount = selectedFields.length - visibleFields.length;

          return (
            <article
              key={group.axis}
              className="flex min-h-[210px] flex-col rounded-2xl bg-stone-900 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{group.label}</h3>
                <span className="rounded-full bg-stone-800 px-2.5 py-1 text-xs font-black text-stone-300">
                  {selectedFields.length}
                </span>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-stone-300">
                {visibleFields.map((field) => (
                  <li key={field.path} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-600" />
                    <span className="truncate">{field.label}</span>
                  </li>
                ))}
                {remainingCount > 0 && (
                  <li className="pl-3.5 text-xs font-semibold text-stone-500">
                    + {remainingCount} autre{remainingCount > 1 ? 's' : ''}
                  </li>
                )}
              </ul>

              {group.axis === 'profile' ? (
                <p className="mt-auto pt-5 text-xs text-stone-500">Informations contextuelles</p>
              ) : (
                <Link
                  href={`/aidd/${encodeURIComponent(profileId)}/${group.axis}`}
                  className="mt-auto flex items-center justify-between border-t border-stone-800 pt-4 text-xs font-bold text-lime-300 hover:text-lime-200"
                >
                  <span>Voir le détail de l’axe</span>
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
