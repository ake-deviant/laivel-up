import type { LevelViewModel } from '@laivel-up/core';
import { LEVEL_PRESENTATION, LEVELS } from './aidd-level';

interface LevelScaleProps {
  level: LevelViewModel;
  compact?: boolean;
}

export function LevelScale({ level, compact = false }: LevelScaleProps) {
  return (
    <div aria-label={`Progression jusqu’au level ${level.label}`} className="w-full">
      <div className="grid grid-cols-7 gap-1.5">
        {LEVELS.map((value, index) => {
          const reached = index <= level.rank;
          return (
            <div
              key={value}
              className={`${compact ? 'h-1.5' : 'h-2.5'} rounded-full ${
                reached ? LEVEL_PRESENTATION[value].accent : 'bg-stone-200'
              }`}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
          <span>White</span>
          <span>Gold</span>
        </div>
      )}
    </div>
  );
}
