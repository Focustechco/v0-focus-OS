'use client';

import React from 'react';
import { ClickUpTask } from '@/lib/clickup-types';
import { Layers, MessageSquare, Paperclip } from 'lucide-react';

interface BacklogItemProps {
  task: ClickUpTask;
}

export function BacklogItem({ task }: BacklogItemProps) {
  // Extract epic/tag information from custom fields or tags
  const epic = task.tags?.find(t => t.name.toLowerCase().includes('epic'))?.name || 'Geral';
  
  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-4 hover:border-[#f97316]/50 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-[#1f1f1f] bg-[#0f0f0f] text-[#888888]`}>
          {epic}
        </span>
        <div className="flex -space-x-1.5">
          {task.assignees?.map((assignee) => (
            <div key={assignee.id} className="w-5 h-5 rounded-full border border-[#161616] bg-[#1f1f1f] overflow-hidden">
              <img src={assignee.profilePicture || ''} alt={assignee.username} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <h4 className="text-sm font-medium text-white mb-4 line-clamp-2 group-hover:text-[#f97316] transition-colors">
        {task.name}
      </h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-[#444]">
          <div className="flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span className="text-[10px]">2</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px]">5</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#333]">#cu-{task.id}</span>
      </div>
    </div>
  );
}
