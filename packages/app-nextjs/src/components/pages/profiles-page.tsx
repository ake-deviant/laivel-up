'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type {
  AxisViewModel,
  DeveloperProfileResultViewModel,
  DeveloperProfileSummary,
  LevelViewModel,
} from '@laivel-up/core';
import { useEvaluatorConfig } from '../../hooks/use-evaluator-config';
import { getLevelPresentation } from '../evaluation/aidd-level';
import { AppShell } from '../ui/app-shell';
import { FeedbackState } from '../ui/feedback-state';
import { PageHeader } from '../ui/page-header';

const AXES: Array<{ name: AxisViewModel['axis']; label: string }> = [
  { name: 'size', label: 'Taille' },
  { name: 'harness', label: 'Harnais' },
  { name: 'intervention', label: 'Intervention' },
  { name: 'parallelism', label: 'Parallélisme' },
  { name: 'velocity', label: 'Vélocité' },
];

interface ProfileRow {
  profile: DeveloperProfileSummary;
  result: DeveloperProfileResultViewModel | null;
  error: string | null;
}

function LevelBadge({ level }: { level: LevelViewModel }) {
  const presentation = getLevelPresentation(level);
  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold ${presentation.background} ${presentation.border} ${presentation.text}`}
    >
      {level.label}
    </span>
  );
}

async function evaluateProfile(
  profile: DeveloperProfileSummary,
  config: ReturnType<typeof useEvaluatorConfig>['config'],
): Promise<ProfileRow> {
  try {
    const response = await fetch(`/api/evaluate/${encodeURIComponent(profile.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const payload: unknown = await response.json();
    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload !== null && 'error' in payload
          ? String(payload.error)
          : 'Evaluation impossible';
      return { profile, result: null, error: message };
    }
    return { profile, result: payload as DeveloperProfileResultViewModel, error: null };
  } catch {
    return { profile, result: null, error: 'Service indisponible' };
  }
}

export function ProfilesTable() {
  const { config, isReady } = useEvaluatorConfig();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfiles() {
      if (!isReady) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/profiles');
        if (!response.ok) throw new Error('La liste des profils ne peut pas être chargée.');
        const profiles = (await response.json()) as DeveloperProfileSummary[];
        const evaluatedRows = await Promise.all(
          profiles.map((profile) => evaluateProfile(profile, config)),
        );
        if (active) setRows(evaluatedRows);
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'La liste des profils est indisponible.',
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadProfiles();
    return () => {
      active = false;
    };
  }, [config, isReady]);

  return (
    <AppShell evaluationHref="/" profilesHref="/profiles" configHref="/config">
      <PageHeader
        eyebrow="Profils"
        title="Levels atteints"
        description="Vue d'ensemble des levels calculés avec la configuration actuellement enregistrée."
        actions={
          !isLoading && rows.length > 0 ? (
            <span className="inline-flex min-h-10 items-center rounded-full border border-border bg-white px-4 text-xs font-bold text-text-muted">
              {rows.length} profil{rows.length > 1 ? 's' : ''}
            </span>
          ) : undefined
        }
      />

      <div className="mt-8">
        {isLoading && (
          <FeedbackState
            title="Evaluation des profils"
            description="Les levels sont calculés avec la configuration active."
          />
        )}

        {error && <FeedbackState tone="error" title="Chargement impossible" description={error} />}

        {!isLoading && !error && rows.length === 0 && (
          <FeedbackState
            title="Aucun profil disponible"
            description="La source de profils ne contient aucune entrée."
          />
        )}

        {!isLoading && !error && rows.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <caption className="sr-only">
                  Levels global et par axe pour chaque profil disponible
                </caption>
                <thead className="border-b border-border bg-primary text-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-4 text-xs font-bold uppercase tracking-wider"
                    >
                      Profil
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider"
                    >
                      Global
                    </th>
                    {AXES.map((axis) => (
                      <th
                        key={axis.name}
                        scope="col"
                        className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider"
                      >
                        {axis.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ profile, result, error: rowError }) => (
                    <tr key={profile.id} className="transition-colors hover:bg-surface-muted">
                      <th scope="row" className="px-5 py-4">
                        <span className="font-semibold text-primary">{profile.id}</span>
                        {profile.role && (
                          <span className="mt-1 block text-xs font-normal text-text-muted">
                            {profile.role}
                          </span>
                        )}
                      </th>
                      {result ? (
                        <>
                          <td className="px-4 py-4 text-center">
                            <LevelBadge level={result.overallLevel} />
                          </td>
                          {AXES.map((axisDefinition) => {
                            const axis = result.axes.find(
                              (candidate) => candidate.axis === axisDefinition.name,
                            );
                            return (
                              <td key={axisDefinition.name} className="px-4 py-4 text-center">
                                {axis ? (
                                  <Link
                                    href={`/${encodeURIComponent(profile.id)}/${axis.axis}`}
                                    aria-label={`${profile.id}, ${axis.label}, level ${axis.level.label}`}
                                  >
                                    <LevelBadge level={axis.level} />
                                  </Link>
                                ) : (
                                  <span className="text-sm text-text-muted">—</span>
                                )}
                              </td>
                            );
                          })}
                        </>
                      ) : (
                        <td colSpan={6} className="px-4 py-4 text-sm text-rose-700">
                          {rowError ?? 'Evaluation impossible'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
