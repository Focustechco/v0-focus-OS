import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClickUpSprint } from '@/lib/clickup-types';


export function useClickUpSprints(listId: string) {
  const [sprints, setSprints] = useState<ClickUpSprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSprints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clickup/sprints?listId=${listId}`);
      if (!response.ok) throw new Error('Failed to fetch sprints');
      const data = await response.json();
      setSprints(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!listId) return;

    fetchSprints();

    // Subscribe to Realtime changes in the cache
    const channel = supabase
      .channel('clickup_tasks_cache_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clickup_tasks_cache',
          filter: `list_id=eq.${listId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Instead of refetching everything, we could update the specific task
          // For simplicity in this example, we refetch to keep UI consistent with ClickUp state
          fetchSprints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);

  return { sprints, isLoading, error, refetch: fetchSprints };
}
