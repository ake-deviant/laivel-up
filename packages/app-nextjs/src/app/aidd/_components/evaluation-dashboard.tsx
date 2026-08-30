'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { DeveloperProfileResultViewModel } from '@laivel-up/core';
import { AxisCard } from './axis-card';
import { getLevelPresentation } from './aidd-level';
import { LevelScale } from './level-scale';
import { MissingDataSummary } from './missing-data-summary';
import { ImprovementCard } from './improvement-card';

const OPPORTUNITY_FIELD_LABEL: Record<string, string> = {
  claudeMd: 'Fichier CLAUDE.md',
  docsContextCount: 'Fichiers de contexte',
  docsSpecsCount: 'Fichiers de spécifications',
  docsBrainstormCount: 'Fichiers de brainstorm',
  docsPlansCount: 'Fichiers de plans',
  memoryCount: 'Fichiers mémoire',
  tasksCount: 'Fichiers de tâches',
  xlRatio: 'Part des PRs XL (> 500 lignes)',
  lxlRatio: 'Part des PRs L+XL (> 200 lignes)',
  medianCorrectionCommitsAfterOpen: 'Commits de correction après ouverture (médiane)',
  humanCommitRatio: 'Ratio de commits humains',
  mergedWithoutHumanEditRatio: 'Ratio de PRs mergées sans édition humaine',
  medianReviewCommentsReceived: 'Commentaires de review reçus (médiane)',
  hasWorktreeInclude: 'Worktrees activés',
  medianConcurrentBranches: 'Branches simultanées (médiane)',
};

