import { useMemo } from 'react';
import { Mail, MessageSquare, Phone, CalendarDays, Activity as ActivityIcon } from 'lucide-react';
import type { Contact, Interaction } from '@/db/database';
import { relativeTime } from '@/lib/stages';
import { EmptyState } from '@/components/ui';

const KIND_ICON = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
} as const;

const KIND_TONE: Record<keyof typeof KIND_ICON, string> = {
  note: 'bg-slate-100 text-slate-600',
  call: 'bg-momentum-50 text-momentum-700',
  email: 'bg-indigo-50 text-indigo-600',
  meeting: 'bg-attention-50 text-attention-700',
};

export function ActivityView({
  interactions,
  contacts,
  onSelect,
}: {
  interactions: Interaction[];
  contacts: Contact[];
  onSelect: (id: string) => void;
}) {
  const contactName = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of contacts) map.set(c.id, c.name);
    return map;
  }, [contacts]);

  const sorted = useMemo(
    () => [...interactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [interactions],
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No activity yet"
        hint="Log calls, emails, notes, and meetings from any contact to build the timeline."
      />
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-4 ml-2 dark:border-slate-800">
      {sorted.map((it) => {
        const Icon = KIND_ICON[it.kind];
        return (
          <li key={it.id} className="relative">
            <span
              className={`absolute -left-[26px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-slate-50 dark:ring-slate-950 ${KIND_TONE[it.kind]}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <button
              onClick={() => onSelect(it.contactId)}
              className="w-full rounded-2xl bg-white p-3.5 text-left ring-1 ring-slate-200 transition hover:ring-indigo-300 hover:shadow-glow active:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-indigo-800 dark:hover:shadow-glow-lg"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {contactName.get(it.contactId) ?? 'Unknown contact'}
                </p>
                <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{relativeTime(it.occurredAt)}</span>
              </div>
              <span className="mt-0.5 block text-xs font-medium capitalize text-indigo-600 dark:text-indigo-400">
                {it.kind}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{it.summary}</p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
