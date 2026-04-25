'use client';

import React, { useState, useEffect } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { ClickUpSyncBar } from '@/components/projetos/ClickUpSyncBar';
import { StatsGrid } from '@/components/projetos/visao-geral/StatsGrid';
import { ActiveSprintCard } from '@/components/projetos/visao-geral/ActiveSprintCard';
import { useProjectsContext } from '@/contexts/ProjectsContext';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { useApprovals } from '@/hooks/useApprovals';
import { ArrowRight, ListTodo, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProjetosPage() {
  const { selectedListId, selectedListName, spaces, allLists } = useProjectsContext();

  const { tasks, isLoading: loadingTasks, lastSync, error: tasksError } = useClickUpTasks(selectedListId);
  const { approvals } = useApprovals();

  const pendingApprovals = approvals.filter((a: any) => a.status === 'pending').length;
  const completedTasks = tasks.filter((t: any) => {
    const s = t.status?.status?.toLowerCase() || '';
    return s.includes('closed') || s.includes('done') || s.includes('complete');
  }).length;
  const openTasks = tasks.length - completedTasks;

  const stats = {
    activeProjects: spaces.length,
    activeSprints: allLists.length,
    pendingApprovals,
    completedTasks,
  };

  return (
    <ProjectsLayout counts={{ sprints: allLists.length, backlog: openTasks, approvals: pendingApprovals }}>
      <div className="animate-in fade-in duration-500">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Visão Geral</h1>
          <p className="text-sm text-[#888888]">Monitore o progresso global, sprints e entregas em tempo real.</p>
        </header>

        <ClickUpSyncBar lastSync={lastSync || 'Aguardando...'} />

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActiveSprintCard sprint={undefined} />

            {/* Task preview */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ListTodo className="w-5 h-5 text-[#f97316]" />
                  <h3 className="font-bold text-white">
                    {selectedListName || 'Tarefas'} <span className="text-xs text-[#888888] font-normal ml-2">({tasks.length})</span>
                  </h3>
                </div>
                <button className="text-xs text-[#f97316] font-medium flex items-center hover:underline">
                  Ver tudo <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
              <div className="divide-y divide-[#1f1f1f]">
                {loadingTasks ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#f97316]" />
                    <span className="ml-3 text-sm text-[#888888]">Sincronizando com ClickUp...</span>
                  </div>
                ) : tasksError ? (
                  <div className="p-6 text-center text-red-400 text-sm">{tasksError}</div>
                ) : tasks.length === 0 ? (
                  <div className="p-8 text-center text-[#444] text-sm">Nenhuma tarefa encontrada nesta lista.</div>
                ) : (
                  tasks.slice(0, 8).map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1a1a1a] transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.status?.color || '#f97316' }}
                        />
                        <span className="text-sm text-white truncate">{task.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: (task.status?.color || '#333') + '22',
                            color: task.status?.color || '#888',
                          }}
                        >
                          {task.status?.status || 'N/A'}
                        </span>
                        <div className="flex -space-x-1.5">
                          {(task.assignees || []).slice(0, 2).map((a: any) => (
                            <div
                              key={a.id}
                              className="w-6 h-6 rounded-full border border-[#161616] bg-[#1f1f1f] flex items-center justify-center overflow-hidden"
                              title={a.username}
                            >
                              {a.profilePicture ? (
                                <img src={a.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[8px] font-bold text-white">{a.initials}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — Aprovações */}
          <div className="space-y-6">
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f97316]" />
                  <h3 className="font-bold text-white">Aprovações</h3>
                </div>
                <span className="bg-[#f97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingApprovals}
                </span>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {approvals.filter((a: any) => a.status === 'pending').length === 0 ? (
                  <p className="text-sm text-[#444] text-center py-4">Nenhuma aprovação pendente.</p>
                ) : (
                  approvals
                    .filter((a: any) => a.status === 'pending')
                    .slice(0, 5)
                    .map((a: any) => (
                      <div key={a.id} className="flex flex-col space-y-2 pb-4 border-b border-[#1f1f1f] last:border-0 last:pb-0">
                        <p className="text-sm font-medium text-white truncate">
                          {a.clickup_tasks_cache?.name || a.project_name || 'Solicitação'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#888888]">
                            {new Date(a.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex space-x-2">
                            <button className="text-[10px] font-bold text-[#4ade80] hover:underline uppercase">
                              Aprovar
                            </button>
                            <button className="text-[10px] font-bold text-[#888888] hover:underline uppercase">
                              Ver
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectsLayout>
  );
}
