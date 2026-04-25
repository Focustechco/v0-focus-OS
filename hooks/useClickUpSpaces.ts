'use client';

import { useState, useEffect } from 'react';

export function useClickUpSpaces() {
  const [spaces,    setSpaces]    = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/clickup/spaces')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setSpaces(d.spaces ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { spaces, isLoading, error };
}
