'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { TimelineGantt } from '@/components/projetos/prazos/TimelineGantt';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { Calendar, Filter, Download, Info } from 'lucide-react';

export default function PrazosPage() {
  const LIST_ID = process.env.NEXT_PUBLIC_CLICKUP_LIST_ID || '901323571867';
  // Fetch tasks with due dates
  const { tasks, isLoading, error } = useClickUpTasks(LIST_ID);

  return (
    <ProjectsLayout counts={{ sprints: 2, backlog: 45, approvals: 8 }}>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Calendar className="w-8 h-8 text-[#f97316] mr-3" />
                Prazos & Entregas
              </h1>
              <p className="text-[#888888]">Visualize a linha do tempo e dependências críticas do projeto.</p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#161616] border border-[#1f1f1f] rounded-lg text-sm text-[#888888] hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-lg text-sm text-[#f97316] hover:bg-[#f97316]/20 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          <div className="bg-[#f97316]/5 border border-[#f97316]/10 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#f97316] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#888888] leading-relaxed">
              Os prazos exibidos são baseados no campo <span className="text-white font-medium">due_date</span> do ClickUp. 
              Certifique-se de manter as datas atualizadas para garantir a precisão do gráfico de Gantt e do caminho crítico.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="h-96 bg-[#161616] border border-[#1f1f1f] rounded-2xl animate-pulse" />
        ) : error ? (
          <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
            <p className="text-[#fca5a5]">Erro ao carregar cronograma: {error}</p>
          </div>
        ) : (
          <TimelineGantt tasks={tasks} />
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6">
            <h4 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-4">Métricas de Prazo</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888888]">On-time Delivery</span>
                <span className="text-sm font-bold text-[#4ade80]">94%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
                <div className="h-full bg-[#4ade80]" style={{ width: '94%' }} />
              </div>
            </div>
          </div>
          
          <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6 md:col-span-2">
            <h4 className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-4">Próximos Marcos (Milestones)</h4>
            <div className="flex space-x-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex-1 p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f] flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center text-[#f97316] font-bold text-xs">
                    M{i}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">MVP V1.0 - Lançamento</p>
                    <p className="text-[10px] text-[#888888]">12 de Junho, 2026</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProjectsLayout>
  );
}
