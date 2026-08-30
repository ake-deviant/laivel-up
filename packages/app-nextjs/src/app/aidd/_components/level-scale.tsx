import type { LevelViewModel } from '@laivel-up/core';
import { LEVEL_PRESENTATION, LEVELS } from './aidd-level';

interface LevelScaleProps {
  level: LevelViewModel;
  compact?: boolean;
}

export function LevelScale({ level, compact = false }: LevelScaleProps) {
  const progress = (level.rank / (LEVELS.length - 1)) * 100;
  const presentation = LEVEL_PRESENTATION[level.value];
  return (
    <div
      aria-label={`Progression jusqu’au level ${level.label}`}
      aria-valuemin={0}
      aria-valuemax={LEVELS.length - 1}
      aria-valuenow={level.rank}
      role="progressbar"
      className="w-full"
    >
      <div className="relative">
        <div className={`${compact ? 'h-2' : 'h-3'} overflow-hidden rounded-full bg-stone-200`}>
          <div
            className={`h-full rounded-full ${presentation.accent}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 flex justify-between">
          {LEVELS.map((value) => (
            <span key={value} className="h-full w-px bg-stone-400/30" />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        <span>White</span>
        <span className="text-stone-600">Level {level.label}</span>
        <span>Gold</span>
      </div>
      {!compact && (
        <p className="mt-1 text-right text-[10px] font-semibold text-stone-400">
          {level.rank + 1} / {LEVELS.length} levels
        </p>
      )}
    </div>
  );
}
