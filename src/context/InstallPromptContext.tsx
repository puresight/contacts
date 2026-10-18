import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallContext = createContext<{
  canInstall: boolean;
  installed: boolean;
  promptInstall: () => void;
} | null>(null);

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(() => {
    if (!event) return;
    event.prompt().then(() => event.userChoice).finally(() => setEvent(null));
  }, [event]);

  return (
    <InstallContext.Provider value={{ canInstall: !!event && !installed, installed, promptInstall }}>
      {children}
    </InstallContext.Provider>
  );
}

export function useInstallPrompt() {
  const ctx = useContext(InstallContext);
  if (!ctx) throw new Error('useInstallPrompt must be used within an InstallPromptProvider');
  return ctx;
}
