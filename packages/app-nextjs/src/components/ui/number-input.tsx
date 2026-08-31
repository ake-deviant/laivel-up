interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  clampValue?: boolean;
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  description,
  min = 0,
  max,
  step = 1,
  error,
  clampValue = true,
}: NumberInputProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-muted px-4 py-3.5"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-primary">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-text-muted">{description}</span>}
        {error && (
          <span id={`${id}-error`} className="mt-1 block text-xs font-semibold text-rose-700">
            {error}
          </span>
        )}
      </span>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value}
        onChange={(event) => {
          const parsed = Number.parseFloat(event.target.value);
          if (!Number.isFinite(parsed)) return;
          onChange(
            clampValue ? Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, parsed)) : parsed,
          );
        }}
        className="h-10 w-20 shrink-0 rounded-xl border border-border-strong bg-white px-3 text-center text-sm font-bold tabular-nums text-primary outline-none transition-colors hover:border-primary focus:border-accent"
      />
    </label>
  );
}
