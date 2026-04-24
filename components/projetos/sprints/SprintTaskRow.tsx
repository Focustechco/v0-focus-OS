'use client';

import React from 'react';
import { ClickUpTask } from '@/lib/clickup-types';

interface SprintTaskRowProps {
  task: ClickUpTask;
}

export function SprintTaskRow({ task }: SprintTaskRowProps) {
  const priorityColors: Record<string, string> = {
    'urgent': 'bg-[#7f1d1d] text-[#fca5a5]',
    'high': 'bg-[#451a03] text-[#fdba74]',
    'normal': 'bg-[#1e3a5f] text-[#93c5fd]',
    'low': 'bg-[#1f1f1f] text-[#888888]',
  };

  const priority = task.priority?.priority?.toLowerCase() || 'low';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
      <div className="flex items-center space-x-4 flex-1">
        <span className="text-[10px] font-mono text-[#444] group-hover:text-[#666]">#cu-{task.id}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white group-hover:text-[#f97316] transition-colors">{task.name}</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] uppercase font-bold text-[#888888]">{task.status.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Priority Badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[priority] || priorityColors['low']}`}>
          {priority}
        </span>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees?.map((assignee) => (
            <div 
              key={assignee.id}
              className="w-7 h-7 rounded-full border-2 border-[#161616] bg-[#1f1f1f] flex items-center justify-center overflow-hidden"
              title={assignee.username}
            >
              {assignee.profilePicture ? (
                <img src={assignee.profilePicture} alt={assignee.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-white">{assignee.initials}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
