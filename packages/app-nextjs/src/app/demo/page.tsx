import { AppShell } from '../../components/ui/app-shell';

export default function DemoPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Démonstration
          </p>
          <h1 className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
            Laivel Up en action
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
            Découvrez comment Laivel Up analyse les signaux d&apos;un profil, explique son niveau
            AI-Driven Development et propose des pistes de progression concrètes.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-black shadow-xl">
          <video className="aspect-video w-full" controls preload="metadata" playsInline>
            <source src="/demo.mp4" type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
          </video>
        </div>
      </section>
    </AppShell>
  );
}
