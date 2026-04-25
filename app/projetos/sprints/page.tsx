'use client';

import React, { useState, useEffect } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { useProjectsContext } from '@/contexts/ProjectsContext';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { Zap, Users, BarChart3, Clock, Loader2, FolderKanban, ChevronDown } from 'lucide-react';

export default function SprintsPage() {
  const { selectedListId, allLists } = useProjectsContext();
  const { tasks, isLoading, lastSync, error, updateStatus } = useClickUpTasks(selectedListId);

  // Group tasks by status
  const statusGroups = tasks.reduce((acc: any, task: any) => {
    const status = task.status?.status || 'sem status';
    if (!acc[status]) acc[status] = { color: task.status?.color || '#888', tasks: [] };
    acc[status].tasks.push(task);
    return acc;
  }, {});

  const completedCount = tasks.filter((t: any) => {
    const s = t.status?.type || '';
    return s === 'closed' || s === 'done';
  }).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <ProjectsLayout counts={{ sprints: allLists.length, backlog: tasks.length, approvals: 0 }}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
              <Zap className="w-7 h-7 text-[#f97316] mr-3" />
              Sprints
            </h1>
            <p className="text-sm text-[#888888]">Gerencie ciclos de entrega e produtividade da equipe.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Column: Task List by Status */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress bar */}
            {selectedListId && !isLoading && (
              <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Progresso</span>
                  <span className="text-xs text-[#888888]">{completedCount}/{tasks.length} concluídas ({progress}%)</span>
                </div>
                <div className="h-2 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div className="h-full bg-[#f97316] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
                <span className="ml-3 text-[#888888]">Sincronizando tarefas do ClickUp...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
                <p className="text-[#fca5a5]">Erro: {error}</p>
              </div>
            ) : !selectedListId ? (
              <div className="p-16 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl">
                <FolderKanban className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <h3 className="text-white font-bold mb-1">Selecione uma Lista</h3>
                <p className="text-[#444] text-sm">Escolha uma lista do ClickUp acima para visualizar as tarefas.</p>
              </div>
            ) : (
              Object.entries(statusGroups).map(([status, group]: any) => (
                <div key={status} className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#1f1f1f] flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{status}</h3>
                    <span className="text-[10px] text-[#888888] bg-[#1f1f1f] px-2 py-0.5 rounded-full">{group.tasks.length}</span>
                  </div>
                  <div className="divide-y divide-[#1f1f1f]">
                    {group.tasks.map((task: any) => {
                      const priority = task.priority?.priority?.toLowerCase() || '';
                      const priorityColors: Record<string, string> = {
                        'urgent': 'bg-[#7f1d1d] text-[#fca5a5]',
                        'high':   'bg-[#451a03] text-[#fdba74]',
                        'normal': 'bg-[#1e3a5f] text-[#93c5fd]',
                        'low':    'bg-[#1f1f1f] text-[#888888]',
                      };
                      return (
                        <div key={task.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-[#333] hidden sm:inline">#{task.id.slice(-6)}</span>
                            <span className="text-sm font-medium text-white truncate group-hover:text-[#f97316] transition-colors">{task.name}</span>
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                            {priority && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[priority] || priorityColors['low']}`}>
                                {priority}
                              </span>
                            )}
                            <div className="flex -space-x-1.5">
                              {(task.assignees || []).slice(0, 3).map((a: any) => (
                                <div key={a.id} className="w-6 h-6 rounded-full border border-[#161616] bg-[#1f1f1f] flex items-center justify-center overflow-hidden" title={a.username}>
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
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-white text-sm">Equipe</h3>
              </div>
              <div className="space-y-3">
                {(() => {
                  const members: Record<string, { name: string; pic: string | null; count: number }> = {};
                  tasks.forEach((t: any) => {
                    (t.assignees || []).forEach((a: any) => {
                      if (!members[a.id]) members[a.id] = { name: a.username, pic: a.profilePicture, count: 0 };
                      members[a.id].count++;
                    });
                  });
                  return Object.values(members).sort((a, b) => b.count - a.count).slice(0, 6).map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#1f1f1f] border border-[#333] overflow-hidden flex items-center justify-center">
                          {m.pic ? <img src={m.pic} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] text-white font-bold">{m.name?.[0]}</span>}
                        </div>
                        <span className="text-xs text-white truncate max-w-[100px]">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-[#888888]">{m.count} tasks</span>
                    </div>
                  ));
                })()}
                {tasks.length === 0 && <p className="text-xs text-[#444]">Selecione uma lista</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-white text-sm">Resumo</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
                  <p className="text-[10px] text-[#888888] uppercase mb-1">Total</p>
                  <p className="text-lg font-bold text-white">{tasks.length}</p>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
                  <p className="text-[10px] text-[#888888] uppercase mb-1">Concluído</p>
                  <p className="text-lg font-bold text-[#4ade80]">{completedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectsLayout>
  );
}
