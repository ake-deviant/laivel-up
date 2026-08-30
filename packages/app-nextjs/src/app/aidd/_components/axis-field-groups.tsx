import type { AxisFieldGroupViewModel } from '@laivel-up/core';

function formatFieldValue(name: string, value: number | boolean | null) {
  if (value === null) return 'Non collecté';
  if (typeof value === 'boolean') return value ? 'Présent' : 'Absent';
  if (name.toLowerCase().includes('ratio') || ['xs', 's', 'm', 'l', 'xl'].includes(name)) {
    return `${Math.round(value * 100)} %`;
  }
  if (name === 'claudeMd' || name === 'agentsMd' || name === 'settingsJson') {
    return value === 1 ? 'Présent' : 'Absent';
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

export function AxisFieldGroups({ groups }: { groups: AxisFieldGroupViewModel[] }) {
  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <section key={group.name} aria-labelledby={`field-group-${group.name}`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 id={`field-group-${group.name}`} className="text-xl font-semibold text-stone-950">
              {group.label}
            </h2>
            <span className="text-xs font-semibold text-stone-400">
              {group.fields.length} donnée{group.fields.length > 1 ? 's' : ''}
            </span>
          </div>
          <dl className="divide-y divide-stone-100 overflow-hidden rounded-[24px] border border-stone-200 bg-white px-6 shadow-[0_18px_45px_-38px_rgba(41,37,36,0.55)]">
            {group.fields.map((field) => (
              <div key={field.name} className="grid grid-cols-[1fr_180px] gap-10 py-5">
                <div>
                  <dt className="font-semibold text-stone-900">{field.label}</dt>
                  <dd className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500">
                    {field.description}
                  </dd>
                </div>
                <dd
                  className={`self-center justify-self-end rounded-xl px-3.5 py-2 text-sm font-bold tabular-nums ${
                    field.value === null
                      ? 'bg-stone-100 text-stone-500'
                      : 'bg-lime-100 text-stone-950'
                  }`}
                >
                  {formatFieldValue(field.name, field.value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
