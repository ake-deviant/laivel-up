'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppHeaderProps {
  evaluationHref?: string;
  profilesHref?: string;
  configHref?: string;
}

export function AppHeader({
  evaluationHref = '/',
  profilesHref = '/profiles',
  configHref = '/config',
}: AppHeaderProps) {
  const pathname = usePathname();
  const links = [
    { href: evaluationHref, label: 'Évaluation', active: pathname === evaluationHref },
    { href: profilesHref, label: 'Profils', active: pathname === profilesHref },
    { href: configHref, label: 'Configuration', active: pathname === configHref },
  ];

  return (
    <header className="border-b border-stone-800 bg-primary text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={evaluationHref} className="flex min-w-0 items-center gap-3 rounded-lg">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-black text-primary">
            LU
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight">Laivel Up</span>
            <span className="hidden truncate text-xs text-stone-400 sm:block">
              AI-Driven Development
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1 rounded-xl bg-stone-900 p-1"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${
                link.active
                  ? 'bg-white text-primary'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
