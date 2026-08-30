import type { DeveloperProfileSummary } from '@laivel-up/core';

const SOURCE_LABEL: Record<string, string> = {
  gitActivity: 'Git',
  sprintMetrics: 'Vélocité',
  repoContext: 'Contexte',
  pullRequests: 'PRs',
  sonar: 'Sonar',
  declarative: 'Déclaratif',
  session: 'Session',
  code: 'Code',
};

export function ProfileCard({
  profile,
  onSelect,
}: {
  profile: DeveloperProfileSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(profile.id)}
      className="group w-full text-left rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_55px_-38px_rgba(41,37,36,0.35)] transition hover:border-stone-400 hover:shadow-[0_20px_55px_-30px_rgba(41,37,36,0.45)]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{profile.id}</p>

      {profile.role && (
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{profile.role}</h3>
      )}

      <p className="mt-1 text-sm text-stone-400">
        {[
          profile.experienceYears ? `${profile.experienceYears} ans` : null,
          profile.teamSize ? `équipe ${profile.teamSize}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>

      {profile.stack && profile.stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {profile.availableSources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.availableSources.map((source) => (
            <span
              key={source}
              className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-medium text-lime-700"
            >
              {SOURCE_LABEL[source] ?? source}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
