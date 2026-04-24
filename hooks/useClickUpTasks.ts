import { useState, useEffect } from 'react';
import { ClickUpTask } from '@/lib/clickup-types';

export function useClickUpTasks(listId: string, params: Record<string, string> = {}) {
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({ listId, ...params }).toString();
      const response = await fetch(`/api/clickup/tasks?${query}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (listId) fetchTasks();
  }, [listId, JSON.stringify(params)]);

  return { tasks, isLoading, error, refetch: fetchTasks };
}
