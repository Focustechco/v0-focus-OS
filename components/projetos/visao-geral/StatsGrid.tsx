'use client';

import React from 'react';
import { Briefcase, Zap, CheckCircle2, ListTodo } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#888888] mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend && (
            <p className="text-[10px] text-[#4ade80] mt-2 flex items-center">
              <span>↑ {trend} desde a última sprint</span>
            </p>
          )}
        </div>
        <div className="p-2.5 bg-[#1f1f1f] rounded-lg">
          <Icon className="w-5 h-5 text-[#f97316]" />
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats?: {
    activeProjects?: number;
    activeSprints?: number;
    pendingApprovals?: number;
    completedTasks?: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label="Projetos Ativos" value={stats?.activeProjects ?? 0} icon={Briefcase} />
      <StatCard label="Sprints em Andamento" value={stats?.activeSprints ?? 0} icon={Zap} trend="12%" />
      <StatCard label="Aprovações Pendentes" value={stats?.pendingApprovals ?? 0} icon={CheckCircle2} />
      <StatCard label="Tarefas Concluídas" value={stats?.completedTasks ?? 0} icon={ListTodo} trend="5%" />
    </div>
  );
}
