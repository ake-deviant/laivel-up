import type { ReactNode } from 'react';

interface FeedbackStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}

export function FeedbackState({
  title,
  description,
  action,
  tone = 'neutral',
}: FeedbackStateProps) {
  const toneClass =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-950'
      : 'border-border bg-surface text-primary';

  return (
    <div className={`rounded-3xl border p-6 text-center sm:p-8 ${toneClass}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 opacity-70">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
