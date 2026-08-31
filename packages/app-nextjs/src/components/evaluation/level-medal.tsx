import type { LevelViewModel } from '@laivel-up/core';
import { getLevelPresentation } from './aidd-level';

export function LevelMedal({
  level,
  compact = false,
}: {
  level: LevelViewModel;
  compact?: boolean;
}) {
  const presentation = getLevelPresentation(level);
  return (
    <div
      className={`relative shrink-0 ${compact ? 'w-14' : 'w-20'}`}
      aria-label={`Level ${level.label}`}
    >
      <div
        className={`absolute left-1/2 top-1/2 z-0 -translate-x-1/2 rounded-b-md ${compact ? 'h-7 w-8' : 'h-9 w-10'} bg-stone-950/15`}
      />
      <div
        className={`relative z-10 flex aspect-square items-center justify-center rounded-full border-4 border-white shadow-lg ring-2 ring-stone-200 ${presentation.background}`}
      >
        <span className={`font-black ${compact ? 'text-[9px]' : 'text-xs'} ${presentation.text}`}>
          {level.label}
        </span>
      </div>
    </div>
  );
}
