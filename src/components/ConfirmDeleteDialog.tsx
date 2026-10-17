import { Trash2 } from 'lucide-react';
import { FilledButton, GhostButton } from './ui';

export function ConfirmDeleteDialog({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-2xl md:rounded-3xl dark:bg-slate-900"
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-400/10">
          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <h2 id="delete-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Delete contact?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:bg-red-800"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
