import type { AxisName } from '@laivel-up/core';

const AXES: { name: AxisName; label: string }[] = [
  { name: 'size', label: 'Taille' },
  { name: 'harness', label: 'Harnais' },
  { name: 'intervention', label: 'Intervention' },
  { name: 'parallelism', label: 'Parallélisme' },
  { name: 'velocity', label: 'Vélocité' },
];

export function SettingsPanel({
  nonBlockingAxes,
  onChange,
}: {
  nonBlockingAxes: AxisName[];
  onChange: (axes: AxisName[]) => void;
}) {
  const toggle = (axis: AxisName) => {
    if (nonBlockingAxes.includes(axis)) {
      onChange(nonBlockingAxes.filter((a) => a !== axis));
    } else {
      onChange([...nonBlockingAxes, axis]);
    }
  };

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex w-[1180px] items-center gap-6 py-3">
        <p className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
          Axes bloquants
        </p>
        <div className="flex items-center gap-2">
          {AXES.map(({ name, label }) => {
            const isNonBlocking = nonBlockingAxes.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  isNonBlocking
                    ? 'border-stone-200 bg-stone-50 text-stone-400'
                    : 'border-stone-900 bg-stone-900 text-white'
                }`}
              >
                {label}
                {isNonBlocking && (
                  <span className="ml-1.5 font-normal opacity-60">non-bloquant</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="ml-auto text-xs text-stone-400">
          Un axe non-bloquant est calculé mais n'abaisse pas le niveau global.
        </p>
      </div>
    </div>
  );
}
