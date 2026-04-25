'use client';

import React, { useState, useEffect } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { useClickUpSpaces } from '@/hooks/useClickUpSpaces';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { Calendar, Filter, Download, Info, FolderKanban, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PrazosPage() {
  const { spaces, isLoading: loadingSpaces } = useClickUpSpaces();
  const [selectedListId, setSelectedListId] = useState<string>('');

  const { tasks, isLoading, lastSync, error } = useClickUpTasks(selectedListId);

  const allLists = spaces.flatMap((s: any) => [
    ...(s.folderless_lists || []).map((l: any) => ({ ...l, spaceName: s.name })),
    ...(s.folders || []).flatMap((f: any) =>
      (f.lists || []).map((l: any) => ({ ...l, spaceName: s.name, folderName: f.name }))
    ),
  ]);

  useEffect(() => {
    if (allLists.length > 0 && !selectedListId) {
      setSelectedListId(allLists[0].id);
    }
  }, [allLists.length]);

  // Tasks with due dates, sorted
  const tasksWithDates = tasks
    .filter((t: any) => t.due_date)
    .map((t: any) => ({
      ...t,
      due: new Date(Number(t.due_date)),
      start: t.start_date ? new Date(Number(t.start_date)) : null,
    }))
    .sort((a: any, b: any) => a.due.getTime() - b.due.getTime());

  const formatDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  // Upcoming deadlines
  const now = new Date();
  const upcoming = tasksWithDates.filter((t: any) => t.due >= now);
  const overdue  = tasksWithDates.filter((t: any) => t.due < now && t.status?.type !== 'closed');
  const onTimeRate = tasksWithDates.length > 0
    ? Math.round(((tasksWithDates.length - overdue.length) / tasksWithDates.length) * 100)
    : 100;

  return (
    <ProjectsLayout counts={{ sprints: allLists.length, backlog: tasks.length, approvals: 0 }}>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <Calendar className="w-7 h-7 text-[#f97316] mr-3" />
                Prazos & Entregas
              </h1>
              <p className="text-sm text-[#888888]">Visualize a linha do tempo e prazos críticos do projeto.</p>
            </div>
          </div>

          {/* List Selector */}
          <div className="p-3 bg-[#161616] border border-[#1f1f1f] rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <FolderKanban className="w-4 h-4 text-[#f97316]" />
                <span className="font-medium text-white">Lista:</span>
              </div>
              {loadingSpaces ? (
                <div className="flex items-center space-x-2 text-sm text-[#888888]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="flex-1 bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316] transition-colors cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {spaces.map((space: any) => (
                    <optgroup key={space.id} label={`📂 ${space.name}`}>
                      {(space.folderless_lists || []).map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                      {(space.folders || []).map((f: any) =>
                        (f.lists || []).map((l: any) => (
                          <option key={l.id} value={l.id}>{f.name} → {l.name}</option>
                        ))
                      )}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
            <span className="ml-3 text-[#888888]">Sincronizando prazos...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
            <p className="text-[#fca5a5]">{error}</p>
          </div>
        ) : !selectedListId ? (
          <div className="p-16 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl">
            <Calendar className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">Selecione uma Lista</h3>
            <p className="text-[#444] text-sm">Escolha acima para visualizar os prazos.</p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
                <h4 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">On-time Delivery</h4>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-[#4ade80]">{onTimeRate}%</span>
                  <span className="text-[10px] text-[#888888]">{tasksWithDates.length} com prazo</span>
                </div>
                <div className="h-1.5 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4ade80] transition-all duration-1000" style={{ width: `${onTimeRate}%` }} />
                </div>
              </div>
              <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
                <h4 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Atrasados</h4>
                <span className={`text-2xl font-bold ${overdue.length > 0 ? 'text-[#fca5a5]' : 'text-[#4ade80]'}`}>
                  {overdue.length}
                </span>
              </div>
              <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
                <h4 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-3">Próximas Entregas</h4>
                <span className="text-2xl font-bold text-white">{upcoming.length}</span>
              </div>
            </div>

            {/* Overdue Alert */}
            {overdue.length > 0 && (
              <div className="bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-bold text-[#fca5a5] mb-3">⚠️ Tarefas Atrasadas ({overdue.length})</h4>
                <div className="space-y-2">
                  {overdue.slice(0, 5).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg">
                      <span className="text-xs text-white truncate flex-1 mr-3">{t.name}</span>
                      <span className="text-[10px] font-bold text-[#fca5a5] flex-shrink-0">
                        Venceu em {formatDate(t.due)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-[#f97316]" />
                  <h3 className="font-bold text-white">Cronograma</h3>
                  <span className="text-[10px] text-[#888888]">{tasksWithDates.length} tarefas com prazo</span>
                </div>
              </div>

              <div className="divide-y divide-[#1f1f1f]">
                {tasksWithDates.length === 0 ? (
                  <div className="p-10 text-center text-[#444] text-sm">
                    Nenhuma tarefa com data de entrega definida nesta lista.
                  </div>
                ) : (
                  tasksWithDates.map((task: any) => {
                    const isOverdue = task.due < now && task.status?.type !== 'closed';
                    const isClosed  = task.status?.type === 'closed';
                    return (
                      <div key={task.id} className="flex items-center p-3 sm:p-4 hover:bg-[#1a1a1a] transition-colors group">
                        <div className="w-20 sm:w-24 flex-shrink-0 text-right pr-4">
                          <span className={`text-xs font-bold ${isOverdue ? 'text-[#fca5a5]' : isClosed ? 'text-[#4ade80]' : 'text-white'}`}>
                            {formatDate(task.due)}
                          </span>
                        </div>
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                          isClosed ? 'bg-[#4ade80] border-[#4ade80]' :
                          isOverdue ? 'bg-[#fca5a5] border-[#fca5a5]' :
                          'bg-[#f97316] border-[#f97316]'
                        }`} />
                        <div className="flex-1 ml-4 min-w-0">
                          <span className="text-sm font-medium text-white truncate block group-hover:text-[#f97316] transition-colors">
                            {task.name}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: (task.status?.color || '#333') + '22',
                                color: task.status?.color || '#888',
                              }}
                            >
                              {task.status?.status}
                            </span>
                            {task.start && (
                              <span className="text-[10px] text-[#444]">
                                Início: {formatDate(task.start)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex -space-x-1.5 ml-3 flex-shrink-0">
                          {(task.assignees || []).slice(0, 2).map((a: any) => (
                            <div key={a.id} className="w-6 h-6 rounded-full border border-[#161616] bg-[#1f1f1f] overflow-hidden flex items-center justify-center">
                              {a.profilePicture ? (
                                <img src={a.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[8px] font-bold text-white">{a.initials}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ProjectsLayout>
  );
}
