import { useState } from 'react';
import { HardDrive, Database, Info, Download, Upload, Trash2, ShieldCheck } from 'lucide-react';
import { db } from '@/db/database';
import { FilledButton, GhostButton } from '@/components/ui';

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
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{workspaceName}</p>
            <p className="text-sm text-slate-500">Stored locally on this device</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Contacts" value={counts.contacts} />
          <Stat label="Interactions" value={counts.interactions} />
          <Stat label="Suite links" value={counts.links} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900">
          <Database className="h-4 w-4 text-slate-400" /> Data &amp; sync
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-500">
          Everything lives in your browser's local database, so the app works fully offline. Each record is
          flagged for future cloud sync but nothing leaves this device.
        </p>
        <div className="flex flex-wrap gap-2">
          <GhostButton onClick={exportJson}>
            <Download className="h-4 w-4" /> Export backup
          </GhostButton>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Privacy
        </p>
        <p className="text-sm leading-relaxed text-slate-500">
          No account, no tracking, no server. Your contacts never leave the device unless you export them.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-rose-100">
        <p className="mb-1 flex items-center gap-2 font-medium text-slate-900">
          <Trash2 className="h-4 w-4 text-rose-500" /> Danger zone
        </p>
        <p className="mb-3 text-sm leading-relaxed text-slate-500">
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
          <GhostButton className="!text-rose-600 !ring-rose-200 hover:!bg-rose-50" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" /> Clear all data
          </GhostButton>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-xs text-slate-400">
        <Info className="h-3.5 w-3.5" />
        Local CRM v1.0 · offline-first
      </p>

      {message && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-8">
          {message}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2.5 ring-1 ring-slate-100">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
