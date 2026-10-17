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
import { STAGE_STYLES, formatMoney, relativeTime } from '@/lib/stages';
import { StageBadge } from './ui';
import { InteractionComposer } from './InteractionComposer';
import { Avatar } from './Avatar';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { Trash2 } from 'lucide-react';

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const primaryEmail = contact.emails[0]?.value;
  const primaryPhone = contact.phones[0]?.value;

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
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 md:px-6 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
          <Avatar name={contact.name} email={primaryEmail} size="md" />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900 dark:text-slate-100">{contact.name}</h2>
            <p className="truncate text-sm text-slate-500">
              {contact.title ? `${contact.title}${contact.company ? ' · ' + contact.company : ''}` : contact.company || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            aria-label="Edit contact"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete contact"
            title="Delete contact"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:bg-red-400/10"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        <div className="mb-4 flex gap-2">
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          )}
          {primaryEmail && (
            <a
              href={`mailto:${primaryEmail}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 active:bg-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          )}
          <button
            onClick={() => setComposing(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
          <div className="flex items-center justify-between">
            <StageBadge stage={contact.stage} />
            {contact.value > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                {formatMoney(contact.value)}
              </span>
            )}
          </div>
          {(contact.company || contact.title) && (
            <dl className="mt-3 space-y-2 text-sm">
              {contact.company && <Row icon={Building2} label="Company" value={contact.company} />}
              {contact.title && <Row icon={Briefcase} label="Title" value={contact.title} />}
            </dl>
          )}
          {contact.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contact.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          {contact.notes && <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{contact.notes}</p>}
        </div>

        <LabeledSections contact={contact} />

        <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['timeline', 'suite'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
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
              <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
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
                        <span className="text-sm font-medium capitalize text-slate-800 dark:text-slate-200">{it.kind}</span>
                        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{relativeTime(it.occurredAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{it.summary}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
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
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-slate-700">
                        <Icon className="h-4 w-4 text-indigo-500" />
                        {l.label}
                      </span>
                      <button
                        onClick={() => removeLink(l.id)}
                        aria-label={`Remove ${l.label}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
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
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
                <CalendarPlus className="h-4 w-4" />
              </span>
              Link Calendar Event
            </button>
            <button
              onClick={() => addLinkStub('kanban')}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                <KanbanSquare className="h-4 w-4" />
              </span>
              Link Kanban Task
            </button>
            <button
              onClick={() => addLinkStub('photo')}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <ImageIcon className="h-4 w-4" />
              </span>
              Attach Photo
            </button>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-400 dark:text-slate-500">
              <Link2 className="h-3.5 w-3.5" />
              Placeholders only — nothing is sent anywhere.
            </p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={contact.name}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            setConfirmDelete(false);
            await db.contacts.update(contact.id, {
              isDeleted: true,
              updatedAt: new Date().toISOString(),
              synced: 0,
            });
            onDeleted(contact.id);
          }}
        />
      )}
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
      <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
      <dt className="shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-right font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function LabelChip({ text }: { text: string }) {
  return (
    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
      {text}
    </span>
  );
}

function dateHint(iso: string): string | null {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setFullYear(today.getFullYear());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function LabeledSections({ contact }: { contact: Contact }) {
  const hasAny =
    contact.emails.length > 0 ||
    contact.phones.length > 0 ||
    contact.urls.length > 0 ||
    contact.addresses.length > 0 ||
    contact.dates.length > 0;

  if (!hasAny) return null;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
      {(contact.emails.length > 0 || contact.phones.length > 0) && (
        <section className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Contact Info
          </h3>
          <ul className="space-y-2">
            {contact.emails.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <LabelChip text={e.label} />
                <a
                  href={`mailto:${e.value}`}
                  className="min-w-0 flex-1 truncate font-medium text-indigo-700 hover:underline dark:text-indigo-300"
                >
                  {e.value}
                </a>
              </li>
            ))}
            {contact.phones.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <LabelChip text={p.label} />
                <a
                  href={`tel:${p.value}`}
                  className="min-w-0 flex-1 truncate font-medium text-slate-800 hover:underline dark:text-slate-200"
                >
                  {p.value}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contact.urls.length > 0 && (
        <section className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Links</h3>
          <ul className="space-y-2">
            {contact.urls.map((u) => (
              <li key={u.id} className="flex items-center gap-2 text-sm">
                <LabelChip text={u.label} />
                <a
                  href={u.value}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate font-medium text-indigo-700 hover:underline dark:text-indigo-300"
                >
                  {u.value.replace(/^https?:\/\//, '')}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contact.addresses.length > 0 && (
        <section className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Locations
          </h3>
          <ul className="space-y-2.5">
            {contact.addresses.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <LabelChip text={a.label} />
                <span className="min-w-0 flex-1 leading-snug text-slate-800 dark:text-slate-200">
                  {a.street && <span className="block">{a.street}</span>}
                  <span className="block text-slate-500 dark:text-slate-400">
                    {[a.city, a.state, a.postalCode].filter(Boolean).join(', ')}
                    {a.country ? (a.city || a.state ? ' · ' : '') + a.country : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {contact.dates.length > 0 && (
        <section className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Important Dates
          </h3>
          <ul className="space-y-2">
            {contact.dates.map((d) => {
              const hint = dateHint(d.date);
              return (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <LabelChip text={d.label} />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(d.date)}
                    {hint && (
                      <span className="ml-1.5 text-xs font-normal text-indigo-500 dark:text-indigo-400">({hint})</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
