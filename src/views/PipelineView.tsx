import { useMemo } from 'react';
import type { Contact } from '@/db/database';
import { STAGES, STAGE_STYLES, formatMoney } from '@/lib/stages';
import { EmptyState } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { LayoutGrid } from 'lucide-react';

export function PipelineView({
  contacts,
  onSelect,
}: {
  contacts: Contact[];
  onSelect: (id: string) => void;
}) {
  const columns = useMemo(() => {
    const map = new Map<string, Contact[]>(STAGES.map((s) => [s, []]));
    for (const c of contacts) map.get(c.stage)?.push(c);
    for (const s of STAGES) map.get(s)!.sort((a, b) => b.value - a.value);
    return map;
  }, [contacts]);

  const total = useMemo(
    () =>
      STAGES.reduce(
        (sum, s) => sum + (s === 'personal' ? 0 : columns.get(s)!.reduce((a, c) => a + c.value, 0)),
        0,
      ),
    [columns],
  );

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="Pipeline is empty"
        hint="Add contacts and set their stage to see them appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3.5 text-white shadow-sm dark:from-indigo-700 dark:to-indigo-600">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-100">Open pipeline</p>
          <p className="text-xl font-semibold">{formatMoney(total)}</p>
        </div>
        <div className="text-right text-xs text-indigo-100">
          {contacts.filter((c) => c.stage !== 'personal').length} contacts
          <br />
          across {STAGES.length - 1} stages
        </div>
      </div>

      <div className="space-y-3">
        {STAGES.map((s) => {
          const items = columns.get(s)!;
          const stageTotal = items.reduce((a, c) => a + c.value, 0);
          return (
            <div key={s} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <span className={`h-2 w-2 rounded-full ${STAGE_STYLES[s].dot}`} />
                  {STAGE_STYLES[s].label}
                </span>
                <span className="text-xs text-slate-400">
                  {items.length} {s !== 'personal' ? `· ${formatMoney(stageTotal)}` : ''}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="px-1 py-2 text-xs text-slate-400 dark:text-slate-500">Nothing here yet.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => onSelect(c.id)}
                        className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-left ring-1 ring-slate-100 transition hover:bg-indigo-50 hover:ring-indigo-200 active:bg-indigo-100 dark:bg-slate-800/60 dark:ring-slate-700 dark:hover:bg-indigo-950/40 dark:hover:ring-indigo-900 dark:active:bg-indigo-950/60"
                      >
                        <Avatar name={c.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                          <p className="truncate text-xs text-slate-500">{c.company || c.emails[0]?.value || '—'}</p>
                        </div>
                        {c.value > 0 && (
                          <span className="shrink-0 text-sm font-semibold text-emerald-600">
                            {formatMoney(c.value)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
