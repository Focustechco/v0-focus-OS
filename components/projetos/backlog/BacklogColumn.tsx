'use client';

import React from 'react';
import { ClickUpTask } from '@/lib/clickup-types';
import { BacklogItem } from './BacklogItem';
import { Plus, MoreHorizontal } from 'lucide-react';

interface BacklogColumnProps {
  title: string;
  tasks: ClickUpTask[];
  color: string;
}

export function BacklogColumn({ title, tasks, color }: BacklogColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[320px]">
      {/* Header */}
      <div className={`p-3 border-t-2 ${color} bg-[#161616] rounded-t-xl mb-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <span className="bg-[#1f1f1f] text-[#888888] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-[#444] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 text-[#444] hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.map((task) => (
          <BacklogItem key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-[#1f1f1f] rounded-xl p-8 text-center">
            <p className="text-xs text-[#444]">Arraste tarefas para aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
