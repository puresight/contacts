import { Trash2, Plus, Globe, Mail, Phone, MapPin, CalendarDays } from 'lucide-react';
import { uuid } from '@/db/database';
import type {
  LabeledAddress,
  LabeledDate,
  LabeledEmail,
  LabeledPhone,
  LabeledUrl,
} from '@/db/database';

export const EMAIL_LABELS = ['work', 'home', 'other'] as const;
export const PHONE_LABELS = ['mobile', 'work', 'home', 'other'] as const;
export const URL_LABELS = ['work', 'website', 'portfolio', 'payment', 'other'] as const;
export const ADDRESS_LABELS = ['home', 'work', 'shipping', 'other'] as const;
export const DATE_LABELS = ['birthday', 'anniversary', 'death', 'transaction', 'other'] as const;

const inputCls =
  'w-full min-w-0 rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500';

const selectCls =
  'shrink-0 appearance-none rounded-full border-0 bg-indigo-50 py-2 pl-3 pr-8 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900 bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%234f46e5%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat';

function Row({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove entry"
        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function LabelSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
      aria-label="Entry label"
    >
      {options.map((o) => (
        <option key={o} value={o} className="font-normal text-slate-800">
          {o.charAt(0).toUpperCase() + o.slice(1)}
        </option>
      ))}
    </select>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 active:bg-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 dark:active:bg-indigo-900"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function EmptyHint({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
      <span className="text-xs text-slate-400 dark:text-slate-500">{text}</span>
      {children}
    </div>
  );
}

export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <Icon className="h-4 w-4 text-indigo-500" />
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export function EmailsEditor({
  emails,
  onChange,
}: {
  emails: LabeledEmail[];
  onChange: (next: LabeledEmail[]) => void;
}) {
  return (
    <>
      {emails.length === 0 && (
        <EmptyHint text="No email addresses yet.">
          <AddButton label="Add Email" onClick={() => onChange([...emails, { id: uuid(), label: 'work', value: '' }])} />
        </EmptyHint>
      )}
      {emails.map((e, i) => (
        <Row key={e.id} onRemove={() => onChange(emails.filter((x) => x.id !== e.id))}>
          <LabelSelect
            value={e.label}
            options={EMAIL_LABELS}
            onChange={(label) =>
              onChange(emails.map((x) => (x.id === e.id ? { ...x, label: label as LabeledEmail['label'] } : x)))
            }
          />
          <input
            type="email"
            value={e.value}
            onChange={(ev) => onChange(emails.map((x) => (x.id === e.id ? { ...x, value: ev.target.value } : x)))}
            placeholder="name@example.com"
            className={inputCls}
            data-autofocus={i === 0 && emails.length === 1 && e.value === '' ? 'true' : undefined}
          />
        </Row>
      ))}
      {emails.length > 0 && (
        <AddButton label="Add Email" onClick={() => onChange([...emails, { id: uuid(), label: 'work', value: '' }])} />
      )}
    </>
  );
}

export function PhonesEditor({
  phones,
  onChange,
}: {
  phones: LabeledPhone[];
  onChange: (next: LabeledPhone[]) => void;
}) {
  return (
    <>
      {phones.length === 0 && (
        <EmptyHint text="No phone numbers yet.">
          <AddButton label="Add Phone" onClick={() => onChange([...phones, { id: uuid(), label: 'mobile', value: '' }])} />
        </EmptyHint>
      )}
      {phones.map((p) => (
        <Row key={p.id} onRemove={() => onChange(phones.filter((x) => x.id !== p.id))}>
          <LabelSelect
            value={p.label}
            options={PHONE_LABELS}
            onChange={(label) =>
              onChange(phones.map((x) => (x.id === p.id ? { ...x, label: label as LabeledPhone['label'] } : x)))
            }
          />
          <input
            type="tel"
            value={p.value}
            onChange={(ev) => onChange(phones.map((x) => (x.id === p.id ? { ...x, value: ev.target.value } : x)))}
            placeholder="+1 (555) 000-0000"
            className={inputCls}
          />
        </Row>
      ))}
      {phones.length > 0 && (
        <AddButton label="Add Phone" onClick={() => onChange([...phones, { id: uuid(), label: 'mobile', value: '' }])} />
      )}
    </>
  );
}

