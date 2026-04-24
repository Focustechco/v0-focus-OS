'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { SprintCard } from '@/components/projetos/sprints/SprintCard';
import { useClickUpSprints } from '@/hooks/useClickUpSprints';
import { Zap, Users, BarChart3, Clock } from 'lucide-react';

export default function SprintsPage() {
  // Use a hardcoded list ID or fetch it from a project config/context
  const LIST_ID = process.env.NEXT_PUBLIC_CLICKUP_LIST_ID || '901323571867'; 
  const { sprints, isLoading, error } = useClickUpSprints(LIST_ID);

  return (
    <ProjectsLayout counts={{ sprints: sprints.length, backlog: 45, approvals: 8 }}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Zap className="w-8 h-8 text-[#f97316] mr-3" />
              Sprints
            </h1>
            <p className="text-[#888888]">Gerencie ciclos de entrega e produtividade da equipe.</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-[#f97316] text-white text-sm font-bold rounded-lg hover:bg-[#ea580c] transition-colors shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              Nova Sprint
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Column: Sprint List */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-[#161616] border border-[#1f1f1f] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
                <p className="text-[#fca5a5]">Erro ao carregar sprints: {error}</p>
              </div>
            ) : (
              sprints.map((sprint, idx) => (
                <SprintCard key={sprint.id} sprint={sprint} isActive={idx === 0} />
              ))
            )}
            
            {/* If no sprints, show empty state or mock data for demonstration */}
            {!isLoading && sprints.length === 0 && (
              <>
                <SprintCard 
                  isActive={true}
                  sprint={{
                    id: 'mock-1',
                    name: 'Sprint 24 - Q2 (Mock)',
                    status: 'ATIVA',
                    goals: 'Finalizar integração ClickUp e dashboard de projetos.',
                    start_date: '', end_date: '', orderindex: 0,
                    tasks: [
                      { id: '868tmv2z1', name: 'Desenvolver Route Handlers ClickUp', status: { status: 'Em Progresso', color: '#f97316', type: 'custom', orderindex: 0 }, assignees: [], custom_fields: [], list: {id:'',name:''}, folder: {id:'',name:''}, space: {id:'',name:''}, url: '', date_created: '', date_updated: '', date_closed: null, date_done: null, creator: {id:0,username:'',email:'',color:'',initials:'',profilePicture:null}, priority: {id:'1',priority:'Urgent',color:'#7f1d1d',orderindex:'0'}, due_date: null, start_date: null, points: null, time_estimate: null, checklists: [], tags: [], parent: null, orderindex: '' }
                    ]
                  }} 
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members Card */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-white">Equipe na Sprint</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#1f1f1f] border border-[#333]" />
                      <span className="text-sm text-white">Membro {i}</span>
                    </div>
                    <span className="text-xs text-[#888888]">12 tasks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-white">Resumo</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
                  <p className="text-[10px] text-[#888888] uppercase mb-1">Velocidade</p>
                  <p className="text-lg font-bold text-white">42</p>
                </div>
                <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
                  <p className="text-[10px] text-[#888888] uppercase mb-1">Foco</p>
                  <p className="text-lg font-bold text-white">85%</p>
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-white">Histórico</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col space-y-1">
                    <span className="text-sm text-[#888888]">Sprint 2{3-i}</span>
                    <span className="text-xs text-white font-medium">92% concluída</span>
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
