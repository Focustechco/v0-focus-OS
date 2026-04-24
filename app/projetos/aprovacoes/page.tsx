'use client';

import React, { useState } from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { ApprovalCard } from '@/components/projetos/aprovacoes/ApprovalCard';
import { useApprovals } from '@/hooks/useApprovals';
import { CheckCircle2, Filter, Search, ChevronDown } from 'lucide-react';

export default function AprovacoesPage() {
  const { approvals, approve, reject, isLoading, error } = useApprovals();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const filteredApprovals = approvals.filter(a => filter === 'all' ? true : a.status === filter);

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  return (
    <ProjectsLayout counts={{ sprints: 2, backlog: 45, approvals: stats.pending }}>
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <CheckCircle2 className="w-8 h-8 text-[#f97316] mr-3" />
                Aprovações
              </h1>
              <p className="text-[#888888]">Garanta a qualidade técnica e comercial antes do deploy.</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#161616] border border-[#1f1f1f] rounded-lg text-sm text-white hover:border-[#f97316]/50 transition-colors">
              <span>Exportar Relatório</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-6 border-b border-[#1f1f1f] pb-4">
            <button 
              onClick={() => setFilter('pending')}
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors ${filter === 'pending' ? 'text-[#f97316]' : 'text-[#444] hover:text-[#888]'}`}
            >
              <span>Pendentes</span>
              <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full ${filter === 'pending' ? 'bg-[#f97316] text-white' : 'bg-[#1f1f1f] text-[#444]'}`}>
                {stats.pending}
              </span>
            </button>
            <button 
              onClick={() => setFilter('approved')}
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors ${filter === 'approved' ? 'text-[#4ade80]' : 'text-[#444] hover:text-[#888]'}`}
            >
              <span>Aprovadas</span>
              <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full ${filter === 'approved' ? 'bg-[#16a34a] text-white' : 'bg-[#1f1f1f] text-[#444]'}`}>
                {stats.approved}
              </span>
            </button>
            <button 
              onClick={() => setFilter('rejected')}
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors ${filter === 'rejected' ? 'text-[#fca5a5]' : 'text-[#444] hover:text-[#888]'}`}
            >
              <span>Rejeitadas</span>
              <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] rounded-full ${filter === 'rejected' ? 'bg-[#7f1d1d] text-white' : 'bg-[#1f1f1f] text-[#444]'}`}>
                {stats.rejected}
              </span>
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-[#161616] border border-[#1f1f1f] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
              <p className="text-[#fca5a5]">Erro ao carregar aprovações: {error}</p>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed border-[#1f1f1f] rounded-2xl">
              <div className="w-16 h-16 bg-[#161616] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#333]" />
              </div>
              <h3 className="text-white font-bold mb-1">Nenhuma solicitação encontrada</h3>
              <p className="text-[#444] text-sm">Tudo limpo por aqui! Nenhuma aprovação pendente no momento.</p>
            </div>
          ) : (
            filteredApprovals.map((approval) => (
              <ApprovalCard 
                key={approval.id} 
                approval={approval} 
                onApprove={approve} 
                onReject={reject} 
              />
            ))
          )}
        </div>
      </div>
    </ProjectsLayout>
  );
}
