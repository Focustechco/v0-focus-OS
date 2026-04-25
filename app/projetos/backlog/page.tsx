'use client';

import React, { useState, useEffect } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { useProjectsConfig } from '@/hooks/useProjectsConfig';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { ListTodo, Search, Filter, LayoutGrid, List, FolderKanban, Loader2, Plus, MoreHorizontal, Layers, MessageSquare } from 'lucide-react';
import { ClickUpSyncBar } from '@/components/projetos/ClickUpSyncBar';

export default function BacklogPage() {
  const { config, isLoading: loadingConfig } = useProjectsConfig();
  const selectedListId = config?.list_id ?? '';
  const [searchQuery, setSearchQuery] = useState('');

  const { tasks, isLoading, lastSync, error } = useClickUpTasks(selectedListId);

  if (loadingConfig) {
    return (
      <ProjectsLayout>
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
          <span className="ml-3 text-[#888888]">Carregando configurações...</span>
        </div>
      </ProjectsLayout>
    );
  }

  if (!selectedListId) {
    return (
      <ProjectsLayout>
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
              <ListTodo className="w-7 h-7 text-[#f97316] mr-3" />
              Backlog
            </h1>
          </header>
          <ClickUpSyncBar />
          <div className="p-16 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl mt-6">
            <FolderKanban className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">Nenhuma Lista Configurada</h3>
            <p className="text-[#444] text-sm">Clique em "Configurar" na barra de sincronização acima para selecionar a lista do ClickUp.</p>
          </div>
        </div>
      </ProjectsLayout>
    );
  }

  // Filter tasks by search
  const filtered = tasks.filter((t: any) =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status type for kanban columns
  const openTasks = filtered.filter((t: any) => {
    const s = t.status?.status?.toLowerCase() || '';
    const type = t.status?.type || '';
    return type === 'open' || s.includes('open') || s.includes('to do') || s.includes('backlog') || s.includes('a fazer');
  });
  const inProgressTasks = filtered.filter((t: any) => {
    const s = t.status?.status?.toLowerCase() || '';
    const type = t.status?.type || '';
    return type === 'custom' || s.includes('progress') || s.includes('andamento') || s.includes('review') || s.includes('revisão');
  });
  const closedTasks = filtered.filter((t: any) => {
    const s = t.status?.status?.toLowerCase() || '';
    const type = t.status?.type || '';
    return type === 'closed' || type === 'done' || s.includes('done') || s.includes('complete') || s.includes('closed') || s.includes('concluíd');
  });

  // Tasks that don't match any group above
  const ungrouped = filtered.filter((t: any) =>
    !openTasks.includes(t) && !inProgressTasks.includes(t) && !closedTasks.includes(t)
  );
  // Merge ungrouped into open
  const finalOpen = [...openTasks, ...ungrouped];

  return (
    <ProjectsLayout counts={{ sprints: config?.list_id ? 1 : 0, backlog: filtered.length, approvals: 0 }}>
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <ListTodo className="w-7 h-7 text-[#f97316] mr-3" />
                Backlog
              </h1>
              <p className="text-sm text-[#888888]">Épicos, tarefas e dívida técnica pendentes.</p>
            </div>
          </div>

          <ClickUpSyncBar lastSync={lastSync} />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#1f1f1f] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f97316]/50 transition-colors"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
            <span className="ml-3 text-[#888888]">Sincronizando backlog do ClickUp...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
            <p className="text-[#fca5a5]">{error}</p>
          </div>
        ) : !selectedListId ? (
          <div className="p-16 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl">
            <FolderKanban className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">Selecione uma Lista</h3>
            <p className="text-[#444] text-sm">Escolha acima para exibir o Kanban.</p>
          </div>
        ) : (
          /* Kanban Board */
          <div className="flex space-x-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar" style={{ minHeight: '400px' }}>
            {/* Open Column */}
            <KanbanColumn title="Aberto" color="border-[#888]" tasks={finalOpen} />
            {/* In Progress Column */}
            <KanbanColumn title="Em Progresso" color="border-[#3b82f6]" tasks={inProgressTasks} />
            {/* Done Column */}
            <KanbanColumn title="Concluído" color="border-[#10b981]" tasks={closedTasks} />
          </div>
        )}
      </div>
    </ProjectsLayout>
  );
}

function KanbanColumn({ title, color, tasks }: { title: string; color: string; tasks: any[] }) {
  return (
    <div className="flex flex-col min-w-[300px] w-[85vw] sm:w-[340px] snap-center flex-shrink-0">
      <div className={`p-3 border-t-2 ${color} bg-[#161616] rounded-t-xl mb-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
          <span className="bg-[#1f1f1f] text-[#888888] text-[10px] font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {tasks.map((task: any) => (
          <div key={task.id} className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-3 hover:border-[#f97316]/40 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              {task.tags?.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0f0f0f] border border-[#1f1f1f] text-[#888888]">
                  {task.tags[0].name}
                </span>
              )}
              <div className="flex -space-x-1.5 ml-auto">
                {(task.assignees || []).slice(0, 2).map((a: any) => (
                  <div key={a.id} className="w-5 h-5 rounded-full border border-[#161616] bg-[#1f1f1f] overflow-hidden flex items-center justify-center">
                    {a.profilePicture ? (
                      <img src={a.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-white">{a.initials}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-[#f97316] transition-colors">
              {task.name}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#333]">#{task.id.slice(-6)}</span>
              {task.priority && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  task.priority.priority === 'urgent' ? 'bg-[#7f1d1d] text-[#fca5a5]' :
                  task.priority.priority === 'high'   ? 'bg-[#451a03] text-[#fdba74]' :
                  'bg-[#1f1f1f] text-[#888888]'
                }`}>
                  {task.priority.priority}
                </span>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-[#1f1f1f] rounded-xl p-6 text-center">
            <p className="text-xs text-[#444]">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  );
}