export function UrlsEditor({
  urls,
  onChange,
}: {
  urls: LabeledUrl[];
  onChange: (next: LabeledUrl[]) => void;
}) {
  return (
    <>
      {urls.length === 0 && (
        <EmptyHint text="No links yet.">
          <AddButton label="Add Link" onClick={() => onChange([...urls, { id: uuid(), label: 'website', value: '' }])} />
        </EmptyHint>
      )}
      {urls.map((u) => (
        <Row key={u.id} onRemove={() => onChange(urls.filter((x) => x.id !== u.id))}>
          <LabelSelect
            value={u.label}
            options={URL_LABELS}
            onChange={(label) =>
              onChange(urls.map((x) => (x.id === u.id ? { ...x, label: label as LabeledUrl['label'] } : x)))
            }
          />
          <input
            type="url"
            value={u.value}
            onChange={(ev) => onChange(urls.map((x) => (x.id === u.id ? { ...x, value: ev.target.value } : x)))}
            placeholder="https://…"
            className={inputCls}
          />
        </Row>
      ))}
      {urls.length > 0 && (
        <AddButton label="Add Link" onClick={() => onChange([...urls, { id: uuid(), label: 'website', value: '' }])} />
      )}
    </>
  );
}

export function AddressesEditor({
  addresses,
  onChange,
}: {
  addresses: LabeledAddress[];
  onChange: (next: LabeledAddress[]) => void;
}) {
  const empty = (): LabeledAddress => ({
    id: uuid(),
    label: 'home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  return (
    <>
      {addresses.length === 0 && (
        <EmptyHint text="No addresses yet.">
          <AddButton label="Add Address" onClick={() => onChange([...addresses, empty()])} />
        </EmptyHint>
      )}
      {addresses.map((a) => (
        <Row key={a.id} onRemove={() => onChange(addresses.filter((x) => x.id !== a.id))}>
          <LabelSelect
            value={a.label}
            options={ADDRESS_LABELS}
            onChange={(label) =>
              onChange(addresses.map((x) => (x.id === a.id ? { ...x, label: label as LabeledAddress['label'] } : x)))
            }
          />
          <input
            value={a.street}
            onChange={(ev) => onChange(addresses.map((x) => (x.id === a.id ? { ...x, street: ev.target.value } : x)))}
            placeholder="Street"
            className={inputCls}
          />
          <div className="flex w-full grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input
              value={a.city}
              onChange={(ev) => onChange(addresses.map((x) => (x.id === a.id ? { ...x, city: ev.target.value } : x)))}
              placeholder="City"
              className={inputCls}
            />
            <input
              value={a.state}
              onChange={(ev) => onChange(addresses.map((x) => (x.id === a.id ? { ...x, state: ev.target.value } : x)))}
              placeholder="State"
              className={inputCls}
            />
            <input
              value={a.postalCode}
              onChange={(ev) => onChange(addresses.map((x) => (x.id === a.id ? { ...x, postalCode: ev.target.value } : x)))}
              placeholder="ZIP"
              className={inputCls}
            />
            <input
              value={a.country}
              onChange={(ev) => onChange(addresses.map((x) => (x.id === a.id ? { ...x, country: ev.target.value } : x)))}
              placeholder="Country"
              className={`sm:col-span-2 ${inputCls}`}
            />
          </div>
        </Row>
      ))}
      {addresses.length > 0 && <AddButton label="Add Address" onClick={() => onChange([...addresses, empty()])} />}
    </>
  );
}

export function DatesEditor({
  dates,
  onChange,
}: {
  dates: LabeledDate[];
  onChange: (next: LabeledDate[]) => void;
}) {
  return (
    <>
      {dates.length === 0 && (
        <EmptyHint text="No important dates yet.">
          <AddButton label="Add Date" onClick={() => onChange([...dates, { id: uuid(), label: 'birthday', date: '' }])} />
        </EmptyHint>
      )}
      {dates.map((d) => (
        <Row key={d.id} onRemove={() => onChange(dates.filter((x) => x.id !== d.id))}>
          <LabelSelect
            value={d.label}
            options={DATE_LABELS}
            onChange={(label) =>
              onChange(dates.map((x) => (x.id === d.id ? { ...x, label: label as LabeledDate['label'] } : x)))
            }
          />
          <input
            type="date"
            value={d.date}
            onChange={(ev) => onChange(dates.map((x) => (x.id === d.id ? { ...x, date: ev.target.value } : x)))}
            className={inputCls}
          />
        </Row>
      ))}
      {dates.length > 0 && (
        <AddButton label="Add Date" onClick={() => onChange([...dates, { id: uuid(), label: 'birthday', date: '' }])} />
      )}
    </>
  );
}

export const SECTION_ICONS = { Mail, Phone, Globe, MapPin, CalendarDays };
