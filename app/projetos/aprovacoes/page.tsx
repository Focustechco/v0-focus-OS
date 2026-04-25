'use client';

import React, { useState } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { useApprovals } from '@/hooks/useApprovals';
import { useProjectsContext } from '@/contexts/ProjectsContext';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { CheckCircle2, XCircle, Clock, ExternalLink, MessageSquare, Loader2 } from 'lucide-react';

export default function AprovacoesPage() {
  const { approvals, approve, reject, isLoading, error } = useApprovals();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const { selectedListId, allLists } = useProjectsContext();
  const { tasks } = useClickUpTasks(selectedListId);

  const filteredApprovals = approvals.filter((a: any) => filter === 'all' ? true : a.status === filter);

  const stats = {
    pending:  approvals.filter((a: any) => a.status === 'pending').length,
    approved: approvals.filter((a: any) => a.status === 'approved').length,
    rejected: approvals.filter((a: any) => a.status === 'rejected').length,
  };

  const statusColors: Record<string, string> = {
    'pending':  'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20',
    'approved': 'text-[#4ade80] bg-[#16a34a22] border-[#16a34a44]',
    'rejected': 'text-[#fca5a5] bg-[#7f1d1d]/20 border-[#7f1d1d]/40',
  };

  const statusLabels: Record<string, string> = {
    'pending':  'PENDENTE',
    'approved': 'APROVADO',
    'rejected': 'REJEITADO',
  };

  return (
    <ProjectsLayout counts={{ sprints: allLists?.length || 0, backlog: tasks?.length || 0, approvals: stats.pending }}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <CheckCircle2 className="w-7 h-7 text-[#f97316] mr-3" />
                Aprovações
              </h1>
              <p className="text-sm text-[#888888]">Garanta a qualidade técnica e comercial antes do deploy.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 sm:space-x-6 border-b border-[#1f1f1f] pb-4 overflow-x-auto no-scrollbar">
            {(['pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center space-x-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  filter === f
                    ? f === 'pending' ? 'text-[#f97316]' : f === 'approved' ? 'text-[#4ade80]' : 'text-[#fca5a5]'
                    : 'text-[#444] hover:text-[#888]'
                }`}
              >
                <span>{f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovadas' : 'Rejeitadas'}</span>
                <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full ${
                  filter === f
                    ? f === 'pending' ? 'bg-[#f97316] text-white' : f === 'approved' ? 'bg-[#16a34a] text-white' : 'bg-[#7f1d1d] text-white'
                    : 'bg-[#1f1f1f] text-[#444]'
                }`}>
                  {stats[f]}
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
              <span className="ml-3 text-[#888888]">Carregando aprovações...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
              <p className="text-[#fca5a5]">{error}</p>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl">
              <div className="w-14 h-14 bg-[#161616] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-[#333]" />
              </div>
              <h3 className="text-white font-bold mb-1">Nenhuma solicitação encontrada</h3>
              <p className="text-[#444] text-sm">Tudo limpo! Nenhuma aprovação {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovada' : 'rejeitada'} no momento.</p>
            </div>
          ) : (
            filteredApprovals.map((approval: any) => {
              const isPending = approval.status === 'pending';
              const task = approval.clickup_tasks_cache;
              return (
                <div key={approval.id} className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-4 sm:p-6 hover:border-[#333] transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`p-2.5 sm:p-3 rounded-xl border ${statusColors[approval.status]}`}>
                        {approval.status === 'approved' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> :
                         approval.status === 'rejected' ? <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> :
                         <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 flex-wrap gap-y-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-[#f97316] transition-colors">
                            {task?.name || approval.project_name || 'Solicitação de Aprovação'}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[approval.status]}`}>
                            {statusLabels[approval.status]}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-[#888888] flex items-center space-x-2 flex-wrap gap-y-1">
                          <span>{approval.project_name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(approval.created_at).toLocaleDateString('pt-BR')}</span>
                          </span>
                          {approval.clickup_task_id && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-[#333]">#{approval.clickup_task_id.slice(-6)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {approval.notes && (
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 mb-4">
                      <p className="text-xs text-[#888888] italic">"{approval.notes}"</p>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => reject(approval.id, approval.clickup_task_id)}
                        className="px-4 py-1.5 text-xs font-bold text-[#888888] bg-[#1f1f1f] border border-[#333] rounded-lg hover:bg-[#2a2a2a] transition-colors uppercase"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => approve(approval.id, approval.clickup_task_id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#16a34a] rounded-lg hover:bg-[#15803d] transition-colors uppercase shadow-[0_0_15px_rgba(22,163,74,0.2)]"
                      >
                        Aprovar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ProjectsLayout>
  );
}
