'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AxisViewModel, DeveloperProfileResultViewModel } from '@laivel-up/core';
import { AxisFieldGroups } from './axis-field-groups';
import { getLevelPresentation } from './aidd-level';
import { LevelScale } from './level-scale';

interface AxisDetailProps {
  profileId: string;
  axisName: AxisViewModel['axis'];
}

export function AxisDetail({ profileId, axisName }: AxisDetailProps) {
  const [axis, setAxis] = useState<AxisViewModel | null>(null);
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
        if (isActive) setAxis(selectedAxis);
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
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${presentation.background} ${presentation.text}`}
                  >
                    {axis.level.label}
                  </span>
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

            <AxisFieldGroups groups={axis.fieldGroups} />
          </div>
        )}
      </div>
    </main>
  );
}
