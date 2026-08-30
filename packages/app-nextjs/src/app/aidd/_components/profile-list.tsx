'use client';

import { useEffect, useState } from 'react';
import type { DeveloperProfileSummary } from '@laivel-up/core';
import { ProfileCard } from './profile-card';

export function ProfileList({ onSelect }: { onSelect: (id: string) => void }) {
  const [profiles, setProfiles] = useState<DeveloperProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profiles')
      .then((res) => res.json())
      .then((data: DeveloperProfileSummary[]) => setProfiles(data))
      .catch(() => setProfiles([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="mt-14 border-t border-stone-300 pt-8">
        <p className="text-sm text-stone-400">Chargement des profils…</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="mt-14 border-t border-stone-300 pt-8">
        <p className="text-sm text-stone-400">Aucun profil disponible.</p>
      </div>
    );
  }

  return (
    <section className="mt-14 border-t border-stone-300 pt-8">
      <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
        Profils disponibles
      </p>
      <div className="grid grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
