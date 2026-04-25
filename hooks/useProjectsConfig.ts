'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ProjectsConfig = {
  workspace_id: string; 
  workspace_name: string;
  space_id: string;     
  space_name: string;
  list_id: string;      
  list_name: string;
};

export function useProjectsConfig() {
  const [config, setConfig] = useState<ProjectsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/config');
      const data = await res.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Failed to load projects config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    
    // Realtime: propaga mudança de config para todos os clientes abertos
    const ch = supabase.channel('projects-config')
      .on('postgres_changes', {
        event: 'UPDATE', 
        schema: 'public', 
        table: 'projects_clickup_config'
      }, (payload) => {
        setConfig(payload.new as ProjectsConfig);
      })
      .subscribe();
      
    return () => { 
      supabase.removeChannel(ch); 
    };
  }, [load]);

  const save = async (cfg: Partial<ProjectsConfig>) => {
    try {
      await fetch('/api/projects/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      // Realtime vai propagar — não precisa refetch manual
    } catch (error) {
      console.error('Failed to save projects config:', error);
    }
  };

  return { config, isLoading, save };
}
