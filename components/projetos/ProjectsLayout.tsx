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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header / Tabs */}
      <div className="sticky top-0 z-40 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 h-full px-1 text-sm font-medium transition-colors hover:text-white",
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
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
