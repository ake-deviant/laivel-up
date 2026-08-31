'use client';

import { useState } from 'react';
import type {
  AxisName,
  HarnessAiConfigurationWeights,
  HarnessContextEngineeringWeights,
} from '@laivel-up/core';
import { useEvaluatorConfig } from '../../hooks/use-evaluator-config';
import {
  HARNESS_ALGORITHMS,
  PARALLELISM_ALGORITHMS,
  type AlgorithmOption,
} from '../../config/evaluation-algorithms';
import type {
  HarnessAlgorithm,
  ParallelismAlgorithm,
  ParallelismWeights,
} from '../../types/evaluation-config';
import { AppShell } from '../ui/app-shell';
import { Button } from '../ui/button';
import { NumberInput } from '../ui/number-input';
import { PageHeader } from '../ui/page-header';
import { SectionCard } from '../ui/section-card';

const AXES: { name: AxisName; label: string; description: string }[] = [
  { name: 'size', label: 'Taille', description: 'Distribution des PRs de XS à XL' },
  { name: 'harness', label: 'Harnais', description: "Contexte et configuration de l'IA" },
  { name: 'intervention', label: 'Intervention', description: 'Corrections et reprises humaines' },
  { name: 'parallelism', label: 'Parallélisme', description: 'Branches simultanées et worktrees' },
  { name: 'velocity', label: 'Vélocité', description: 'Cadence comparée à la moyenne équipe' },
];

const PARALLELISM_WEIGHT_LABELS: Record<keyof ParallelismWeights, string> = {
  median: 'Poids de la médiane',
  max: 'Poids du maximum',
};

const HARNESS_CONTEXT_LABELS: Record<keyof HarnessContextEngineeringWeights, string> = {
  claudeMd: 'CLAUDE.md',
  docsContextCount: 'Fichiers de contexte',
  docsSpecsCount: 'Fichiers de spécifications',
  docsBrainstormCount: 'Fichiers de brainstorm',
  docsPlansCount: 'Fichiers de plans',
  memoryCount: 'Fichiers mémoire',
  tasksCount: 'Fichiers de tâches',
};

const HARNESS_AI_LABELS: Record<keyof HarnessAiConfigurationWeights, string> = {
  agentsMd: 'AGENTS.md',
  settingsJson: 'settings.json',
  agentsCount: "Nombre d'agents",
  skillsCount: 'Nombre de skills',
  hooksCount: 'Nombre de hooks',
  rulesCount: 'Nombre de règles',
};

function AlgorithmSelector<TId extends string>({
  options,
  selected,
  onSelect,
}: {
  options: AlgorithmOption<TId>[];
  selected: TId;
  onSelect: (id: TId) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((algorithm) => {
        const isSelected = selected === algorithm.id;
        return (
          <button
            key={algorithm.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(algorithm.id)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              isSelected
                ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-400'
                : 'border-border bg-white hover:border-primary'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-primary">{algorithm.label}</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-stone-300'}`}
              />
            </span>
            <span className="mt-2 block text-sm leading-6 text-text-muted">
              {algorithm.description}
            </span>
            <code className="mt-3 block rounded-lg bg-primary px-3 py-2 text-xs text-sky-200">
              {algorithm.formula}
            </code>
          </button>
        );
      })}
    </div>
  );
}

