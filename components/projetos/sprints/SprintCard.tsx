'use client';

import React from 'react';
import { Zap, Calendar, MoreVertical } from 'lucide-react';
import { ClickUpSprint, ClickUpTask } from '@/lib/clickup-types';
import { SprintTaskRow } from './SprintTaskRow';

interface SprintCardProps {
  sprint: ClickUpSprint;
  isActive?: boolean;
}

export function SprintCard({ sprint, isActive }: SprintCardProps) {
  const statusColors: Record<string, string> = {
    'ATIVA': 'bg-[#16a34a22] text-[#4ade80] border-[#16a34a44]',
    'PLANEJADA': 'bg-[#1f1f1f] text-[#888888] border-[#333]',
    'CONCLUÍDA': 'bg-[#1e3a5f22] text-[#93c5fd] border-[#1e3a5f44]',
  };

  const status = isActive ? 'ATIVA' : (sprint.status || 'PLANEJADA');

  return (
    <div className={`bg-[#161616] border ${isActive ? 'border-[#f97316]' : 'border-[#1f1f1f]'} rounded-xl overflow-hidden mb-6`}>
      {/* Header */}
      <div className="p-5 border-b border-[#1f1f1f] flex items-center justify-between bg-gradient-to-r from-[#161616] to-[#1a1a1a]">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-[#f97316]/10 text-[#f97316]' : 'bg-[#1f1f1f] text-[#888888]'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="font-bold text-white text-lg">{sprint.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[status] || statusColors['PLANEJADA']}`}>
                {status}
              </span>
            </div>
            <div className="flex items-center text-xs text-[#888888] space-x-4">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>24 Mai - 07 Jun</span>
              </span>
              <span>•</span>
              <span>18 Tarefas</span>
              <span>•</span>
              <span>42 Pontos</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-[#888888] hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="h-0.5 w-full bg-[#1f1f1f]">
          <div className="h-full bg-[#f97316]" style={{ width: '65%' }} />
        </div>
      )}

      {/* Meta */}
      {sprint.goals && (
        <div className="px-5 py-3 bg-[#1a1a1a]/50 border-b border-[#1f1f1f]">
          <p className="text-xs text-[#888888]">
            <span className="text-[#f97316] font-medium mr-2 uppercase tracking-wider text-[10px]">Meta:</span>
            {sprint.goals}
          </p>
        </div>
      )}

      {/* Task List */}
      <div className="divide-y divide-[#1f1f1f]">
        {sprint.tasks?.map((task) => (
          <SprintTaskRow key={task.id} task={task} />
        ))}
        {(!sprint.tasks || sprint.tasks.length === 0) && (
          <div className="p-10 text-center">
            <p className="text-sm text-[#888888]">Nenhuma tarefa nesta sprint</p>
          </div>
        )}
      </div>
    </div>
  );
}
