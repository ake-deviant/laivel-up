'use client';

import Link from 'next/link';
import type { AxisName } from '@laivel-up/core';
import { useEvaluatorConfig } from '../../../../hooks/use-evaluator-config';
import type { ParallelismWeights } from '../../../../types/evaluation-config';
import type {
  HarnessContextEngineeringWeights,
  HarnessAiConfigurationWeights,
} from '@laivel-up/core';

const AXES: { name: AxisName; label: string; description: string }[] = [
  { name: 'size', label: 'Taille', description: 'Distribution des PRs par taille (XS → XL)' },
  { name: 'harness', label: 'Harnais', description: "Environnement et configuration de l'IA" },
  {
    name: 'intervention',
    label: 'Intervention',
    description: 'Reprises humaines et corrections post-ouverture',
  },
  {
    name: 'parallelism',
    label: 'Parallélisme',
    description: 'Branches simultanées et usage des worktrees',
  },
  {
    name: 'velocity',
    label: 'Vélocité',
    description: 'Cadence de livraison comparée à la moyenne équipe',
  },
];

const PARALLELISM_WEIGHT_LABELS: Record<keyof ParallelismWeights, string> = {
  median: 'Médiane de branches',
  max: 'Maximum de branches',
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

function WeightInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
      <span className="text-sm text-stone-700">{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-sm font-semibold text-stone-900 outline-none focus:border-stone-400"
      />
    </div>
  );
}

export function ConfigDashboard() {
  const { config, update } = useEvaluatorConfig();

  const toggleAxis = (axis: AxisName) => {
    const nonBlockingAxes = config.nonBlockingAxes.includes(axis)
      ? config.nonBlockingAxes.filter((a) => a !== axis)
      : [...config.nonBlockingAxes, axis];
    update({ nonBlockingAxes });
  };

  const setParallelismWeight = (key: keyof ParallelismWeights, value: number) => {
    update({ parallelismWeights: { ...config.parallelismWeights, [key]: value } });
  };

  const setContextWeight = (key: keyof HarnessContextEngineeringWeights, value: number) => {
    update({ harnessContextWeights: { ...config.harnessContextWeights, [key]: value } });
  };

  const setAiWeight = (key: keyof HarnessAiConfigurationWeights, value: number) => {
    update({ harnessAiWeights: { ...config.harnessAiWeights, [key]: value } });
  };

  return (
    <main className="min-h-screen bg-[#f4f2ed] text-stone-950">
      <div className="border-b border-stone-200 bg-[#fbfaf7]">
        <header className="mx-auto flex w-[1180px] items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-sm font-black text-lime-300">
              LU
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight">Laivel Up</p>
              <p className="text-xs text-stone-500">AI-Driven Development</p>
            </div>
          </div>
          <Link
            href="/aidd"
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
          >
            ← Évaluation
          </Link>
        </header>
      </div>

      <div className="mx-auto w-[1180px] py-12 space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-700">
            Configuration
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.045em]">
            Paramètres d'évaluation
          </h1>
        </div>

        {/* Axes bloquants */}
        <section className="rounded-[28px] border border-stone-200 bg-white p-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Axes bloquants
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Contribution au niveau global
              </h2>
            </div>
            <p className="max-w-xs text-right text-sm leading-6 text-stone-500">
              Un axe bloquant tire le niveau global vers le bas s'il est inférieur aux autres.
            </p>
          </div>
          <div className="space-y-3">
            {AXES.map(({ name, label, description }) => {
              const isBlocking = !config.nonBlockingAxes.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleAxis(name)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-6 py-4 text-left transition ${
                    isBlocking
                      ? 'border-stone-900 bg-stone-950 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-500'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${isBlocking ? 'text-white' : 'text-stone-400'}`}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-400">{description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${isBlocking ? 'bg-lime-300 text-stone-950' : 'bg-stone-200 text-stone-500'}`}
                  >
                    {isBlocking ? 'Bloquant' : 'Non-bloquant'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Poids parallélisme */}
        <section className="rounded-[28px] border border-stone-200 bg-white p-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Parallélisme
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Poids du score</h2>
            </div>
            <p className="max-w-xs text-right text-sm leading-6 text-stone-500">
              Le score combine la médiane et le maximum de branches simultanées.
            </p>
          </div>
          <div className="space-y-2">
            {(Object.keys(PARALLELISM_WEIGHT_LABELS) as (keyof ParallelismWeights)[]).map((key) => (
              <WeightInput
                key={key}
                label={PARALLELISM_WEIGHT_LABELS[key]}
                value={config.parallelismWeights[key]}
                onChange={(v) => setParallelismWeight(key, v)}
              />
            ))}
          </div>
        </section>

        {/* Poids harness */}
        <section className="rounded-[28px] border border-stone-200 bg-white p-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Harnais</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Poids des scores</h2>
            </div>
            <p className="max-w-xs text-right text-sm leading-6 text-stone-500">
              Deux scores indépendants : context engineering (niveau blue) et configuration IA
              (niveau copper).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Context engineering
              </p>
              <div className="space-y-2">
                {(
                  Object.keys(HARNESS_CONTEXT_LABELS) as (keyof HarnessContextEngineeringWeights)[]
                ).map((key) => (
                  <WeightInput
                    key={key}
                    label={HARNESS_CONTEXT_LABELS[key]}
                    value={config.harnessContextWeights[key]}
                    onChange={(v) => setContextWeight(key, v)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                Configuration IA
              </p>
              <div className="space-y-2">
                {(Object.keys(HARNESS_AI_LABELS) as (keyof HarnessAiConfigurationWeights)[]).map(
                  (key) => (
                    <WeightInput
                      key={key}
                      label={HARNESS_AI_LABELS[key]}
                      value={config.harnessAiWeights[key]}
                      onChange={(v) => setAiWeight(key, v)}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
