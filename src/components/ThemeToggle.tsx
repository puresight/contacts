import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/hooks/useTheme';

const OPTIONS: Array<{ id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-1 dark:bg-slate-800 ${className}`}
    >
      {OPTIONS.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            title={o.label}
            onClick={() => setMode(o.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              active
                ? 'bg-indigo-600/15 text-indigo-700 dark:bg-indigo-400/25 dark:text-indigo-300'
                : 'text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <o.icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
