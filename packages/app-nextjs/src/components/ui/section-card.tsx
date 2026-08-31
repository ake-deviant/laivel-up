import type { ReactNode } from 'react';

interface SectionCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}

export function SectionCard({
  eyebrow,
  title,
  description,
  aside,
  children,
  compact = false,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-3xl border border-border bg-surface ${compact ? 'p-5 sm:p-6' : 'p-5 sm:p-7 lg:p-8'}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              {eyebrow}
            </p>
          )}
          <h2
            className={`${eyebrow ? 'mt-2' : ''} text-xl font-semibold tracking-tight text-primary sm:text-2xl`}
          >
            {title}
          </h2>
          {description && <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <div className={compact ? 'mt-5' : 'mt-7'}>{children}</div>
    </section>
  );
}
