'use client';

import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { ClickUpSprint } from '@/lib/clickup-types';

interface ActiveSprintCardProps {
  sprint?: ClickUpSprint;
}

export function ActiveSprintCard({ sprint }: ActiveSprintCardProps) {
  // Placeholder data if no sprint provided
  const sprintName = sprint?.name || 'Sprint 24 - Q2';
  const progress = 65;

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
            <span className="text-xs text-[#888888]">Termina em 4 dias</span>
          </div>
          <div className="h-2 w-full bg-[#1f1f1f] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#f97316] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
            <p className="text-[10px] text-[#888888] uppercase mb-1">Concluído</p>
            <p className="text-lg font-bold text-white">24/38</p>
          </div>
          <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#1f1f1f]">
            <p className="text-[10px] text-[#888888] uppercase mb-1">Pontos</p>
            <p className="text-lg font-bold text-white">86</p>
          </div>
        </div>
      </div>
    </div>
  );
}
