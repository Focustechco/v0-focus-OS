'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, ListTodo, CheckCircle2, Calendar, FolderKanban, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/page-wrapper';
import { useProjectsContext } from '@/contexts/ProjectsContext';

interface ProjectsLayoutProps {
  children: React.ReactNode;
  counts?: {
    sprints?: number;
    backlog?: number;
    approvals?: number;
  };
}

export function ProjectsLayout({ children, counts }: ProjectsLayoutProps) {
  const pathname = usePathname();
  const { 
    selectedListId, 
    setSelectedListId, 
    spaces, 
    isLoadingSpaces, 
    spacesError 
  } = useProjectsContext();

  const navItems = [
    { name: 'Visão Geral', href: '/projetos', icon: LayoutDashboard },
    { name: 'Sprints', href: '/projetos/sprints', icon: Zap, count: counts?.sprints },
    { name: 'Backlog', href: '/projetos/backlog', icon: ListTodo, count: counts?.backlog },
    { name: 'Aprovações', href: '/projetos/aprovacoes', icon: CheckCircle2, count: counts?.approvals },
    { name: 'Prazos', href: '/projetos/prazos', icon: Calendar },
  ];

  return (
    <PageWrapper title="Projetos" breadcrumb="Módulo de Gestão">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        
        {/* Global Space / List Selector */}
        <div className="p-4 bg-[#161616] border border-[#1f1f1f] rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#f97316]/10 rounded-lg">
              <FolderKanban className="w-5 h-5 text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Selecione o Projeto / Lista</h2>
              <p className="text-xs text-[#888888]">Os dados abaixo serão sincronizados com a lista selecionada</p>
            </div>
          </div>

          <div className="w-full sm:w-auto min-w-[250px]">
            {isLoadingSpaces ? (
              <div className="flex items-center space-x-2 text-sm text-[#888888] bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#f97316]" />
                <span>Carregando espaços do ClickUp...</span>
              </div>
            ) : spacesError ? (
              <div className="text-sm text-red-400 bg-[#7f1d1d]/10 border border-[#7f1d1d]/20 px-3 py-2.5 rounded-lg">
                Erro: {spacesError}
              </div>
            ) : (
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#f97316] transition-colors cursor-pointer appearance-none"
              >
                <option value="">Selecione uma lista...</option>
                {spaces.map((space: any) => (
                  <optgroup key={space.id} label={`📂 ${space.name}`}>
                    {(space.folderless_lists || []).map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                    {(space.folders || []).map((f: any) =>
                      (f.lists || []).map((l: any) => (
                        <option key={l.id} value={l.id}>
                          {f.name} → {l.name}
                        </option>
                      ))
                    )}
                  </optgroup>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-[#1f1f1f] pb-px overflow-x-auto no-scrollbar snap-x snap-proximity">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center space-x-2 py-4 px-4 text-xs sm:text-sm font-medium transition-colors hover:text-white whitespace-nowrap snap-start",
                  isActive ? "text-white" : "text-[#888888]"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.count !== undefined && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-[#f97316] text-white rounded-full">
                    {item.count}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </PageWrapper>
  );
}
