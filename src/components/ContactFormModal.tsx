import { useEffect, useState } from 'react';
import { X, Mail, Phone, Globe, MapPin, CalendarDays } from 'lucide-react';
import { STAGES, STAGE_STYLES } from '@/lib/stages';
import type { Contact, Stage } from '@/db/database';
import { FilledButton } from './ui';
import {
  SectionCard,
  EmailsEditor,
  PhonesEditor,
  UrlsEditor,
  AddressesEditor,
  DatesEditor,
} from './LabeledFieldEditors';

export interface ContactDraft {
  name: string;
  emails: Contact['emails'];
  phones: Contact['phones'];
  urls: Contact['urls'];
  addresses: Contact['addresses'];
  dates: Contact['dates'];
  company: string;
  title: string;
  stage: Stage;
  tags: string[];
  notes: string;
  value: number;
}

const EMPTY: ContactDraft = {
  name: '',
  emails: [],
  phones: [],
  urls: [],
  addresses: [],
  dates: [],
  company: '',
  title: '',
  stage: 'lead',
  tags: [],
  notes: '',
  value: 0,
};

export function ContactFormModal({
  open,
  contact,
  prefillName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  contact?: Contact | null;
  prefillName?: string | null;
  onClose: () => void;
  onSubmit: (draft: ContactDraft) => void;
}) {
  const [draft, setDraft] = useState<ContactDraft>(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowError(false);
    setTagInput('');
    if (contact) {
      setDraft({
        name: contact.name,
        emails: contact.emails.map((x) => ({ ...x })),
        phones: contact.phones.map((x) => ({ ...x })),
        urls: contact.urls.map((x) => ({ ...x })),
        addresses: contact.addresses.map((x) => ({ ...x })),
        dates: contact.dates.map((x) => ({ ...x })),
        company: contact.company,
        title: contact.title,
        stage: contact.stage,
        tags: [...contact.tags],
        notes: contact.notes,
        value: contact.value,
      });
    } else {
      setDraft(prefillName ? { ...EMPTY, name: prefillName } : EMPTY);
    }
  }, [open, contact, prefillName]);

  if (!open) return null;

  const set = <K extends keyof ContactDraft>(key: K, val: ContactDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !draft.tags.includes(t)) set('tags', [...draft.tags, t]);
    setTagInput('');
  };

  const submit = () => {
    if (!draft.name.trim()) {
      setShowError(true);
      return;
    }
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      emails: draft.emails.filter((e) => e.value.trim()),
      phones: draft.phones.filter((p) => p.value.trim()),
      urls: draft.urls.filter((u) => u.value.trim()),
      addresses: draft.addresses.filter(
        (a) => a.street.trim() || a.city.trim() || a.postalCode.trim(),
      ),
      dates: draft.dates.filter((d) => d.date),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className="relative z-10 h-full max-h-full w-full overflow-y-auto bg-white p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl md:h-auto md:max-h-[92vh] md:max-w-lg md:rounded-3xl md:pb-5 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {contact ? 'Edit contact' : 'New contact'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <SectionCard icon={X} title="Identity">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                autoFocus
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Full name"
                className={inputCls}
              />
              <input
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Job title"
                className={inputCls}
              />
              <input
                value={draft.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Company"
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                value={draft.value || ''}
                onChange={(e) => set('value', Math.max(0, Number(e.target.value) || 0))}
                placeholder="Deal value (USD)"
                className={inputCls}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {STAGES.map((s) => {
                const active = draft.stage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('stage', s)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? 'bg-white' : STAGE_STYLES[s].dot
                      }`}
                    />
                    {STAGE_STYLES[s].label}
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard icon={Mail} title="Emails">
            <EmailsEditor emails={draft.emails} onChange={(emails) => set('emails', emails)} />
          </SectionCard>

          <SectionCard icon={Phone} title="Phones">
            <PhonesEditor phones={draft.phones} onChange={(phones) => set('phones', phones)} />
          </SectionCard>

          <SectionCard icon={Globe} title="Links">
            <UrlsEditor urls={draft.urls} onChange={(urls) => set('urls', urls)} />
          </SectionCard>

          <SectionCard icon={MapPin} title="Addresses">
            <AddressesEditor
              addresses={draft.addresses}
              onChange={(addresses) => set('addresses', addresses)}
            />
          </SectionCard>

          <SectionCard icon={CalendarDays} title="Important Dates">
            <DatesEditor dates={draft.dates} onChange={(dates) => set('dates', dates)} />
          </SectionCard>

          <SectionCard icon={X} title="Tags & Notes">
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draft.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => set('tags', draft.tags.filter((x) => x !== t))}
                      aria-label={`Remove tag ${t}`}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder="Type a tag and press Enter"
              className={inputCls}
            />
            <textarea
              value={draft.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Anything worth remembering…"
              className={inputCls}
            />
          </SectionCard>

          <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-slate-100 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
            <FilledButton type="submit" className="w-full">
              {contact ? 'Save changes' : 'Create contact'}
            </FilledButton>
            {showError && <p className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400">Name is required.</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500';
