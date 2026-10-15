import { useMemo, useState } from 'react';
import { Phone, Mail, UserPlus, Users } from 'lucide-react';
import type { Contact, Stage } from '@/db/database';
import { STAGE_STYLES } from '@/lib/stages';
import { StagePills, SearchInput, EmptyState, IconActionButton } from '@/components/ui';
import { Avatar } from '@/components/Avatar';

export function ContactsView({
  contacts,
  onSelect,
  onNew,
}: {
  contacts: Contact[];
  onSelect: (id: string) => void;
  onNew: (prefillName?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts
      .filter((c) => (stage === 'all' ? true : c.stage === stage))
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, query, stage]);

  const q = query.trim();

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} />
      <StagePills value={stage} onChange={setStage} />

      {filtered.length === 0 ? (
        contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            hint="Add your first contact to start tracking calls, emails, and deals."
            action={{ label: 'Add contact', onClick: () => onNew(), icon: UserPlus }}
          />
        ) : q ? (
          <EmptyState
            icon={Users}
            title={`No contacts found for "${q}"`}
            hint="Nothing matches your search. You can create a contact from this name."
            action={{ label: `Create contact "${q}"`, onClick: () => onNew(q), icon: UserPlus }}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No matches"
            hint="Try a different stage filter."
          />
        )
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((c) => (
            <li key={c.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelect(c.id);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70 transition hover:bg-slate-50 active:bg-slate-100"
              >
                <Avatar name={c.name} email={c.email} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{c.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {c.company || c.email || 'No details'}
                  </p>
                  <div className="mt-1.5">
                    <StageBadgeInline stage={c.stage} />
                  </div>
                </div>
                <div
                  className="flex shrink-0 items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconActionButton
                    icon={Phone}
                    label={`Call ${c.name}`}
                    tone="green"
                    onClick={
                      c.phone
                        ? () => {
                            window.location.href = `tel:${c.phone}`;
                          }
                        : () => {}
                    }
                  />
                  <IconActionButton
                    icon={Mail}
                    label={`Email ${c.name}`}
                    tone="indigo"
                    onClick={
                      c.email
                        ? () => {
                            window.location.href = `mailto:${c.email}`;
                          }
                        : () => {}
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StageBadgeInline({ stage }: { stage: Stage }) {
  const s = STAGE_STYLES[stage];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
