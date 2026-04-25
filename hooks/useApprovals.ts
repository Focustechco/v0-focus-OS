'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useApprovals(projectName?: string) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const qs  = projectName ? `?project=${encodeURIComponent(projectName)}` : '';
      const res = await fetch(`/api/aprovacoes${qs}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setApprovals(data.approvals ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    fetchApprovals();

    const ch = supabase
      .channel('approvals-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'approvals',
      }, fetchApprovals)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [fetchApprovals]);

  const decide = async (
    id: string,
    status: 'approved' | 'rejected',
    clickup_task_id?: string,
    notes?: string
  ) => {
    await fetch('/api/aprovacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes, clickup_task_id }),
    });
  };

  const approve = (id: string, tid?: string) => decide(id, 'approved', tid);
  const reject  = (id: string, tid?: string, notes?: string) => decide(id, 'rejected', tid, notes);

  return { approvals, isLoading, error, approve, reject, refetch: fetchApprovals };
}
