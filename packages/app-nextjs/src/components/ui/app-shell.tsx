import type { ReactNode } from 'react';
import { AppHeader } from './app-header';

interface AppShellProps {
  children: ReactNode;
  evaluationHref?: string;
  profilesHref?: string;
  configHref?: string;
}

export function AppShell({ children, evaluationHref, profilesHref, configHref }: AppShellProps) {
  return (
    <div className="min-h-screen bg-app text-text">
      <AppHeader
        evaluationHref={evaluationHref}
        profilesHref={profilesHref}
        configHref={configHref}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
