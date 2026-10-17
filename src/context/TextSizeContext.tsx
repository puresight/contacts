import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type TextSize = 'small' | 'medium' | 'large';

const STORAGE_KEY = 'ilife-crm-text-size';

const ROOT_FONT_SIZE: Record<TextSize, string> = {
  small: '100%',
  medium: '112.5%',
  large: '125%',
};

function readStored(): TextSize {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'small' || v === 'medium' || v === 'large') return v;
  } catch {
    /* storage unavailable */
  }
  return 'small';
}

const TextSizeContext = createContext<{ size: TextSize; setSize: (s: TextSize) => void } | null>(null);

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSizeState] = useState<TextSize>(readStored);

  useEffect(() => {
    document.documentElement.style.fontSize = ROOT_FONT_SIZE[size];
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      /* storage unavailable */
    }
  }, [size]);

  const setSize = useCallback((s: TextSize) => setSizeState(s), []);

  return <TextSizeContext.Provider value={{ size, setSize }}>{children}</TextSizeContext.Provider>;
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error('useTextSize must be used within a TextSizeProvider');
  return ctx;
}
