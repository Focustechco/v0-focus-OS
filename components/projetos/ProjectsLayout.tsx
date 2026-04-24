'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, ListTodo, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectsLayoutProps {
  children: React.ReactNode;
  counts?: {
    sprints?: number;
    backlog?: number;
    approvals?: number;
  };
}

import { PageWrapper } from '@/components/page-wrapper';

export function ProjectsLayout({ children, counts }: ProjectsLayoutProps) {
  const pathname = usePathname();

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
