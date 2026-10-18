import { useState } from 'react';
import { Mail, MessageSquare, Phone, CalendarDays, X } from 'lucide-react';
import type { InteractionKind } from '@/db/database';
import { FilledButton } from './ui';

const PRESETS: Array<{
  kind: InteractionKind;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}> = [
  { kind: 'note', label: 'Note', icon: MessageSquare, tone: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
  { kind: 'call', label: 'Call', icon: Phone, tone: 'text-momentum-700 bg-momentum-50 dark:text-momentum-300 dark:bg-momentum-950/60' },
  { kind: 'email', label: 'Email', icon: Mail, tone: 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60' },
  { kind: 'meeting', label: 'Meeting', icon: CalendarDays, tone: 'text-attention-700 bg-attention-50 dark:text-attention-200 dark:bg-attention-950/60' },
];

export function InteractionComposer({
  onAdd,
  onClose,
}: {
  onAdd: (kind: InteractionKind, summary: string) => void;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<InteractionKind>('note');
  const [summary, setSummary] = useState('');

  const submit = () => {
    if (!summary.trim()) return;
    onAdd(kind, summary.trim());
    setSummary('');
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRESETS.map((p) => (
            <button
              key={p.kind}
              onClick={() => setKind(p.kind)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                kind === p.kind
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : `${p.tone} hover:brightness-95`
              }`}
            >
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          aria-label="Close composer"
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
        }}
        rows={2}
        placeholder="What happened?"
        className="w-full resize-none rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500"
      />
      <div className="mt-2 flex justify-end">
        <FilledButton onClick={submit} className="!py-2 !px-3 text-xs">
          Log {PRESETS.find((p) => p.kind === kind)?.label.toLowerCase()}
        </FilledButton>
      </div>
    </div>
  );
}
