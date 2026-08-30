'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type {
  AxisViewModel,
  DeveloperProfileResultViewModel,
  ImprovementViewModel,
} from '@laivel-up/core';
import { AxisFieldGroups } from './axis-field-groups';
import { getLevelPresentation } from './aidd-level';
import { LevelScale } from './level-scale';
import { ImprovementCard } from './improvement-card';
import { LevelMedal } from './level-medal';

interface AxisDetailProps {
  profileId: string;
  axisName: AxisViewModel['axis'];
}

export function AxisDetail({ profileId, axisName }: AxisDetailProps) {
  const [axis, setAxis] = useState<AxisViewModel | null>(null);
  const [improvements, setImprovements] = useState<ImprovementViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAxis() {
      try {
        const response = await fetch(`/api/evaluate/${encodeURIComponent(profileId)}`);
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            typeof payload === 'object' && payload !== null && 'error' in payload
              ? String(payload.error)
              : 'Le profil ne peut pas être évalué.';
          throw new Error(message);
        }

        const result = payload as DeveloperProfileResultViewModel;
        const selectedAxis = result.axes.find((candidate) => candidate.axis === axisName);
        if (!selectedAxis) throw new Error("Cet axe n'existe pas dans l'évaluation.");
        if (isActive) {
          setAxis(selectedAxis);
          setImprovements(
            [...result.improvements, ...result.busImprovements].filter(
              (improvement) => improvement.axis === axisName,
            ),
          );
        }
      } catch (reason) {
        if (isActive) {
          setError(reason instanceof Error ? reason.message : 'Le détail ne peut pas être chargé.');
        }
      }
    }

    void loadAxis();
    return () => {
      isActive = false;
    };
  }, [axisName, profileId]);

  const presentation = axis ? getLevelPresentation(axis.level) : null;

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-stone-950">
      <header className="border-b border-stone-200 bg-[#fbfaf7]">
        <div className="mx-auto flex w-[980px] items-center justify-between py-5">
          <Link
            href={`/aidd?profile=${encodeURIComponent(profileId)}`}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-sm font-black text-lime-300">
              LU
            </span>
            <span className="text-sm font-bold">Laivel Up</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Détail de l’axe
          </span>
        </div>
      </header>

      <div className="mx-auto w-[980px] py-10">
        <Link
          href={`/aidd?profile=${encodeURIComponent(profileId)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-950"
        >
          <span aria-hidden="true">←</span>
          Retour au résumé global
        </Link>

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
          >
            {error}
          </div>
        )}

        {!axis && !error && (
          <div className="mt-8 rounded-[28px] border border-stone-200 bg-white p-8 text-stone-500">
            Chargement des données de l’axe…
          </div>
        )}

        {axis && presentation && (
          <div className="mt-8 space-y-9">
            <section className="grid grid-cols-[1fr_260px] overflow-hidden rounded-[32px] bg-stone-950 text-white">
              <div className="p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                  Profil {profileId} · {axis.axis}
                </p>
                <div className="mt-4 flex items-baseline gap-4">
                  <h1 className="text-5xl font-semibold tracking-tight">{axis.label}</h1>
                  <LevelMedal level={axis.level} />
                </div>
                <div className="mt-8 max-w-xl">
                  <LevelScale level={axis.level} />
                </div>
              </div>
              <div className={`${presentation.background} flex items-end p-7 text-stone-950`}>
                <p className="text-xl font-semibold leading-snug">
                  Toutes les données observées qui expliquent cet axe.
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-[#fbfaf7] p-7">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-700">
                    Progression
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Améliorations de l’axe
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Les signaux à faire progresser pour atteindre le niveau suivant.
                  </p>
                </div>
                <span className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-bold text-white">
                  {improvements.length} piste{improvements.length > 1 ? 's' : ''}
                </span>
              </div>

              {improvements.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {improvements.map((improvement, index) => (
                    <ImprovementCard
                      key={`${improvement.axis}-${improvement.type}-${index}`}
                      improvement={improvement}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm text-stone-500">
                  Aucune amélioration n’est remontée pour cet axe.
                </p>
              )}
            </section>

            <AxisFieldGroups groups={axis.fieldGroups} />
          </div>
        )}
      </div>
    </main>
  );
}
