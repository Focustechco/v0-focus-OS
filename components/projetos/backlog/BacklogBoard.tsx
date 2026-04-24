'use client';

import React from 'react';
import { ClickUpTask } from '@/lib/clickup-types';
import { BacklogColumn } from './BacklogColumn';

interface BacklogBoardProps {
  tasks: ClickUpTask[];
}

export function BacklogBoard({ tasks }: BacklogBoardProps) {
  // Simple filtering by status
  const openTasks = tasks.filter(t => t.status.status.toLowerCase().includes('open') || t.status.status.toLowerCase().includes('to do'));
  const inProgressTasks = tasks.filter(t => t.status.status.toLowerCase().includes('progress'));
  const completedTasks = tasks.filter(t => t.status.status.toLowerCase().includes('done') || t.status.status.toLowerCase().includes('complete'));

  return (
    <div className="flex space-x-4 overflow-x-auto pb-6 h-[calc(100vh-280px)] snap-x snap-mandatory no-scrollbar">
      <div className="snap-center">
        <BacklogColumn 
          title="Aberto" 
          tasks={openTasks} 
          color="border-[#333]" 
        />
      </div>
      <div className="snap-center">
        <BacklogColumn 
          title="Em Progresso" 
          tasks={inProgressTasks} 
          color="border-[#3b82f6]" 
        />
      </div>
      <div className="snap-center">
        <BacklogColumn 
          title="Concluído" 
          tasks={completedTasks} 
          color="border-[#10b981]" 
        />
      </div>
    </div>
  );
}
