interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

export function NumberInput({ id, label, value, onChange, description }: NumberInputProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-muted px-4 py-3.5"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-primary">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-text-muted">{description}</span>}
      </span>
      <input
        id={id}
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
        className="h-10 w-20 shrink-0 rounded-xl border border-border-strong bg-white px-3 text-center text-sm font-bold tabular-nums text-primary outline-none transition-colors hover:border-primary focus:border-accent"
      />
    </label>
  );
}
