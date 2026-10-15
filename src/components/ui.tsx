import { Plus, Search } from 'lucide-react';
import { STAGE_STYLES } from '@/lib/stages';
import type { Stage } from '@/db/database';

export function StageBadge({ stage }: { stage: Stage }) {
  const s = STAGE_STYLES[stage];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function StagePills({
  value,
  onChange,
}: {
  value: Stage | 'all';
  onChange: (v: Stage | 'all') => void;
}) {
  const options: Array<Stage | 'all'> = ['all', 'lead', 'prospect', 'active', 'personal'];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === opt
              ? 'bg-indigo-600 text-white shadow-none'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
          }`}
        >
          {opt === 'all' ? 'All' : STAGE_STYLES[opt].label}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search contacts…'}
        className="w-full rounded-full border-0 bg-slate-100 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"
        >
          <Search className="h-4 w-4 rotate-45" />
        </button>
      )}
    </div>
  );
}

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {typeof count === 'number' && <span className="text-xs text-slate-400">{count}</span>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  action?: { label: string; onClick: () => void; icon?: React.ComponentType<{ className?: string }> };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-100/70 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-slate-500">{hint}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:bg-indigo-700"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

export function FilledButton({
  children,
  onClick,
  type = 'button',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function TonalButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-100 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200 active:bg-indigo-300 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:bg-slate-300 ${className}`}
    >
      {children}
    </button>
  );
}

export function IconActionButton({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'green' | 'indigo';
}) {
  const tones = {
    default: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    green: 'text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100',
    indigo: 'text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100',
  };
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={onClick === undefined || onClick === null}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition disabled:opacity-40 ${tones[tone]}`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

export function FabPlus({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="New contact"
      className="fixed bottom-20 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-95 active:bg-indigo-700 md:hidden"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
