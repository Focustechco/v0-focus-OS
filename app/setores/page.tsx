"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  Code,
  Shield,
  Zap,
  Briefcase,
  Users,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react"

const sectors = [
  {
    id: "dev",
    name: "DESENVOLVIMENTO",
    subtitle: "Web & Mobile",
    icon: Code,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    stats: {
      projects: 12,
      team: 5,
      sprints: 4,
      load: 80,
    },
    team: [
      { name: "Gabriel", role: "Tech Lead", status: "ativo" },
      { name: "Joao", role: "Fullstack", status: "em-sprint" },
      { name: "Maria", role: "Frontend", status: "em-sprint" },
      { name: "Pedro", role: "Backend", status: "em-task" },
      { name: "Ana", role: "Mobile", status: "ativo" },
    ],
    recentProjects: [
      { id: "PRJ-042", name: "Sistema de Gestao", progress: 80 },
      { id: "PRJ-041", name: "App E-commerce", progress: 45 },
      { id: "PRJ-040", name: "Automacao Vendas", progress: 60 },
    ],
  },
  {
    id: "devsecops",
    name: "DEVSECOPS",
    subtitle: "Infra & Deploy",
    icon: Shield,
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    stats: {
      projects: 8,
      team: 2,
      deploys: 15,
      load: 75,
    },
    team: [
      { name: "DevSecOps Lead", role: "Lead", status: "ativo" },
      { name: "Infra Jr", role: "Junior", status: "em-task" },
    ],
    recentProjects: [
      { id: "PRJ-037", name: "Portal Cliente", progress: 95 },
      { id: "PRJ-035", name: "Sistema Tickets", progress: 100 },
    ],
  },
  {
    id: "automacoes",
    name: "AUTOMACOES",
    subtitle: "n8n / Scripts",
    icon: Zap,
    color: "bg-yellow-500",
    borderColor: "border-yellow-500",
    stats: {
      projects: 5,
      active: 23,
      workflows: 45,
      load: 90,
    },
    team: [
      { name: "Gabriel", role: "Tech Lead", status: "ativo" },
      { name: "Carlos", role: "Automation", status: "em-sprint" },
    ],
    recentProjects: [
      { id: "PRJ-040", name: "Automacao Vendas", progress: 70 },
      { id: "PRJ-033", name: "Bot WhatsApp", progress: 100 },
    ],
  },
  {
    id: "comercial",
    name: "COMERCIAL & ESTRATEGIA",
    subtitle: "Vendas & Relacionamento",
    icon: Briefcase,
    color: "bg-green-500",
    borderColor: "border-green-500",
    stats: {
      pipeline: 15,
      mrr: "R$ 45.000",
      conversion: "68%",
      load: 65,
    },
    team: [
      { name: "Comercial Lead", role: "Lead", status: "reuniao" },
      { name: "SDR", role: "Prospecção", status: "ativo" },
    ],
    recentProjects: [
      { id: "PRJ-038", name: "Sistema Gestao", progress: 20 },
      { id: "PRJ-035", name: "Proposta Portal", progress: 100 },
    ],
  },
]

function SectorCard({ sector }: { sector: typeof sectors[0] }) {
  const Icon = sector.icon
  
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] border-t-4 ${sector.borderColor} hover:border-orange-500/30 transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${sector.color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-white tracking-wider">
                {sector.name}
              </CardTitle>
              <p className="text-[10px] text-neutral-500">{sector.subtitle}</p>
            </div>
          </div>
          <Badge className={`${sector.color} text-white text-[10px]`}>
            {sector.stats.load}% carga
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(sector.stats).slice(0, 3).map(([key, value]) => (
            <div key={key} className="p-2 bg-[#0A0A0A] rounded text-center">
              <div className="text-lg font-bold text-white font-mono">{value}</div>
              <div className="text-[9px] text-neutral-500 capitalize">{key}</div>
            </div>
          ))}
        </div>

        {/* Load Bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-neutral-500">Carga de Trabalho</span>
            <span className={`font-mono ${sector.stats.load >= 90 ? "text-red-500" : sector.stats.load >= 75 ? "text-yellow-500" : "text-green-500"}`}>
              {sector.stats.load}%
            </span>
          </div>
          <Progress value={sector.stats.load} className="h-1.5 bg-[#2A2A2A]" />
        </div>

        {/* Team */}
        <div>
          <div className="text-[10px] text-neutral-500 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            EQUIPE
          </div>
          <div className="space-y-1">
            {sector.team.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    member.status === "ativo" ? "bg-green-500" :
                    member.status === "em-sprint" ? "bg-orange-500" :
                    member.status === "em-task" ? "bg-blue-500" :
                    "bg-purple-500"
                  }`} />
                  <span className="text-xs text-white">{member.name}</span>
                </div>
                <span className="text-[9px] text-neutral-500">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="text-[10px] text-neutral-500 mb-2 flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            PROJETOS RECENTES
          </div>
          <div className="space-y-2">
            {sector.recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-orange-500 font-mono">{project.id}</span>
                  <span className="text-xs text-neutral-300 truncate max-w-[120px]">{project.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-16 h-1 bg-[#2A2A2A]" />
                  <span className="text-[10px] text-neutral-500 font-mono w-8">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full h-8 text-xs bg-orange-500 hover:bg-orange-600">
          Ver Detalhes
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SetoresPage() {
  const totalProjects = sectors.reduce((acc, s) => acc + (s.stats.projects || 0), 0)
  const totalTeam = sectors.reduce((acc, s) => acc + (s.stats.team || s.team.length), 0)
  const avgLoad = Math.round(sectors.reduce((acc, s) => acc + s.stats.load, 0) / sectors.length)

  return (
    <PageWrapper title="SETORES TECH" breadcrumb="SETORES TECH">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Setores Tech</h1>
              <p className="text-sm text-neutral-500">Dashboard por setor de tecnologia</p>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{sectors.length}</div>
                  <div className="text-xs text-neutral-500">Setores Ativos</div>
                </div>
                <Cpu className="w-8 h-8 text-orange-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{totalProjects}</div>
                  <div className="text-xs text-neutral-500">Projetos Total</div>
                </div>
                <FolderKanban className="w-8 h-8 text-blue-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{totalTeam}</div>
                  <div className="text-xs text-neutral-500">Membros da Equipe</div>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </CardContent>
            </Card>
            <Card className={`${avgLoad >= 80 ? "bg-red-500/10 border-red-500/30" : avgLoad >= 70 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold font-mono ${avgLoad >= 80 ? "text-red-500" : avgLoad >= 70 ? "text-yellow-500" : "text-green-500"}`}>
                    {avgLoad}%
                  </div>
                  <div className="text-xs text-neutral-500">Carga Media</div>
                </div>
                <TrendingUp className={`w-8 h-8 ${avgLoad >= 80 ? "text-red-500" : avgLoad >= 70 ? "text-yellow-500" : "text-green-500"}`} />
              </CardContent>
            </Card>
          </div>

          {/* Sectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectors.map((sector) => (
              <SectorCard key={sector.id} sector={sector} />
            ))}
          </div>
    </PageWrapper>
  )
}