export function EvaluationDashboard() {
  const [profileId, setProfileId] = useState('');
  const [evaluatedProfileId, setEvaluatedProfileId] = useState('');
  const [result, setResult] = useState<DeveloperProfileResultViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadProfile(normalizedProfileId: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluate/${encodeURIComponent(normalizedProfileId)}`);
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? String(payload.error)
            : 'Le profil ne peut pas être évalué.';
        setError(message);
        return;
      }

      setResult(payload as DeveloperProfileResultViewModel);
      setEvaluatedProfileId(normalizedProfileId);
      window.history.replaceState(
        null,
        '',
        `/aidd?profile=${encodeURIComponent(normalizedProfileId)}`,
      );
    } catch {
      setError('Le service d’évaluation ne répond pas. Réessaie dans un instant.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const profileFromUrl = new URLSearchParams(window.location.search).get('profile')?.trim();
    if (!profileFromUrl) return;
    setProfileId(profileFromUrl);
    void loadProfile(profileFromUrl);
  }, []);

  async function evaluateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedProfileId = profileId.trim();
    if (!normalizedProfileId) return;
    await loadProfile(normalizedProfileId);
  }

  const improvements = result ? [...result.improvements, ...result.busImprovements] : [];
  const overallPresentation = result ? getLevelPresentation(result.overallLevel) : null;

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Référentiel de maîtrise
          </p>
        </header>
      </div>

      <div className="mx-auto w-[1180px] py-12">
        <section className="grid grid-cols-[1fr_440px] items-end gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-700">
              Évaluation factuelle
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em]">
              Comprendre où se situe une pratique AI-Driven Development.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
              Le résultat croise quatre axes observables. Le `level` global correspond au niveau
              commun réellement atteint.
            </p>
          </div>

          <form
            onSubmit={evaluateProfile}
            className="rounded-[28px] bg-stone-950 p-3 shadow-2xl shadow-stone-400/30"
          >
            <label htmlFor="profile-id" className="sr-only">
              Identifiant du profil
            </label>
            <div className="flex items-center gap-2">
              <input
                id="profile-id"
                value={profileId}
                onChange={(event) => setProfileId(event.target.value)}
                placeholder="Ex. gauvain"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-2xl border border-stone-700 bg-stone-900 px-5 py-4 text-sm text-white outline-none placeholder:text-stone-500 focus:border-lime-300"
              />
              <button
                type="submit"
                disabled={isLoading || !profileId.trim()}
                className="rounded-2xl bg-lime-300 px-5 py-4 text-sm font-bold text-stone-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? 'Évaluation…' : 'Évaluer'}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
          >
            {error}
          </div>
        )}

        {!result && !error && (
          <section className="mt-14 grid grid-cols-4 gap-4 border-t border-stone-300 pt-8">
            {[
              ['01', 'size', 'Taille des réalisations'],
              ['02', 'harness', 'Environnement de l’IA'],
              ['03', 'intervention', 'Reprises humaines'],
              ['04', 'parallelism', 'Travaux simultanés'],
            ].map(([number, axis, description]) => (
              <div key={axis} className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-5">
                <p className="text-xs font-bold text-stone-400">{number}</p>
                <p className="mt-8 font-semibold">{axis}</p>
                <p className="mt-1 text-sm text-stone-500">{description}</p>
              </div>
            ))}
          </section>
        )}

        {result && overallPresentation && (
          <div aria-live="polite" className="mt-14 space-y-8">
            <section className="overflow-hidden rounded-[36px] bg-stone-950 text-white shadow-2xl shadow-stone-400/30">
              <div className="grid grid-cols-[1fr_330px]">
                <div className="p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    Résultat de {evaluatedProfileId}
                  </p>
                  <div className="mt-5 flex items-baseline gap-4">
                    <h2 className="text-7xl font-semibold tracking-[-0.06em]">
                      {result.overallLevel.label}
                    </h2>
                    <span className="text-lg font-medium text-stone-400">
                      {result.overallLevel.rank + 1} / 7
                    </span>
                  </div>
                  <p className="mt-4 text-lg text-stone-300">{overallPresentation.description}</p>
                  <div className="mt-9 max-w-xl">
                    <LevelScale level={result.overallLevel} />
                  </div>
                </div>
                <div
                  className={`${overallPresentation.background} flex flex-col justify-between p-8 text-stone-950`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${overallPresentation.text}`}
                  >
                    Lecture du résultat
                  </p>
                  <p className="text-2xl font-semibold leading-snug tracking-tight">
                    Les quatre axes doivent progresser ensemble : le plus bas fixe le `level`
                    global.
                  </p>
                </div>
              </div>
            </section>

            {result.formatWarnings.length > 0 && (
              <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-7">
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                      Données à vérifier
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                      Certaines valeurs ont un format inattendu
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      L’évaluation continue avec ces valeurs considérées comme non collectées.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-900">
                    {result.formatWarnings.length} warning
                    {result.formatWarnings.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-3">
                  {result.formatWarnings.map((warning) => (
                    <li
                      key={`${warning.field}-${warning.reason}`}
                      className="rounded-2xl border border-amber-200 bg-white px-5 py-4"
                    >
                      <code className="text-xs font-bold text-amber-800">{warning.field}</code>
                      <p className="mt-2 text-sm text-stone-600">{warning.reason}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <MissingDataSummary groups={result.missingDataGroups} profileId={evaluatedProfileId} />

            <section>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    Analyse détaillée
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Les quatre axes</h2>
                </div>
                <p className="max-w-md text-right text-sm leading-6 text-stone-500">
                  Un point vert indique un signal validé pour le prochain `level`. Les valeurs
                  expliquent le résultat observé.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {result.axes.map((axis) => (
                  <AxisCard key={axis.axis} axis={axis} profileId={evaluatedProfileId} />
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-[#fbfaf7] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-700">
                    Progression
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Ce qui débloque la suite
                  </h2>
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
                  Aucune piste d’amélioration n’est remontée pour ce profil.
                </p>
              )}
              {result.improvementOpportunities.length > 0 && (
                <div className="mt-7 border-t border-stone-200 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">
                        Opportunités à fort impact
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Une seule modification simulée pouvant faire progresser un axe.
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-800">
                      {result.improvementOpportunities.length} opportunité
                      {result.improvementOpportunities.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-3">
                    {result.improvementOpportunities.map((opportunity) => (
                      <li
                        key={`${opportunity.axis}-${opportunity.field}`}
                        className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">
                            {opportunity.axis}
                          </p>
                          <span className="text-xs font-bold text-orange-800">
                            +{opportunity.levelGain} level{opportunity.levelGain > 1 ? 's' : ''}{' '}
                            gagné{opportunity.levelGain > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="mt-2 font-semibold text-stone-900">
                          {OPPORTUNITY_FIELD_LABEL[opportunity.field] ?? opportunity.field}
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          {opportunity.currentLevel.label} → {opportunity.resultingLevel.label}
                        </p>
                        <p className="mt-1 text-xs text-orange-700">
                          +{opportunity.scoreDelta} points · une seule modification
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
