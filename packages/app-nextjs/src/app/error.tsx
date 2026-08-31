'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app text-stone-950">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-600">500</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Une erreur est survenue</h1>
      <Link
        href="/"
        className="mt-8 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
      >
        ← Retour à l'évaluation
      </Link>
    </main>
  );
}
