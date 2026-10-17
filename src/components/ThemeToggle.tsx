import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';

const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

const META: Record<ThemeMode, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  system: { label: 'System', icon: Monitor },
  light: { label: 'Light', icon: Sun },
  dark: { label: 'Dark', icon: Moon },
};

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, cycleMode } = useTheme();
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const { label, icon: Icon } = META[mode];

  return (
    <button
      onClick={cycleMode}
      aria-label={`Theme: ${label} (click for ${META[next].label})`}
      title={`Theme: ${label} (click for ${META[next].label})`}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors ${className}`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
