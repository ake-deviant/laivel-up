'use client';

import { type FormEvent, useEffect, useState } from 'react';
import type { DeveloperProfileResultViewModel, DeveloperProfileSummary } from '@laivel-up/core';
import { useEvaluatorConfig } from '../../hooks/use-evaluator-config';
import { getLevelPresentation } from '../evaluation/aidd-level';
import { ImprovementCard } from '../evaluation/improvement-card';
import { LevelScale } from '../evaluation/level-scale';
import { AppShell } from '../ui/app-shell';
import { AxisSummaryCard } from '../ui/axis-summary-card';
import { Button } from '../ui/button';
import { FeedbackState } from '../ui/feedback-state';
import { PageHeader } from '../ui/page-header';
import { SectionCard } from '../ui/section-card';

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
  medianCorrectionCommitsAfterOpen: "Commits de correction après l'ouverture",
  humanCommitRatio: 'Ratio de commits humains',
  mergedWithoutHumanEditRatio: 'Ratio de PRs mergées sans édition humaine',
  medianReviewCommentsReceived: 'Commentaires de review reçus',
  hasWorktreeInclude: 'Worktrees activés',
  medianConcurrentBranches: 'Branches simultanées (médiane)',
};

export function EvaluationPreview() {
  const [profileId, setProfileId] = useState('');
  const [evaluatedProfileId, setEvaluatedProfileId] = useState('');
  const [profiles, setProfiles] = useState<DeveloperProfileSummary[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [result, setResult] = useState<DeveloperProfileResultViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialProfileHandled, setInitialProfileHandled] = useState(false);
  const { config, isReady } = useEvaluatorConfig();

  useEffect(() => {
    fetch('/api/profiles')
      .then((response) => response.json())
      .then((payload: DeveloperProfileSummary[]) => setProfiles(payload))
      .catch(() => setProfiles([]))
      .finally(() => setProfilesLoading(false));
  }, []);

  async function loadProfile(id: string) {
    const normalizedProfileId = id.trim();
    if (!normalizedProfileId) return;
    setProfileId(normalizedProfileId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluate/${encodeURIComponent(normalizedProfileId)}`, {
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
      setResult(payload as DeveloperProfileResultViewModel);
      setEvaluatedProfileId(normalizedProfileId);
      window.history.replaceState(null, '', `/?profile=${encodeURIComponent(normalizedProfileId)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Le service d'évaluation ne répond pas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isReady || initialProfileHandled) return;
    setInitialProfileHandled(true);
    const profileFromUrl = new URLSearchParams(window.location.search).get('profile')?.trim();
    if (profileFromUrl) void loadProfile(profileFromUrl);
  }, [initialProfileHandled, isReady]);

  function evaluateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadProfile(profileId);
  }

  const improvements = result ? [...result.improvements, ...result.busImprovements] : [];
  const presentation = result ? getLevelPresentation(result.overallLevel) : null;

  return (
    <AppShell evaluationHref="/" profilesHref="/profiles" configHref="/config">
      <PageHeader
        eyebrow="Évaluation"
        title="Situer une pratique AI-Driven Development"
        description="Sélectionne un profil pour calculer son overallLevel et comprendre les signaux observés sur chaque axe."
        actions={
          <form onSubmit={evaluateProfile} className="flex w-full gap-2 sm:w-auto">
            <label htmlFor="preview-profile-id" className="sr-only">
              Identifiant du profil
            </label>
            <input
              id="preview-profile-id"
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
              placeholder="Ex. gauvain"
              autoComplete="off"
              className="min-h-10 min-w-0 flex-1 rounded-xl border border-border-strong bg-white px-3 text-sm text-primary outline-none transition-colors placeholder:text-stone-400 hover:border-primary focus:border-accent sm:w-44"
            />
            <Button type="submit" disabled={isLoading || !profileId.trim()}>
              {isLoading ? 'Évaluation…' : 'Évaluer'}
            </Button>
          </form>
        }
      />

      <div className="mt-8 space-y-8">
        {error && <FeedbackState tone="error" title="Évaluation impossible" description={error} />}

        {!result && !error && (
          <SectionCard
            eyebrow="Profils"
            title="Choisir un profil disponible"
            description="La sélection lance immédiatement une évaluation avec la configuration enregistrée."
          >
            {profilesLoading ? (
              <p className="text-sm text-text-muted">Chargement des profils…</p>
            ) : profiles.length === 0 ? (
              <FeedbackState
                title="Aucun profil disponible"
                description="Utilise le champ ci-dessus pour saisir directement un profileId."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => void loadProfile(profile.id)}
                    className="group rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary hover:shadow-lg hover:shadow-stone-950/5"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                      {profile.id}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-primary">
                      {profile.role ?? 'Profil développeur'}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">
                      {[
                        profile.experienceYears ? `${profile.experienceYears} ans` : null,
                        profile.teamSize ? `équipe ${profile.teamSize}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Informations contextuelles non renseignées'}
                    </p>
                    <span className="mt-5 inline-flex text-sm font-bold text-sky-700 group-hover:text-primary">
                      Évaluer ce profil →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {result && presentation && (
          <div className="space-y-8" aria-live="polite">
            <section className="grid overflow-hidden rounded-3xl bg-primary text-white lg:grid-cols-[1fr_340px]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                  Résultat de {evaluatedProfileId}
                </p>
                <div className="mt-5 flex flex-wrap items-baseline gap-4">
                  <h2 className="text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                    {result.overallLevel.label}
                  </h2>
                  <span className="text-base font-medium text-stone-400">
                    {result.overallLevel.rank + 1} / 7
                  </span>
                </div>
                <p className="mt-4 text-base text-stone-300 sm:text-lg">
                  {presentation.description}
                </p>
                <div className="mt-8 max-w-2xl">
                  <LevelScale level={result.overallLevel} />
                </div>
              </div>
              <div className={`${presentation.background} flex items-end p-6 text-primary sm:p-8`}>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.18em] ${presentation.text}`}
                  >
                    Lecture du résultat
                  </p>
                  <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
                    Le plus bas des axes bloquants fixe le overallLevel.
                  </p>
                </div>
              </div>
            </section>

            {result.formatWarnings.length > 0 && (
              <SectionCard
                eyebrow="Données à vérifier"
                title="Certaines valeurs ont un format inattendu"
                description="L'évaluation continue en considérant ces valeurs comme non collectées."
              >
                <ul className="grid gap-3 md:grid-cols-2">
                  {result.formatWarnings.map((warning) => (
                    <li
                      key={`${warning.field}-${warning.reason}`}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                    >
                      <code className="text-xs font-bold text-amber-800">{warning.field}</code>
                      <p className="mt-2 text-sm text-amber-950/70">{warning.reason}</p>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {result.missingDataGroups.some(
              (group) => group.impactingFields.length > 0 || group.ignoredFields.length > 0,
            ) && (
              <SectionCard
                eyebrow="Couverture des données"
                title="Données non collectées"
                description="Les absences sont regroupées par axe et séparées selon leur effet sur l'évaluation."
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {result.missingDataGroups.map((group) => {
                    const missingCount = group.impactingFields.length + group.ignoredFields.length;
                    if (missingCount === 0) return null;

                    return (
                      <article
                        key={group.axis}
                        className="rounded-2xl border border-border bg-surface-muted p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-primary">{group.label}</h3>
                          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
                            {missingCount}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                          {group.impactingFields.length > 0 && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-800">
                              {group.impactingFields.length} impactante
                              {group.impactingFields.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {group.ignoredFields.length > 0 && (
                            <span className="rounded-full bg-stone-200 px-2.5 py-1 text-text-muted">
                              {group.ignoredFields.length} contextuelle
                              {group.ignoredFields.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-text-muted">
                          {[...group.impactingFields, ...group.ignoredFields]
                            .slice(0, 3)
                            .map((field) => (
                              <li key={field.path} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                <span className="truncate">{field.label}</span>
                              </li>
                            ))}
                        </ul>
                      </article>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            <section>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
                  Analyse détaillée
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                  Les six axes
                </h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {result.axes.map((axis) => (
                  <AxisSummaryCard key={axis.axis} axis={axis} profileId={evaluatedProfileId} />
                ))}
              </div>
            </section>

            <SectionCard
              eyebrow="Progression"
              title="Ce qui débloque la suite"
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
                  description="Aucune piste d'amélioration n'est disponible pour ce profil."
                />
              )}

              {result.improvementOpportunities.length > 0 && (
                <div className="mt-7 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-primary">Opportunités à fort impact</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Une seule modification simulée pouvant faire progresser un axe.
                  </p>
                  <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                    {result.improvementOpportunities.map((opportunity) => (
                      <li
                        key={`${opportunity.axis}-${opportunity.field}`}
                        className="rounded-2xl border border-orange-200 bg-orange-50 p-5"
                      >
                        <div className="flex items-center justify-between gap-3 text-xs font-bold text-orange-800">
                          <span className="uppercase tracking-[0.14em]">{opportunity.axis}</span>
                          <span>
                            +{opportunity.levelGain} level{opportunity.levelGain > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-primary">
                          {OPPORTUNITY_FIELD_LABEL[opportunity.field] ?? opportunity.field}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          {opportunity.currentLevel.label} → {opportunity.resultingLevel.label}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </AppShell>
  );
}
