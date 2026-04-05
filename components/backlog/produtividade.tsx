"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronDown,
} from "lucide-react"

type Period = "SEMANA" | "MES" | "TRIMESTRE"

const productivityData: Record<Period, { sector: string; percentage: number; tasks: number; hours: number; members: number }[]> = {
  SEMANA: [
    { sector: "Dev Backend", percentage: 92, tasks: 34, hours: 156, members: 4 },
    { sector: "Dev Frontend", percentage: 88, tasks: 28, hours: 142, members: 3 },
    { sector: "DevSecOps", percentage: 85, tasks: 18, hours: 98, members: 2 },
    { sector: "Design", percentage: 78, tasks: 22, hours: 88, members: 2 },
    { sector: "Comercial", percentage: 72, tasks: 15, hours: 64, members: 2 },
    { sector: "Juridico", percentage: 68, tasks: 12, hours: 52, members: 1 },
    { sector: "ADM", percentage: 55, tasks: 8, hours: 38, members: 1 },
  ],
  MES: [
    { sector: "Dev Backend", percentage: 89, tasks: 142, hours: 620, members: 4 },
    { sector: "Dev Frontend", percentage: 86, tasks: 118, hours: 580, members: 3 },
    { sector: "DevSecOps", percentage: 82, tasks: 76, hours: 400, members: 2 },
    { sector: "Design", percentage: 80, tasks: 94, hours: 360, members: 2 },
    { sector: "Comercial", percentage: 75, tasks: 62, hours: 260, members: 2 },
    { sector: "Juridico", percentage: 70, tasks: 48, hours: 210, members: 1 },
    { sector: "ADM", percentage: 60, tasks: 34, hours: 155, members: 1 },
  ],
  TRIMESTRE: [
    { sector: "Dev Backend", percentage: 87, tasks: 420, hours: 1850, members: 4 },
    { sector: "Dev Frontend", percentage: 84, tasks: 355, hours: 1720, members: 3 },
    { sector: "DevSecOps", percentage: 80, tasks: 225, hours: 1180, members: 2 },
    { sector: "Design", percentage: 79, tasks: 280, hours: 1080, members: 2 },
    { sector: "Comercial", percentage: 73, tasks: 185, hours: 780, members: 2 },
    { sector: "Juridico", percentage: 68, tasks: 142, hours: 625, members: 1 },
    { sector: "ADM", percentage: 58, tasks: 102, hours: 465, members: 1 },
  ],
}

const leaderboard = [
  { rank: 1, name: "Carlos Silva", sector: "Dev Backend", score: 98, initials: "CS" },
  { rank: 2, name: "Ana Santos", sector: "Dev Frontend", score: 95, initials: "AS" },
  { rank: 3, name: "Pedro Lima", sector: "DevSecOps", score: 92, initials: "PL" },
  { rank: 4, name: "Mariana Costa", sector: "Design", score: 89, initials: "MC" },
  { rank: 5, name: "Lucas Ferreira", sector: "Comercial", score: 85, initials: "LF" },
]

export function Produtividade() {
  const [period, setPeriod] = useState<Period>("SEMANA")
  const [expandedSector, setExpandedSector] = useState<string | null>(null)
  const [animated, setAnimated] = useState(false)

  const data = productivityData[period]
  const average = Math.round(data.reduce((acc, d) => acc + d.percentage, 0) / data.length)
  const highlight = data.reduce((prev, current) => (prev.percentage > current.percentage ? prev : current))
  const alert = data.reduce((prev, current) => (prev.percentage < current.percentage ? prev : current))

  useEffect(() => {
    setAnimated(false)
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [period])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-xl font-display font-bold text-white tracking-wide truncate">
            PRODUTIVIDADE — {period === "SEMANA" ? "SEMANA" : period === "MES" ? "MES" : "TRIMESTRE"}
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm font-mono mt-1">analise de performance</p>
        </div>

        <div className="flex items-center gap-1 bg-[#141414] border border-[#2a2a2a] rounded p-1 w-full sm:w-auto">
          {(["SEMANA", "MES", "TRIMESTRE"] as Period[]).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none font-mono text-[10px] sm:text-xs tracking-widest ${
                period === p
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {p === "SEMANA" ? "SEM" : p === "MES" ? "MES" : "TRI"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={item.sector}>
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedSector(expandedSector === item.sector ? null : item.sector)}
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-neutral-400 font-mono text-sm w-28 truncate">{item.sector}</span>
                        <div className="flex-1 h-8 bg-[#1a1a1a] rounded relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-orange-400 rounded transition-all duration-800 ease-out flex items-center justify-end pr-3"
                            style={{
                              width: animated ? `${item.percentage}%` : "0%",
                              transitionDelay: `${index * 100}ms`,
                            }}
                          >
                            <span className="text-white font-mono text-sm font-bold">{item.percentage}%</span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-neutral-500 transition-transform ${
                            expandedSector === item.sector ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {expandedSector === item.sector && (
                      <div className="ml-32 p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a] mb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-neutral-500 text-xs font-mono uppercase">Tasks Concluidas</p>
                            <p className="text-white text-lg font-display font-bold">{item.tasks}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500 text-xs font-mono uppercase">Horas Trabalhadas</p>
                            <p className="text-white text-lg font-display font-bold">{item.hours}h</p>
                          </div>
                          <div>
                            <p className="text-neutral-500 text-xs font-mono uppercase">Membros</p>
                            <p className="text-white text-lg font-display font-bold">{item.members}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-[#141414] border-[#2a2a2a]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-neutral-500 text-xs font-mono uppercase mb-1">Media Geral</p>
                    <p className="text-3xl font-display font-bold text-white">{average}%</p>
                  </div>
                  <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#2a2a2a] border-l-2 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-neutral-500 text-xs font-mono uppercase mb-1">Setor Destaque</p>
                    <p className="text-xl font-display font-bold text-green-500">{highlight.sector}</p>
                    <p className="text-neutral-400 text-sm font-mono">{highlight.percentage}%</p>
                  </div>
                  <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#2a2a2a] border-l-2 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-neutral-500 text-xs font-mono uppercase mb-1">Setor em Alerta</p>
                    <p className="text-xl font-display font-bold text-red-500">{alert.sector}</p>
                    <p className="text-neutral-400 text-sm font-mono">{alert.percentage}%</p>
                  </div>
                  <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="bg-[#141414] border-[#2a2a2a] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                Ranking de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {leaderboard.map((person) => (
                    <div
                      key={person.rank}
                      className={`flex items-center gap-3 p-3 rounded border transition-all ${
                        person.rank === 1
                          ? "bg-orange-500/10 border-orange-500/30"
                          : person.rank === 2
                          ? "bg-neutral-500/10 border-neutral-500/30"
                          : person.rank === 3
                          ? "bg-amber-700/10 border-amber-700/30"
                          : "bg-[#1a1a1a] border-[#2a2a2a]"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          person.rank === 1
                            ? "bg-orange-500 text-white"
                            : person.rank === 2
                            ? "bg-neutral-400 text-black"
                            : person.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-[#2a2a2a] text-neutral-400"
                        }`}
                      >
                        {person.rank}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs font-mono">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{person.name}</p>
                        <p className="text-neutral-500 text-xs font-mono">{person.sector}</p>
                      </div>
                      <Badge className="bg-[#1a1a1a] text-orange-500 font-mono text-xs">
                        {person.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
