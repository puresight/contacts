import { useState } from 'react';
import { HardDrive, Database, Info, Download, Trash2, ShieldCheck, Sun, Monitor, Moon, ALargeSmall } from 'lucide-react';
import { db } from '@/db/database';
import { FilledButton, GhostButton } from '@/components/ui';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { useTextSize, type TextSize } from '@/context/TextSizeContext';

export function SettingsView({
  workspaceName,
  counts,
  onDangerDone,
}: {
  workspaceName: string;
  counts: { contacts: number; interactions: number; links: number };
  onDangerDone: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportJson = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      workspaces: await db.workspaces.toArray(),
      contacts: await db.contacts.toArray(),
      interactions: await db.interactions.toArray(),
      entityLinks: await db.entityLinks.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
  };

  const wipe = async () => {
    await db.transaction('rw', db.workspaces, db.contacts, db.interactions, db.entityLinks, async () => {
      await Promise.all([
        db.workspaces.clear(),
        db.contacts.clear(),
        db.interactions.clear(),
        db.entityLinks.clear(),
      ]);
    });
    setConfirming(false);
    setMessage('All data cleared. Reloading with fresh sample data…');
    setTimeout(() => window.location.reload(), 900);
    onDangerDone();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{workspaceName}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Stored locally on this device</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Contacts" value={counts.contacts} />
          <Stat label="Interactions" value={counts.interactions} />
          <Stat label="Suite links" value={counts.links} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <Sun className="h-4 w-4 text-slate-400 dark:text-slate-500" /> Appearance
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Choose light, dark, or follow your device setting. "System" updates automatically when your OS
          switches theme.
        </p>
        <AppearanceOptions />
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <ALargeSmall className="h-4 w-4 text-slate-400 dark:text-slate-500" /> Text size
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Make everything easier to read. The change applies to the entire app instantly.
        </p>
        <TextSizeOptions />
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <Database className="h-4 w-4 text-slate-400 dark:text-slate-500" /> Data &amp; sync
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Everything lives in your browser's local database, so the app works fully offline. Each record is
          flagged for future cloud sync but nothing leaves this device.
        </p>
        <div className="flex flex-wrap gap-2">
          <GhostButton onClick={exportJson}>
            <Download className="h-4 w-4" /> Export backup
          </GhostButton>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Privacy
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          No account, no tracking, no server. Your contacts never leave the device unless you export them.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-100 dark:bg-slate-900 dark:ring-rose-950">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <Trash2 className="h-4 w-4 text-rose-500" /> Danger zone
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Permanently erase every contact, interaction, and link on this device. Sample data will be restored
          on next launch.
        </p>
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <FilledButton
              className="!bg-rose-600 hover:!bg-rose-500 active:!bg-rose-700"
              onClick={wipe}
            >
              Yes, erase everything
            </FilledButton>
            <GhostButton onClick={() => setConfirming(false)}>Cancel</GhostButton>
          </div>
        ) : (
          <GhostButton className="!text-rose-600 hover:!bg-rose-50 dark:!text-rose-400 dark:hover:!bg-rose-950/60" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" /> Clear all data
          </GhostButton>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-xs text-slate-600 dark:text-slate-300">
        <Info className="h-3.5 w-3.5" />
        Local CRM v1.0 · offline-first
      </p>

      {message && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-8 dark:bg-slate-100 dark:text-slate-900">
          {message}
        </div>
      )}
    </div>
  );
}

function AppearanceOptions() {
  const { mode, setMode } = useTheme();
  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="grid max-w-xs grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          role="radio"
          aria-checked={mode === id}
          onClick={() => setMode(id)}
          className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function TextSizeOptions() {
  const { size, setSize } = useTextSize();
  const options: { id: TextSize; label: string }[] = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' },
  ];
  return (
    <div role="radiogroup" aria-label="Text size" className="grid max-w-xs grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map(({ id, label }) => (
        <button
          key={id}
          role="radio"
          aria-checked={size === id}
          onClick={() => setSize(id)}
          className={`flex min-h-[44px] items-center justify-center rounded-lg transition-colors ${
            id === 'small' ? 'text-xs' : id === 'medium' ? 'text-sm' : 'text-base'
          } font-medium ${
            size === id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2.5 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  );
}
