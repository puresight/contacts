import { useEffect, useState } from 'react';
import { ensureSeeded } from '@/db/database';

export function useDbReady() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureSeeded()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to open local database');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}
