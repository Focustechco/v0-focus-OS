import React from 'react'

export function KPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {children}
    </div>
  )
}

interface KPICardProps {
  title: string
  value: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  trend?: { value: number; label: string; positive: boolean }
}

export function KPICard({ title, value, subtitle, icon, trend }: KPICardProps) {
  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-mono text-neutral-400 font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-neutral-500">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-display font-medium text-white mb-1">{value}</div>
        {subtitle && <div className="text-sm text-neutral-500">{subtitle}</div>}
        {trend && (
          <div className={`text-xs mt-2 flex items-center gap-1 ${trend.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            <span>{trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="text-neutral-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