export function ConfigPreview() {
  const { config, update, reset } = useEvaluatorConfig();
  const [resetConfirmation, setResetConfirmation] = useState<string | null>(null);

  const toggleAxis = (axis: AxisName) => {
    const nonBlockingAxes = config.nonBlockingAxes.includes(axis)
      ? config.nonBlockingAxes.filter((item) => item !== axis)
      : [...config.nonBlockingAxes, axis];
    update({ nonBlockingAxes });
  };

  const setParallelismWeight = (key: keyof ParallelismWeights, value: number) => {
    update({ parallelismWeights: { ...config.parallelismWeights, [key]: value } });
  };

  const selectParallelismAlgorithm = (parallelism: ParallelismAlgorithm) => {
    update({ algorithms: { ...config.algorithms, parallelism } });
  };

  const selectHarnessAlgorithm = (harness: HarnessAlgorithm) => {
    update({ algorithms: { ...config.algorithms, harness } });
  };

  const resetConfig = () => {
    const confirmed = window.confirm(
      'Rétablir toute la configuration initiale ? Les ajustements locaux seront remplacés.',
    );
    if (!confirmed) return;
    reset();
    setResetConfirmation('Configuration initiale restaurée.');
  };

  const setContextWeight = (key: keyof HarnessContextEngineeringWeights, value: number) => {
    update({ harnessContextWeights: { ...config.harnessContextWeights, [key]: value } });
  };

  const setAiWeight = (key: keyof HarnessAiConfigurationWeights, value: number) => {
    update({ harnessAiWeights: { ...config.harnessAiWeights, [key]: value } });
  };

  return (
    <AppShell evaluationHref="/" profilesHref="/profiles" configHref="/config">
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres d'évaluation"
        description="Définis la contribution des axes et ajuste les poids utilisés lors des prochaines évaluations. Chaque modification est enregistrée automatiquement dans ce navigateur."
        actions={
          <>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 text-xs font-bold text-sky-800">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              {resetConfirmation ?? 'Enregistrement automatique'}
            </span>
            <Button type="button" variant="secondary" onClick={resetConfig}>
              Rétablir la configuration initiale
            </Button>
          </>
        }
      />

      <div className="mt-8 space-y-6">
        <SectionCard
          eyebrow="Axes bloquants"
          title="Contribution au niveau global"
          description="Un axe bloquant participe au calcul du overallLevel. Clique sur son statut pour modifier sa contribution."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {AXES.map(({ name, label, description }) => {
              const isBlocking = !config.nonBlockingAxes.includes(name);
              return (
                <article
                  key={name}
                  className={`flex min-h-44 flex-col rounded-2xl border p-4 transition-colors ${
                    isBlocking ? 'border-sky-200 bg-sky-50/70' : 'border-border bg-surface-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-primary">{label}</h3>
                    <span
                      aria-hidden="true"
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isBlocking ? 'bg-sky-500' : 'bg-stone-300'}`}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{description}</p>
                  <button
                    type="button"
                    aria-pressed={isBlocking}
                    onClick={() => toggleAxis(name)}
                    className={`mt-auto min-h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                      isBlocking
                        ? 'border-primary bg-primary text-white hover:bg-primary-hover'
                        : 'border-border-strong bg-white text-text-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    {isBlocking ? 'Bloquant' : 'Non-bloquant'}
                  </button>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Parallélisme"
          title="Calcul du score"
          description="Choisis la logique métier utilisée pour calculer le score, puis ajuste ses poids."
          compact
        >
          <div>
            <h3 className="text-sm font-bold text-primary">Algorithme</h3>
            <div className="mt-3">
              <AlgorithmSelector
                options={PARALLELISM_ALGORITHMS}
                selected={config.algorithms.parallelism}
                onSelect={selectParallelismAlgorithm}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-sm font-bold text-primary">Poids</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(Object.keys(PARALLELISM_WEIGHT_LABELS) as (keyof ParallelismWeights)[])
                .filter((key) => key !== 'max' || config.algorithms.parallelism === 'weighted')
                .map((key) => (
                  <NumberInput
                    key={key}
                    id={`parallelism-${key}`}
                    label={PARALLELISM_WEIGHT_LABELS[key]}
                    value={config.parallelismWeights[key]}
                    onChange={(value) => setParallelismWeight(key, value)}
                  />
                ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Harnais"
          title="Calcul du level"
          description="Choisis entre des scores cumulés et une chaîne de capacités obligatoires."
        >
          <div>
            <h3 className="text-sm font-bold text-primary">Algorithme</h3>
            <div className="mt-3">
              <AlgorithmSelector
                options={HARNESS_ALGORITHMS}
                selected={config.algorithms.harness}
                onSelect={selectHarnessAlgorithm}
              />
            </div>
          </div>

          {config.algorithms.harness === 'weighted-score' && (
            <div className="mt-7 grid gap-8 border-t border-border pt-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-primary">Context engineering</h3>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Signaux utilisés à partir du level blue.
                </p>
                <div className="mt-4 space-y-2">
                  {(
                    Object.keys(
                      HARNESS_CONTEXT_LABELS,
                    ) as (keyof HarnessContextEngineeringWeights)[]
                  ).map((key) => (
                    <NumberInput
                      key={key}
                      id={`harness-context-${key}`}
                      label={HARNESS_CONTEXT_LABELS[key]}
                      value={config.harnessContextWeights[key]}
                      onChange={(value) => setContextWeight(key, value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-primary">Configuration IA</h3>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Signaux utilisés à partir du level copper.
                </p>
                <div className="mt-4 space-y-2">
                  {(Object.keys(HARNESS_AI_LABELS) as (keyof HarnessAiConfigurationWeights)[]).map(
                    (key) => (
                      <NumberInput
                        key={key}
                        id={`harness-ai-${key}`}
                        label={HARNESS_AI_LABELS[key]}
                        value={config.harnessAiWeights[key]}
                        onChange={(value) => setAiWeight(key, value)}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
