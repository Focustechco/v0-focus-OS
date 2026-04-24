'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { ClickUpSyncBar } from '@/components/projetos/ClickUpSyncBar';
import { StatsGrid } from '@/components/projetos/visao-geral/StatsGrid';
import { ActiveSprintCard } from '@/components/projetos/visao-geral/ActiveSprintCard';
import { ArrowRight, ListTodo, CheckCircle2 } from 'lucide-react';

export default function ProjetosPage() {
  return (
    <ProjectsLayout counts={{ sprints: 2, backlog: 45, approvals: 8 }}>
      <div className="animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
          <p className="text-[#888888]">Monitore o progresso global, sprints e entregas em tempo real.</p>
        </header>

        <ClickUpSyncBar lastSync="há 2 minutos" />
        
        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <ActiveSprintCard />
            
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ListTodo className="w-5 h-5 text-[#f97316]" />
                  <h3 className="font-bold text-white">Backlog Prioritário</h3>
                </div>
                <button className="text-xs text-[#f97316] font-medium flex items-center hover:underline">
                  Ver tudo <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                      <span className="text-sm text-white">Refatoração do módulo de autenticação</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#888888] uppercase">Épico: Core</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f97316]" />
                  <h3 className="font-bold text-white">Aprovações</h3>
                </div>
                <span className="bg-[#f97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">8</span>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col space-y-2 pb-4 border-b border-[#1f1f1f] last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-white truncate">Solicitação de deploy #452</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#888888]">Há 2 horas</span>
                      <div className="flex space-x-2">
                        <button className="text-[10px] font-bold text-[#4ade80] hover:underline uppercase">Aprovar</button>
                        <button className="text-[10px] font-bold text-[#888888] hover:underline uppercase">Ver</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProjectsLayout>
  );
}
