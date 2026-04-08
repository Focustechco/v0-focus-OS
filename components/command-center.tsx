"use client"

import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  ListTodo,
  Zap,
  Activity as ActivityIcon,
  Loader2,
} from "lucide-react"

interface DashboardStats {
  projects: { total: number; active: number; at_risk: number }
  tasks: { open: number }
  sprints: { active: number }
  approvals: { pending: number }
  deals: {
    open: number
    pipeline_by_stage: Record<string, { count: number; value: number; mrr: number }>
  }
  activity: Array<{
    id: string
    actor_name: string
    action: string
    entity_type: string
    entity_name: string | null
    created_at: string
  }>
  updated_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.json() as Promise<DashboardStats>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(iso: string) {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h atrás`
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d atrás`
}

export function CommandCenter() {
  const { data, error, isLoading } = useSWR<DashboardStats>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 60_000 }
  )

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-neutral-500">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              Erro ao carregar dashboard
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {(error as Error).message}
            </p>
            <p className="mt-3 text-[11px] text-neutral-500">
              Verifique se as variáveis <code className="rounded bg-[#0A0A0A] px-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-[#0A0A0A] px-1 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estão definidas e o schema SQL foi aplicado.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const totalPipelineValue = Object.values(data.deals.pipeline_by_stage).reduce(
    (sum, s) => sum + s.value,
    0
  )
  const totalMrr = Object.values(data.deals.pipeline_by_stage).reduce(
    (sum, s) => sum + s.mrr,
    0
  )

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        <KpiCard
          label="Projetos Ativos"
          value={data.projects.active}
          icon={FolderKanban}
          href="/projetos"
          accent="text-orange-500"
        />
        <KpiCard
          label="Em Risco"
          value={data.projects.at_risk}
          icon={AlertTriangle}
          href="/projetos?health=at_risk"
          accent="text-red-400"
        />
        <KpiCard
          label="Sprints Ativas"
          value={data.sprints.active}
          icon={Zap}
          href="/sprints"
          accent="text-yellow-400"
        />
        <KpiCard
          label="Tasks Abertas"
          value={data.tasks.open}
          icon={ListTodo}
          href="/tasks"
          accent="text-blue-400"
        />
        <KpiCard
          label="Aprovações"
          value={data.approvals.pending}
          icon={Clock}
          href="/aprovacoes"
          accent="text-purple-400"
        />
        <KpiCard
          label="Deals em Aberto"
          value={data.deals.open}
          icon={Briefcase}
          href="/comercial"
          accent="text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Pipeline Overview */}
        <Card className="border-[#2A2A2A] bg-[#141414] lg:col-span-5">
          <CardHeader className="border-b border-[#2A2A2A] pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium tracking-wider text-neutral-300">
              PIPELINE COMERCIAL
              <Link
                href="/comercial"
                className="text-[10px] text-orange-500 hover:text-orange-400"
              >
                VER TUDO →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4 grid grid-cols-2 gap-4 border-b border-[#2A2A2A] pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-neutral-500">
                  Valor em Pipeline
                </p>
                <p className="mt-1 font-display text-xl font-bold text-white">
                  {formatCurrency(totalPipelineValue)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-neutral-500">
                  MRR Previsto
                </p>
                <p className="mt-1 font-display text-xl font-bold text-green-400">
                  {formatCurrency(totalMrr)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(data.deals.pipeline_by_stage).length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-600">
                  Nenhum deal cadastrado ainda.
                </p>
              ) : (
                Object.entries(data.deals.pipeline_by_stage).map(([stage, s]) => (
                  <div
                    key={stage}
                    className="flex items-center justify-between rounded bg-[#0A0A0A] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase text-neutral-400">
                        {stage}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-orange-500/30 bg-orange-500/10 text-[10px] text-orange-400"
                      >
                        {s.count}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-neutral-300">
                      {formatCurrency(s.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-[#2A2A2A] bg-[#141414] lg:col-span-7">
          <CardHeader className="border-b border-[#2A2A2A] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider text-neutral-300">
              <ActivityIcon className="h-4 w-4 text-orange-500" />
              ATIVIDADE RECENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto pt-4">
            {data.activity.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-neutral-700" />
                <p className="text-xs text-neutral-600">
                  Sem atividade registrada ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.activity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 border-l-2 border-orange-500/40 py-1 pl-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-300">
                        <span className="font-medium text-orange-500">
                          {log.actor_name}
                        </span>{" "}
                        {log.action}
                        {log.entity_name && (
                          <span className="text-neutral-400"> · {log.entity_name}</span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-neutral-600">
                        {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-[#2A2A2A] bg-[#141414]">
        <CardHeader className="border-b border-[#2A2A2A] pb-3">
          <CardTitle className="text-sm font-medium tracking-wider text-neutral-300">
            ACESSO RÁPIDO
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickAction href="/projetos" icon={FolderKanban} label="Projetos" />
            <QuickAction href="/sprints" icon={Zap} label="Sprints" />
            <QuickAction href="/comercial" icon={Briefcase} label="CRM" />
            <QuickAction href="/relatorios" icon={ArrowRight} label="Relatórios" />
          </div>
        </CardContent>
      </Card>

      <p className="text-right font-mono text-[10px] text-neutral-600">
        Última atualização: {new Date(data.updated_at).toLocaleTimeString("pt-BR")}
      </p>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-[#2A2A2A] bg-[#141414] p-4 transition-colors hover:border-orange-500/50 hover:bg-[#1A1A1A]"
    >
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase leading-tight text-neutral-500">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${accent} opacity-70 group-hover:opacity-100`} />
      </div>
      <p className={`mt-2 font-display text-2xl font-bold ${accent}`}>{value}</p>
    </Link>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start border-[#2A2A2A] bg-[#0A0A0A] py-3 text-neutral-300 hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-500"
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}
