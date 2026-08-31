import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app text-stone-950">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-700">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page introuvable</h1>
      <Link
        href="/"
        className="mt-8 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-900"
      >
        ← Retour à l'évaluation
      </Link>
    </main>
  );
}
