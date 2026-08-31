import Link from 'next/link';
import type { AxisViewModel } from '@laivel-up/core';
import { LevelScale } from '../evaluation/level-scale';
import { LevelMedal } from '../evaluation/level-medal';

const AXIS_DESCRIPTION: Record<AxisViewModel['axis'], string> = {
  size: "Taille habituelle des réalisations confiées à l'IA",
  harness: 'Contexte, configuration et boucles autour du modèle',
  intervention: 'Niveau de reprise humaine pendant la réalisation',
  parallelism: 'Capacité à faire progresser plusieurs travaux à la fois',
  velocity: 'Cadence de livraison comparée à la référence équipe',
};

function formatSignalValue(name: string, value: number | boolean | null) {
  if (value === null) return 'Non mesuré';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (name.toLowerCase().includes('ratio') || ['xs', 's', 'm', 'l', 'xl', 'lXl'].includes(name)) {
    return `${Math.round(value * 100)} %`;
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

interface AxisSummaryCardProps {
  axis: AxisViewModel;
  profileId: string;
}

export function AxisSummaryCard({ axis, profileId }: AxisSummaryCardProps) {
  return (
    <article className="flex flex-col rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
            {axis.axis}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-primary sm:text-2xl">
            {axis.label}
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">{AXIS_DESCRIPTION[axis.axis]}</p>
        </div>
        <LevelMedal level={axis.level} compact />
      </div>

      <div className="mt-6">
        <LevelScale level={axis.level} compact />
      </div>

      <div className="mt-6 flex-1 border-t border-border pt-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
          Signaux déterminants
        </p>
        {axis.signals.length === 0 ? (
          <p className="text-sm text-text-muted">Aucun signal disponible pour cet axe.</p>
        ) : (
          <ul className="space-y-2.5">
            {axis.signals.map((signal) => (
              <li key={signal.name} className="flex items-center justify-between gap-4 text-sm">
                <span className="flex min-w-0 items-center gap-2.5 text-text-muted">
                  <span
                    aria-label={signal.validated ? 'Validé' : 'Non validé'}
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${signal.validated ? 'bg-emerald-500' : 'bg-stone-300'}`}
                  />
                  <span>{signal.label}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-primary">
                  {formatSignalValue(signal.name, signal.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/${encodeURIComponent(profileId)}/${axis.axis}`}
        className="mt-6 flex min-h-11 items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
      >
        <span>Explorer cet axe</span>
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
