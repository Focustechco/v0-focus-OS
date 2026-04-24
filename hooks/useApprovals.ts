import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';


export function useApprovals(projectId?: string) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('approvals')
        .select('*, clickup_tasks_cache(*)');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: err } = await query.order('created_at', { ascending: false });

      if (err) throw err;
      setApprovals(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const approve = async (id: string, notes?: string) => {
    const { error: err } = await supabase
      .from('approvals')
      .update({ status: 'approved', notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (err) throw err;
    // The realtime subscription will update the list
  };

  const reject = async (id: string, notes?: string) => {
    const { error: err } = await supabase
      .from('approvals')
      .update({ status: 'rejected', notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (err) throw err;
  };

  useEffect(() => {
    fetchApprovals();

    const channel = supabase
      .channel('approvals_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'approvals' },
        () => fetchApprovals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { approvals, approve, reject, isLoading, error, refetch: fetchApprovals };
}
