'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { BacklogBoard } from '@/components/projetos/backlog/BacklogBoard';
import { useClickUpTasks } from '@/hooks/useClickUpTasks';
import { ListTodo, Search, Filter, LayoutGrid, List } from 'lucide-react';

export default function BacklogPage() {
  const LIST_ID = process.env.NEXT_PUBLIC_CLICKUP_LIST_ID || '901201568444';
  const { tasks, isLoading, error } = useClickUpTasks(LIST_ID);

  return (
    <ProjectsLayout counts={{ sprints: 2, backlog: tasks.length, approvals: 8 }}>
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <ListTodo className="w-8 h-8 text-[#f97316] mr-3" />
                Backlog
              </h1>
              <p className="text-[#888888]">Épicos, tarefas e dívida técnica pendentes.</p>
            </div>
            <div className="flex space-x-3">
              <div className="flex bg-[#161616] p-1 rounded-lg border border-[#1f1f1f]">
                <button className="p-1.5 bg-[#1f1f1f] text-white rounded-md">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#444] hover:text-[#888]">
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button className="px-4 py-2 bg-[#f97316] text-white text-sm font-bold rounded-lg hover:bg-[#ea580c] transition-colors">
                Criar Tarefa
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input 
                type="text" 
                placeholder="Pesquisar tarefas..." 
                className="w-full bg-[#161616] border border-[#1f1f1f] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f97316]/50 transition-colors"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-[#161616] border border-[#1f1f1f] rounded-lg text-sm text-[#888888] hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
            <div className="flex items-center space-x-2 bg-[#161616] border border-[#1f1f1f] rounded-lg p-1">
              <button className="px-3 py-1 text-[10px] font-bold text-white bg-[#1f1f1f] rounded-md uppercase">Por Status</button>
              <button className="px-3 py-1 text-[10px] font-bold text-[#444] hover:text-[#888] uppercase">Por Épico</button>
              <button className="px-3 py-1 text-[10px] font-bold text-[#444] hover:text-[#888] uppercase">Por Membro</button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#161616]/50 border border-[#1f1f1f] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 rounded-xl">
            <p className="text-[#fca5a5]">Erro ao carregar backlog: {error}</p>
          </div>
        ) : (
          <BacklogBoard tasks={tasks} />
        )}
      </div>
    </ProjectsLayout>
  );
}
