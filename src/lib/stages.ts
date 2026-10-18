import type { Stage } from '@/db/database';

export const STAGES: Stage[] = ['lead', 'prospect', 'active', 'personal'];

export const STAGE_STYLES: Record<Stage, { label: string; badge: string; dot: string }> = {
  lead: {
    label: 'Lead',
    badge:
      'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
  prospect: {
    label: 'Prospect',
    badge:
      'bg-attention-50 text-attention-800 ring-1 ring-attention-200 dark:bg-attention-950/60 dark:text-attention-200 dark:ring-attention-900',
    dot: 'bg-attention-500',
  },
  active: {
    label: 'Active',
    badge:
      'bg-momentum-50 text-momentum-800 ring-1 ring-momentum-200 dark:bg-momentum-950/60 dark:text-momentum-200 dark:ring-momentum-900',
    dot: 'bg-momentum-500',
  },
  personal: {
    label: 'Personal',
    badge:
      'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900',
    dot: 'bg-indigo-500',
  },
};

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}
