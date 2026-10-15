import { useMemo, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Pencil,
  MessageSquare,
  CalendarDays,
  Building2,
  Briefcase,
  DollarSign,
  Link2,
  CalendarPlus,
  KanbanSquare,
  ImageIcon,
  Plus,
} from 'lucide-react';
import type { Contact, EntityLink, Interaction, InteractionKind } from '@/db/database';
import { newEntityLink, newInteraction } from '@/db/database';
import { db } from '@/db/database';
import { STAGE_STYLES, formatMoney, initials, relativeTime } from '@/lib/stages';
import { StageBadge } from './ui';
import { InteractionComposer } from './InteractionComposer';

const KIND_ICON: Record<InteractionKind, React.ComponentType<{ className?: string }>> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: CalendarDays,
};

const KIND_TONE: Record<InteractionKind, string> = {
  note: 'bg-slate-100 text-slate-600',
  call: 'bg-emerald-50 text-emerald-600',
  email: 'bg-indigo-50 text-indigo-600',
  meeting: 'bg-amber-50 text-amber-600',
};

const LINK_META: Record<
  EntityLink['kind'],
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  calendar: { icon: CalendarPlus, label: 'Calendar event' },
  kanban: { icon: KanbanSquare, label: 'Kanban task' },
  photo: { icon: ImageIcon, label: 'Photo' },
};

export function ContactDetailPane({
  contact,
  interactions,
  links,
  onClose,
  onEdit,
  onDeleted,
}: {
  contact: Contact;
  interactions: Interaction[];
  links: EntityLink[];
  onClose: () => void;
  onEdit: (c: Contact) => void;
  onDeleted: (id: string) => void;
}) {
  const [tab, setTab] = useState<'timeline' | 'suite'>('timeline');
  const [composing, setComposing] = useState(false);

  const sorted = useMemo(
    () => [...interactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [interactions],
  );

  const addInteraction = (kind: InteractionKind, summary: string) => {
    db.interactions.add(newInteraction(contact.id, kind, summary));
    setComposing(false);
  };

  const addLinkStub = (kind: EntityLink['kind']) => {
    const label = LINK_META[kind].label;
    db.entityLinks.add(newEntityLink(contact.id, kind, `${label} (preview)`));
  };

  const removeLink = (id: string) => {
    db.entityLinks.update(id, { isDeleted: true, updatedAt: new Date().toISOString(), synced: 0 });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          <Avatar name={contact.name} size="md" />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">{contact.name}</h2>
            <p className="truncate text-sm text-slate-500">
              {contact.title ? `${contact.title}${contact.company ? ' · ' + contact.company : ''}` : contact.company || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            aria-label="Edit contact"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={async () => {
              if (confirm(`Delete ${contact.name}? This cannot be undone.`)) {
                await db.contacts.delete(contact.id);
                onDeleted(contact.id);
              }
            }}
            aria-label="Delete contact"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        <div className="mb-4 flex gap-2">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 active:bg-emerald-200"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-100 active:bg-indigo-200"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          )}
          <button
            onClick={() => setComposing(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200 active:bg-slate-300"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <StageBadge stage={contact.stage} />
            {contact.value > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                {formatMoney(contact.value)}
              </span>
            )}
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {contact.company && (
              <Row icon={Building2} label="Company" value={contact.company} />
            )}
            {contact.title && <Row icon={Briefcase} label="Title" value={contact.title} />}
            {contact.email && <Row icon={Mail} label="Email" value={contact.email} />}
            {contact.phone && <Row icon={Phone} label="Phone" value={contact.phone} />}
          </dl>
          {contact.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contact.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          {contact.notes && <p className="mt-3 text-sm leading-relaxed text-slate-600">{contact.notes}</p>}
        </div>

        <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
          {(['timeline', 'suite'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'timeline' ? 'Timeline' : 'Linked Suite Items'}
            </button>
          ))}
        </div>

        {tab === 'timeline' ? (
          <div className="space-y-3">
            {composing && (
              <InteractionComposer onAdd={addInteraction} onClose={() => setComposing(false)} />
            )}
            {sorted.length === 0 && !composing ? (
              <p className="py-6 text-center text-sm text-slate-400">
                No interactions yet. Log a note, call, email, or meeting.
              </p>
            ) : (
              sorted.map((it) => {
                const Icon = KIND_ICON[it.kind];
                return (
                  <div key={it.id} className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${KIND_TONE[it.kind]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-slate-800">{it.kind}</span>
                        <span className="shrink-0 text-xs text-slate-400">{relativeTime(it.occurredAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">{it.summary}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-2 text-xs text-slate-400">
              iLife suite integrations are coming soon. Placeholders appear here so linking is one tap when
              they land.
            </p>
            {links.length > 0 && (
              <ul className="mb-3 space-y-2">
                {links.map((l) => {
                  const meta = LINK_META[l.kind];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={l.id}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-slate-700">
                        <Icon className="h-4 w-4 text-indigo-500" />
                        {l.label}
                      </span>
                      <button
                        onClick={() => removeLink(l.id)}
                        aria-label={`Remove ${l.label}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              onClick={() => addLinkStub('calendar')}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarPlus className="h-4 w-4" />
              </span>
              Link Calendar Event
            </button>
            <button
              onClick={() => addLinkStub('kanban')}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <KanbanSquare className="h-4 w-4" />
              </span>
              Link Kanban Task
            </button>
            <button
              onClick={() => addLinkStub('photo')}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <ImageIcon className="h-4 w-4" />
              </span>
              Attach Photo
            </button>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
              <Link2 className="h-3.5 w-3.5" />
              Placeholders only — nothing is sent anywhere.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 font-semibold text-white ${cls}`}
    >
      {initials(name)}
    </div>
  );
}
