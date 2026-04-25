'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useClickUpTasks(listId: string) {
  const [tasks,     setTasks]     = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync,  setLastSync]  = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!listId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/clickup/tasks?listId=${listId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTasks(data.tasks ?? []);
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    if (!listId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    fetchTasks();

    // Realtime: quando o cache do Supabase mudar, refetch
    const ch = supabase
      .channel(`tasks-${listId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clickup_tasks_cache',
        filter: `list_id=eq.${listId}`,
      }, fetchTasks)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [listId, fetchTasks]);

  const updateStatus = async (taskId: string, status: string) => {
    await fetch(`/api/clickup/task/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  return { tasks, isLoading, lastSync, error, refetch: fetchTasks, updateStatus };
}
