import Link from 'next/link';
import type { AxisViewModel } from '@laivel-up/core';
import { LevelScale } from './level-scale';
import { LevelMedal } from './level-medal';

const AXIS_DESCRIPTION: Record<AxisViewModel['axis'], string> = {
  size: 'Taille habituelle des réalisations confiées à l’IA',
  harness: 'Contexte, configuration et boucles autour du modèle',
  intervention: 'Niveau de reprise humaine pendant la réalisation',
  parallelism: 'Capacité à faire progresser plusieurs travaux à la fois',
};

function formatSignalValue(name: string, value: number | boolean | null) {
  if (value === null) return 'Non mesuré';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (name.toLowerCase().includes('ratio') || ['xs', 's', 'm', 'l', 'xl', 'lXl'].includes(name)) {
    return `${Math.round(value * 100)} %`;
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

export function AxisCard({ axis, profileId }: { axis: AxisViewModel; profileId: string }) {
  return (
    <article className="flex flex-col rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_-38px_rgba(41,37,36,0.55)]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{axis.axis}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            {axis.label}
          </h3>
          <p className="mt-2 max-w-[30rem] text-sm leading-6 text-stone-500">
            {AXIS_DESCRIPTION[axis.axis]}
          </p>
        </div>
        <LevelMedal level={axis.level} compact />
      </div>

      <div className="mt-6">
        <LevelScale level={axis.level} compact />
      </div>

      <div className="mt-6 flex-1 border-t border-stone-100 pt-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
          Signaux déterminants
        </p>
        {axis.signals.length === 0 ? (
          <p className="text-sm text-stone-500">Aucun signal disponible pour cet axe.</p>
        ) : (
          <ul className="space-y-2.5">
            {axis.signals.map((signal) => (
              <li key={signal.name} className="flex items-center justify-between gap-4 text-sm">
                <span className="flex min-w-0 items-center gap-2.5 text-stone-600">
                  <span
                    aria-label={signal.validated ? 'Validé' : 'Non validé'}
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      signal.validated ? 'bg-emerald-500' : 'bg-stone-300'
                    }`}
                  />
                  <span>{signal.label}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-stone-900">
                  {formatSignalValue(signal.name, signal.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/aidd/${encodeURIComponent(profileId)}/${axis.axis}`}
        className="mt-6 flex items-center justify-between rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
      >
        <span>Explorer cet axe</span>
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
