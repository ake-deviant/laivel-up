'use client';

import { useEffect, useState } from 'react';
import type {
  AxisViewModel,
  DeveloperProfileResultViewModel,
  ImprovementViewModel,
} from '@laivel-up/core';
import { useEvaluatorConfig } from '../../hooks/use-evaluator-config';
import { getLevelPresentation } from '../evaluation/aidd-level';
import { ImprovementCard } from '../evaluation/improvement-card';
import { LevelMedal } from '../evaluation/level-medal';
import { LevelScale } from '../evaluation/level-scale';
import { AppShell } from '../ui/app-shell';
import { ButtonLink } from '../ui/button';
import { FeedbackState } from '../ui/feedback-state';
import { SectionCard } from '../ui/section-card';

interface AxisPreviewProps {
  profileId: string;
  axisName: AxisViewModel['axis'];
}

function formatFieldValue(name: string, value: number | boolean | null) {
  if (value === null) return 'Non collecté';
  if (typeof value === 'boolean') return value ? 'Présent' : 'Absent';
  if (name.toLowerCase().includes('ratio') || ['xs', 's', 'm', 'l', 'xl'].includes(name)) {
    return `${Math.round(value * 100)} %`;
  }
  if (name === 'claudeMd' || name === 'agentsMd' || name === 'settingsJson') {
    return value === 1 ? 'Présent' : 'Absent';
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

export function AxisPreview({ profileId, axisName }: AxisPreviewProps) {
  const [axis, setAxis] = useState<AxisViewModel | null>(null);
  const [improvements, setImprovements] = useState<ImprovementViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { config, isReady } = useEvaluatorConfig();

  useEffect(() => {
    let active = true;

    async function loadAxis() {
      if (!isReady) return;

      try {
        const response = await fetch(`/api/evaluate/${encodeURIComponent(profileId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });
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

        if (active) {
          setAxis(selectedAxis);
          setImprovements(
            [...result.improvements, ...result.busImprovements].filter(
              (improvement) => improvement.axis === axisName,
            ),
          );
        }
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Le détail ne peut pas être chargé.');
        }
      }
    }

    void loadAxis();
    return () => {
      active = false;
    };
  }, [axisName, config, isReady, profileId]);

  const presentation = axis ? getLevelPresentation(axis.level) : null;
  const evaluationHref = `/?profile=${encodeURIComponent(profileId)}`;

  return (
    <AppShell evaluationHref="/" profilesHref="/profiles" configHref="/config">
      <ButtonLink href={evaluationHref} variant="ghost" className="mb-6 -ml-3">
        ← Retour au résumé global
      </ButtonLink>

      {error && (
        <FeedbackState
          tone="error"
          title="Détail indisponible"
          description={error}
          action={<ButtonLink href={evaluationHref}>Retour à l'évaluation</ButtonLink>}
        />
      )}

      {!axis && !error && (
        <FeedbackState
          title="Chargement de l'axe"
          description="Les données observées et les pistes de progression sont en cours de préparation."
        />
      )}

      {axis && presentation && (
        <div className="space-y-8">
          <section className="grid overflow-hidden rounded-3xl bg-primary text-white lg:grid-cols-[1fr_320px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                Profil {profileId} · {axis.axis}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{axis.label}</h1>
                <LevelMedal level={axis.level} />
              </div>
              <div className="mt-8 max-w-2xl">
                <LevelScale level={axis.level} />
              </div>
            </div>
            <div className={`${presentation.background} flex items-end p-6 text-primary sm:p-8`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${presentation.text}`}>
                  Lecture de l'axe
                </p>
                <p className="mt-4 text-xl font-semibold leading-snug">
                  Les données observées qui expliquent ce level.
                </p>
              </div>
            </div>
          </section>

          <SectionCard
            eyebrow="Progression"
            title="Améliorations de l'axe"
            description="Les signaux à faire progresser pour atteindre le level suivant."
            aside={
              <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
                {improvements.length} piste{improvements.length > 1 ? 's' : ''}
              </span>
            }
          >
            {improvements.length > 0 ? (
              <ul className="grid gap-3 lg:grid-cols-2">
                {improvements.map((improvement, index) => (
                  <ImprovementCard
                    key={`${improvement.axis}-${improvement.type}-${index}`}
                    improvement={improvement}
                  />
                ))}
              </ul>
            ) : (
              <FeedbackState
                title="Aucune piste remontée"
                description="Aucune amélioration n'est disponible pour cet axe."
              />
            )}
          </SectionCard>

          <div className="space-y-6">
            {axis.fieldGroups.map((group) => (
              <SectionCard
                key={group.name}
                title={group.label}
                aside={
                  <span className="text-xs font-semibold text-text-muted">
                    {group.fields.length} donnée{group.fields.length > 1 ? 's' : ''}
                  </span>
                }
                compact
              >
                <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white px-4 sm:px-6">
                  {group.fields.map((field) => (
                    <div
                      key={field.name}
                      className="grid gap-3 py-5 md:grid-cols-[1fr_180px] md:gap-8"
                    >
                      <div>
                        <dt className="font-semibold text-primary">{field.label}</dt>
                        <dd className="mt-1.5 max-w-2xl text-sm leading-6 text-text-muted">
                          {field.description}
                        </dd>
                      </div>
                      <dd
                        className={`self-center justify-self-start rounded-xl px-3.5 py-2 text-sm font-bold tabular-nums md:justify-self-end ${
                          field.value === null
                            ? 'bg-stone-100 text-text-muted'
                            : 'bg-sky-100 text-primary'
                        }`}
                      >
                        {formatFieldValue(field.name, field.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
