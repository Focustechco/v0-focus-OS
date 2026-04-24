'use client';

import React from 'react';
import { ClickUpTask } from '@/lib/clickup-types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineGanttProps {
  tasks: ClickUpTask[];
}

export function TimelineGantt({ tasks }: TimelineGanttProps) {
  // Sort tasks by due date
  const sortedTasks = [...tasks]
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-2xl overflow-hidden">
      {/* Timeline Header */}
      <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between bg-gradient-to-r from-[#161616] to-[#1a1a1a]">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[#f97316]/10 rounded-lg">
            <Calendar className="w-5 h-5 text-[#f97316]" />
          </div>
          <div>
            <h3 className="font-bold text-white">Cronograma de Entregas</h3>
            <p className="text-[10px] text-[#888888] uppercase tracking-widest">Maio - Junho 2026</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-[#444] hover:text-white transition-colors bg-[#1f1f1f] rounded-lg border border-[#333]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 text-[#444] hover:text-white transition-colors bg-[#1f1f1f] rounded-lg border border-[#333]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="flex border-b border-[#1f1f1f] bg-[#0f0f0f]/50">
            <div className="w-64 p-4 border-r border-[#1f1f1f] flex-shrink-0">
              <span className="text-[10px] font-bold text-[#444] uppercase tracking-wider">Tarefa / Épico</span>
            </div>
            <div className="flex-1 flex">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 p-4 text-center border-r border-[#1f1f1f] last:border-0">
                  <span className="text-[10px] font-bold text-[#444] block mb-1">SEG</span>
                  <span className="text-xs text-[#888888]">{20 + i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-[#1f1f1f]">
            {sortedTasks.length === 0 ? (
              <div className="p-10 text-center text-[#444] text-sm">
                Nenhuma tarefa com data de entrega definida.
              </div>
            ) : (
              sortedTasks.slice(0, 8).map((task, idx) => (
                <div key={task.id} className="flex hover:bg-[#1a1a1a] transition-colors group">
                  <div className="w-64 p-4 border-r border-[#1f1f1f] flex-shrink-0 flex flex-col justify-center">
                    <span className="text-sm font-medium text-white truncate group-hover:text-[#f97316] transition-colors">
                      {task.name}
                    </span>
                    <span className="text-[10px] text-[#444] uppercase tracking-wider mt-1">
                      {task.status.status}
                    </span>
                  </div>
                  <div className="flex-1 relative h-16 flex items-center">
                    {/* The "Bar" - simplified positioning for mockup */}
                    <div 
                      className={`absolute h-8 rounded-lg border-l-4 flex items-center px-3 shadow-lg transition-all hover:scale-[1.02] cursor-pointer`}
                      style={{ 
                        left: `${(idx * 7) + 5}%`, 
                        width: '35%',
                        backgroundColor: '#1f1f1f',
                        borderColor: '#f97316',
                        color: 'white'
                      }}
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                        <span className="text-[10px] font-bold truncate">Entrega: {formatDate(task.due_date!)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="p-4 bg-[#0f0f0f]/30 border-t border-[#1f1f1f] flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#f97316]" />
          <span className="text-[10px] text-[#888888] uppercase tracking-widest font-bold">Desenvolvimento</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          <span className="text-[10px] text-[#888888] uppercase tracking-widest font-bold">Review</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className="text-[10px] text-[#888888] uppercase tracking-widest font-bold">Produção</span>
        </div>
      </div>
    </div>
  );
}
