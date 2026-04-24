'use client';

import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { ClickUpSprint } from '@/lib/clickup-types';

interface ActiveSprintCardProps {
  sprint?: ClickUpSprint;
}

export function ActiveSprintCard({ sprint }: ActiveSprintCardProps) {
  const sprintName = sprint?.name || 'Carregando Sprint...';
  
  const totalTasks = sprint?.tasks?.length || 0;
  const closedTasks = sprint?.tasks?.filter(t => t.date_closed !== null || t.status.type === 'closed')?.length || 0;
  const progress = totalTasks > 0 ? (closedTasks / totalTasks) * 100 : 0;
  
  const totalPoints = sprint?.tasks?.reduce((acc, t) => acc + (t.points || 0), 0) || 0;

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-[#333] transition-colors group cursor-pointer">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#f97316]/10 rounded-lg">
              <Zap className="w-5 h-5 text-[#f97316]" />
            </div>
            <h3 className="font-bold text-white">Sprint Ativa</h3>
          </div>
          <ChevronRight className="w-5 h-5 text-[#333] group-hover:text-white transition-colors" />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">{sprintName}</span>
            <span className="text-xs text-[#888888]">
              {totalTasks > 0 ? `${closedTasks} de ${totalTasks} concluídas` : 'Sem tarefas'}
            </span>
          </div>
          <div className="h-2 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#f97316] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
            <p className="text-[10px] text-[#888888] uppercase mb-1">Concluído</p>
            <p className="text-lg font-bold text-white">{closedTasks}/{totalTasks}</p>
          </div>
          <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
            <p className="text-[10px] text-[#888888] uppercase mb-1">Pontos</p>
            <p className="text-lg font-bold text-white">{totalPoints}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
