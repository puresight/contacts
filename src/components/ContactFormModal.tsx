import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { STAGES } from '@/lib/stages';
import { STAGE_STYLES } from '@/lib/stages';
import type { Contact, Stage } from '@/db/database';
import { FilledButton } from './ui';

export interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  stage: Stage;
  tags: string[];
  notes: string;
  value: number;
}

const EMPTY: ContactDraft = {
  name: '',
  email: '',
  phone: '',
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
  onClose,
  onSubmit,
}: {
  open: boolean;
  contact?: Contact | null;
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
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        title: contact.title,
        stage: contact.stage,
        tags: [...contact.tags],
        notes: contact.notes,
        value: contact.value,
      });
    } else {
      setDraft(EMPTY);
    }
  }, [open, contact]);

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
    onSubmit({ ...draft, name: draft.name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:max-w-lg md:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {contact ? 'Edit contact' : 'New contact'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
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
          <Field label="Name">
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Jane Doe"
              className={inputCls}
            />
            {showError && <p className="mt-1 text-xs text-rose-600">Name is required.</p>}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input
                type="email"
                value={draft.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@company.com"
                className={inputCls}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company">
              <input
                value={draft.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Inc."
                className={inputCls}
              />
            </Field>
            <Field label="Job title">
              <input
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Product Manager"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Stage">
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('stage', s)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    draft.stage === s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {STAGE_STYLES[s].label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Deal value (USD)">
            <input
              type="number"
              min={0}
              value={draft.value || ''}
              onChange={(e) => set('value', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          <Field label="Tags">
            {draft.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
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
          </Field>

          <Field label="Notes">
            <textarea
              value={draft.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Anything worth remembering…"
              className={inputCls}
            />
          </Field>

          <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-slate-100 bg-white px-5 py-3">
            <FilledButton type="submit" className="w-full">
              {contact ? 'Save changes' : 'Create contact'}
            </FilledButton>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
