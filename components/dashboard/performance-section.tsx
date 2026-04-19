"use client"

import { useState } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts"
import { TrendingUp, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePerformanceMetrics } from "@/lib/hooks/use-performance-metrics"

const SECTORS = ["Todos", "Comercial", "Criativo", "Tech", "Administração", "Financeiro"]

export function PerformanceSection() {
  const [selectedSector, setSelectedSector] = useState("Todos")
  const { metrics, isLoading } = usePerformanceMetrics(selectedSector === "Todos" ? null : selectedSector)

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = outerRadius + 20
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="#888"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-[10px] font-mono font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-500/10 rounded">
          <TrendingUp className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-lg font-display font-bold text-white tracking-widest uppercase">
          Visão Geral do Desempenho da Equipe
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Progresso das Tarefas (Donut) */}
        <Card className="bg-[#1a1a1a] border-[#2A2A2A] overflow-hidden">
          <CardHeader className="py-4 border-b border-[#2A2A2A]">
            <CardTitle className="text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Progresso das Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full flex flex-col items-center">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-neutral-600 font-mono text-xs animate-pulse">
                  CALCULANDO METRICAS...
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={metrics?.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {metrics?.statusDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px' }}
                        itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Custom Legend */}
                  <div className="flex gap-4 mt-4">
                    {metrics?.statusDistribution?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 focus:outline-none">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-neutral-400 font-mono uppercase truncate max-w-[80px]">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Produtividade por Setor (Bar) */}
        <Card className="bg-[#1a1a1a] border-[#2A2A2A] overflow-hidden">
          <CardHeader className="py-2 px-4 border-b border-[#2A2A2A] flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Produtividade do Periodo
            </CardTitle>
            <div className="flex gap-1 overflow-x-auto max-w-[60%] no-scrollbar px-2">
              {SECTORS.map((sector) => (
                <Button
                  key={sector}
                  variant="ghost"
                  onClick={() => setSelectedSector(sector)}
                  className={cn(
                    "px-2 py-1 h-6 text-[9px] font-bold uppercase transition-all rounded-sm",
                    selectedSector === sector 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                      : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                  )}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-neutral-600 font-mono text-xs animate-pulse">
                  SINCRONIZANDO DADOS...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.productivityData} margin={{ left: -20, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px' }}
                      itemStyle={{ color: '#FF6B00', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    <Bar 
                      dataKey="concluidas" 
                      fill="#FF6B00" 
                      radius={[4, 4, 0, 0]} 
                      barSize={selectedSector === "Todos" ? 30 : 20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
