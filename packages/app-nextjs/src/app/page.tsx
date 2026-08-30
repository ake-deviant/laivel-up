'use client';

import { useState } from 'react';
import type { DeveloperProfileResultViewModel } from '@laivel-up/core';

type SignalVM = DeveloperProfileResultViewModel['axes'][number]['signals'][number];
type ImprovementVM = DeveloperProfileResultViewModel['improvements'][number];

const LEVELS = ['white', 'red', 'blue', 'green', 'copper', 'silver', 'gold'];

const LEVEL_LABEL: Record<string, string> = {
  white: 'White',
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  copper: 'Copper',
  silver: 'Silver',
  gold: 'Gold',
};

const L: Record<string, { badge: string; bar: string }> = {
  white: { badge: 'bg-gray-100 text-gray-500 border-gray-200', bar: 'bg-gray-300' },
  red: { badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-400' },
  blue: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-400' },
  green: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-400' },
  copper: { badge: 'bg-orange-50 text-orange-700 border-orange-200', bar: 'bg-orange-400' },
  silver: { badge: 'bg-slate-100 text-slate-600 border-slate-300', bar: 'bg-slate-400' },
  gold: { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400' },
};

const SIGNAL_LABEL: Record<string, string> = {
  xl: 'PRs XL',
  lXl: 'PRs L+XL',
  s: 'PRs S',
  m: 'PRs M',
  l: 'PRs L',
  medianConcurrentBranches: 'Branches parallèles (médiane)',
  maxConcurrentBranches: 'Branches simultanées (max)',
  hasWorktreeInclude: '.worktreeinclude configuré',
  contextEngineeringScore: 'Score contexte',
  aiConfigurationScore: 'Score config IA',
  ciMedianRunsToGreen: 'CI — médiane runs',
  medianCorrectionCommitsAfterOpen: 'Commits de correction après ouverture',
  humanCommitRatio: 'Ratio commits humains',
  mergedWithoutHumanEditRatio: 'PRs mergées sans édition humaine',
  medianReviewCommentsReceived: 'Commentaires de review reçus',
};

function formatValue(name: string, value: number | boolean | null): string | null {
  if (value === null) return null;
  if (typeof value === 'boolean') return value ? 'oui' : 'non';
  if (name.endsWith('Ratio')) return `${Math.round(value * 100)} %`;
  return String(value);
}

function Badge({ level, small = false }: { level: string; small?: boolean }) {
  const s = L[level] ?? L.white;
  return (
    <span
      className={`inline-flex items-center border font-semibold rounded-full ${s.badge} ${small ? 'text-[11px] px-2.5 py-0.5' : 'text-xl px-5 py-1.5'}`}
    >
      {LEVEL_LABEL[level] ?? level}
    </span>
  );
}

function ProgressBars({ rank }: { rank: number }) {
  return (
    <div className="flex items-end gap-1 mt-5">
      {LEVELS.map((level, i) => {
        const reached = i <= rank;
        const isCurrent = i === rank;
        const s = L[level];
        return (
          <div key={level} className="flex flex-col items-center gap-1.5">
            <div
              className={`rounded-sm transition-all ${reached ? s.bar : 'bg-gray-200'} ${
                isCurrent ? 'w-5 h-8' : reached ? 'w-4 h-5' : 'w-4 h-3'
              }`}
            />
            <span
              className={`text-[8px] font-medium uppercase leading-none tracking-wide ${isCurrent ? 'text-gray-700' : 'text-gray-400'}`}
            >
              {level.slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({ rank }: { rank: number }) {
  return (
    <div className="flex gap-0.5">
      {LEVELS.map((level, i) => (
        <div
          key={level}
          className={`h-1 flex-1 rounded-full ${i <= rank ? (L[level]?.bar ?? 'bg-gray-300') : 'bg-gray-100'}`}
        />
      ))}
    </div>
  );
}

function SignalRow({ signal }: { signal: SignalVM }) {
  const formatted = formatValue(signal.name, signal.value);
  return (
    <li className="flex items-center justify-between gap-2 py-0.5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
            signal.validated ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {signal.validated ? '✓' : '✗'}
        </span>
        <span className="text-xs text-gray-600 truncate">{signal.label}</span>
      </div>
      {formatted !== null && (
        <span
          className={`shrink-0 text-xs font-mono tabular-nums font-medium ${signal.validated ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          {formatted}
        </span>
      )}
    </li>
  );
}

function ImprovementRow({ imp }: { imp: ImprovementVM }) {
  const targetStyle = imp.targetLevel ? L[imp.targetLevel] : null;
  const label = SIGNAL_LABEL[imp.type] ?? imp.type;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className={`w-1 h-8 rounded-full shrink-0 ${targetStyle?.bar ?? 'bg-gray-300'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
          {imp.axis}
        </p>
        <p className="text-sm text-gray-800 font-medium leading-snug">{label}</p>
      </div>
      {imp.targetLevel && (
        <span
          className={`shrink-0 inline-flex items-center border font-semibold rounded-full text-[11px] px-2.5 py-0.5 ${targetStyle?.badge ?? ''}`}
        >
          → {LEVEL_LABEL[imp.targetLevel]}
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const [profileId, setProfileId] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [result, setResult] = useState<DeveloperProfileResultViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = profileId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/evaluate/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur inconnue');
      } else {
        setResult(data);
        setSubmittedId(id);
      }
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  }

  const allImprovements = result ? [...result.improvements, ...result.busImprovements] : [];

  return (
    <div className="min-h-screen bg-[#f6f6f5]">
      <header className="bg-gray-950 px-6 py-4 border-b border-gray-800">
        <div className="max-w-3xl mx-auto flex items-baseline gap-3">
          <span className="text-white font-bold text-sm tracking-tight">Laivel Up</span>
          <span className="text-gray-500 text-xs hidden sm:inline">
            AI-Driven Development — évaluation de maîtrise
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            placeholder="Identifiant du profil — ex : gauvain"
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !profileId.trim()}
            className="bg-gray-950 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            {loading ? 'Analyse…' : 'Évaluer'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Hero */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Profil · {submittedId}
                  </p>
                  <Badge level={result.overallLevel.value} />
                  <ProgressBars rank={result.overallLevel.rank} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Niveau
                  </p>
                  <p
                    className="font-black text-gray-200"
                    style={{ fontSize: '3.5rem', lineHeight: 1 }}
                  >
                    {result.overallLevel.rank + 1}
                    <span className="text-lg text-gray-300 font-semibold">/7</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Axes */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                Détail par axe
              </p>
              <div className="grid grid-cols-2 gap-3">
                {result.axes.map((axis) => (
                  <div
                    key={axis.axis}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-500">{axis.label}</p>
                      <Badge level={axis.level.value} small />
                    </div>
                    <MiniBar rank={axis.level.rank} />
                    {axis.signals.length > 0 && (
                      <ul className="space-y-1 border-t border-gray-100 pt-2">
                        {axis.signals.map((signal) => (
                          <SignalRow key={signal.name} signal={signal} />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            {allImprovements.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                  Pistes d'amélioration
                </p>
                <div className="space-y-2">
                  {allImprovements.map((imp, i) => (
                    <ImprovementRow key={i} imp={imp} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
