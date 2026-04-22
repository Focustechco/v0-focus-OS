import { supabase } from "@/lib/supabase"

export interface ReportGenerationParams {
  projectId: string
  startDate: string
  endDate: string
  reportType: "cliente" | "interno"
}

export interface ProjectReportData {
  projeto: any
  sprints: any[]
  tarefas: any[]
  aprovacoes: any[]
}

/** Loads all project data in parallel for report generation */
export async function loadProjectData(projectId: string): Promise<ProjectReportData> {
  const [projetoRes, sprintsRes, tarefasRes, aprovacoesRes] = await Promise.all([
    // Projeto with joins
    supabase
      .from("projetos")
      .select(`
        *,
        clientes!cliente_id(nome, empresa),
        tech_lead:equipe!tech_lead_id(nome, cargo),
        dev_secundario:equipe!dev_secundario_id(nome, cargo)
      `)
      .eq("id", projectId)
      .single(),

    // Sprints
    supabase
      .from("sprints")
      .select("*")
      .eq("projeto_id", projectId)
      .order("data_inicio", { ascending: true }),

    // Tarefas com responsável
    supabase
      .from("tarefas")
      .select(`
        *,
        responsavel:equipe!responsavel_id(nome, cargo)
      `)
      .eq("projeto_id", projectId)
      .order("updated_at", { ascending: false }),

    // Aprovações
    supabase
      .from("aprovacoes")
      .select("*")
      .eq("projeto_id", projectId)
      .order("created_at", { ascending: false }),
  ])

  return {
    projeto: projetoRes.data,
    sprints: sprintsRes.data ?? [],
    tarefas: tarefasRes.data ?? [],
    aprovacoes: aprovacoesRes.data ?? [],
  }
}

function calcProgress(tarefas: any[]) {
  if (!tarefas.length) return 0
  const done = tarefas.filter((t) => t.status === "concluida").length
  return Math.round((done / tarefas.length) * 100)
}

function calcSaude(progress: number, tarefas: any[]): "verde" | "amarelo" | "vermelho" {
  const vencidas = tarefas.filter((t) => {
    if (t.status === "concluida") return false
    if (!t.prazo) return false
    return new Date(t.prazo) < new Date()
  })
  if (progress >= 70 && vencidas.length === 0) return "verde"
  if (progress >= 40) return "amarelo"
  return "vermelho"
}

function filterByPeriod(items: any[], field: string, start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  e.setHours(23, 59, 59, 999)
  return items.filter((i) => {
    const d = new Date(i[field])
    return d >= s && d <= e
  })
}

function groupBySprintId(tarefas: any[]) {
  const groups: Record<string, any[]> = {}
  for (const t of tarefas) {
    const key = t.sprint_id ?? "__avulsas__"
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return groups
}

function sprintLabel(sprintId: string | null, sprints: any[]) {
  if (!sprintId) return "Avulsas"
  return sprints.find((s) => s.id === sprintId)?.nome ?? "Sprint"
}

function daysStalled(task: any) {
  return Math.floor(
    (Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export async function generateReportContent({
  projectId,
  startDate,
  endDate,
  reportType,
}: ReportGenerationParams) {
  const { projeto, sprints, tarefas, aprovacoes } = await loadProjectData(projectId)

  const progress = calcProgress(tarefas)
  const saude = calcSaude(progress, tarefas)

  const concluidas = tarefas.filter((t) => t.status === "concluida")
  const emAndamento = tarefas.filter((t) => t.status === "em_andamento")
  const bloqueadas = tarefas.filter(
    (t) =>
      t.status === "bloqueada" ||
      (t.status === "em_andamento" && daysStalled(t) >= 3)
  )
  const proximas = tarefas
    .filter((t) => t.status !== "concluida")
    .sort((a, b) => {
      if (!a.prazo) return 1
      if (!b.prazo) return -1
      return new Date(a.prazo).getTime() - new Date(b.prazo).getTime()
    })
    .slice(0, 10)

  const sprintAtiva = sprints.find((s) => s.status === "ativo") ?? sprints[sprints.length - 1]

  const dateStart = new Date(projeto?.created_at || Date.now()).toLocaleDateString("pt-BR")
  const dateEnd = new Date().toLocaleDateString("pt-BR")
  const nomeProjeto = projeto?.nome ?? "Projeto"
  const clienteNome = (projeto?.clientes as any)?.empresa ?? (projeto?.clientes as any)?.nome ?? "—"
  const techLeadNome = (projeto?.tech_lead as any)?.nome ?? "—"
  const devSecNome = (projeto?.dev_secundario as any)?.nome ?? null

  // ── Membros por produtividade ──────────────────────────────────
  const membrosMap: Record<string, any> = {}
  for (const t of tarefas) {
    const id = t.responsavel_id
    if (!id) continue
    if (!membrosMap[id]) {
      membrosMap[id] = {
        id,
        nome: t.responsavel?.nome ?? "Desconhecido",
        cargo: t.responsavel?.cargo ?? "",
        concluidas: 0,
        emAndamento: 0,
        naoIniciadas: 0,
      }
    }
    if (t.status === "concluida") membrosMap[id].concluidas++
    else if (t.status === "em_andamento") membrosMap[id].emAndamento++
    else membrosMap[id].naoIniciadas++
  }
  const membros = Object.values(membrosMap).sort(
    (a, b) => b.concluidas - a.concluidas
  )

  // ── Membros que tiveram tarefas concluídas no período ──────────
  const membrosPeriodo: Record<string, any> = {}
  for (const t of concluidas) {
    if (!t.responsavel_id) continue
    if (!membrosPeriodo[t.responsavel_id]) {
      membrosPeriodo[t.responsavel_id] = {
        nome: t.responsavel?.nome ?? "—",
        cargo: t.responsavel?.cargo ?? "",
        concluidas: 0,
      }
    }
    membrosPeriodo[t.responsavel_id].concluidas++
  }

  // Ensure tech lead and dev sec always appear
  if (projeto?.tech_lead_id && !membrosPeriodo[projeto.tech_lead_id]) {
    membrosPeriodo[projeto.tech_lead_id] = {
      nome: techLeadNome,
      cargo: "Tech Lead",
      concluidas: 0,
    }
  }
  if (projeto?.dev_secundario_id && !membrosPeriodo[projeto.dev_secundario_id]) {
    membrosPeriodo[projeto.dev_secundario_id] = {
      nome: devSecNome ?? "—",
      cargo: "Dev Secundário",
      concluidas: 0,
    }
  }

  const groupedTarefas = groupBySprintId(tarefas)

  // ════════════════════════════════════════════
  //  PARA O CLIENTE
  // ════════════════════════════════════════════
  if (reportType === "cliente") {
    return {
      version: "2.0",
      reportType,
      generatedAt: new Date().toISOString(),
      meta: {
        progresso: progress,
        saude,
        sprintAtiva: sprintAtiva?.nome,
        sprintFim: sprintAtiva?.data_fim,
        cliente: clienteNome,
        techLead: techLeadNome,
      },
      sections: {
        introducao: {
          titulo: "Resumo do Período",
          texto: `A equipe concluiu ${concluidas.length} entrega${concluidas.length !== 1 ? "s" : ""} no projeto ${nomeProjeto} até o dia corrente.`,
        },
        oQuefoiFeito: {
          titulo: "O que foi feito",
          grupos: Object.entries(groupedTarefas).map(([sprintId, tasks]) => ({
            sprint: sprintLabel(sprintId === "__avulsas__" ? null : sprintId, sprints),
            tarefas: tasks.map((t: any) => ({
              titulo: t.titulo,
              responsavel: t.responsavel?.nome ?? "—",
              cargo: t.responsavel?.cargo ?? "",
              data: t.updated_at,
              status: t.status,
            })),
          })),
        },
        progressoStatus: {
          titulo: "Progresso & Status",
          statusAtual: projeto?.status,
          progresso: progress,
          saude,
          sprintAtiva: sprintAtiva?.nome,
          sprintFim: sprintAtiva?.data_fim,
        },
        equipe: {
          titulo: "Equipe Responsável",
          membros: Object.entries(membrosPeriodo).map(([, m]) => m),
        },
        proximosPassos: {
          titulo: "Próximos Passos",
          texto: `Para o próximo período, estão planejadas ${proximas.length} atividade${proximas.length !== 1 ? "s" : ""}.`,
          tarefas: proximas.map((t) => ({
            titulo: t.titulo,
            responsavel: t.responsavel?.nome ?? "—",
            prazo: t.prazo,
          })),
        },
      },
    }
  }

  // ════════════════════════════════════════════
  //  INTERNO — EQUIPE
  // ════════════════════════════════════════════
  const diasRestantes = projeto?.prazo
    ? Math.ceil((new Date(projeto.prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return {
    version: "2.0",
    reportType,
    generatedAt: new Date().toISOString(),
    meta: {
      progresso: progress,
      saude,
      sprintAtiva: sprintAtiva?.nome,
      sprintFim: sprintAtiva?.data_fim,
      diasRestantes,
      techLead: techLeadNome,
    },
    sections: {
      statusProjeto: {
        titulo: "Status do Projeto",
        statusAtual: projeto?.status,
        progresso: progress,
        saude,
        sprintAtiva: sprintAtiva?.nome,
        sprintFim: sprintAtiva?.data_fim,
        diasRestantes,
      },
      oQuefoiFeitoTecnico: {
        titulo: "O que foi feito (técnico)",
        grupos: Object.entries(groupedTarefas).map(([sprintId, tasks]) => ({
          sprint: sprintLabel(sprintId === "__avulsas__" ? null : sprintId, sprints),
          tarefas: tasks.map((t: any) => ({
            titulo: t.titulo,
            responsavel: t.responsavel?.nome ?? "—",
            sprint: sprintLabel(t.sprint_id, sprints),
            data: t.updated_at,
            status: t.status,
          })),
        })),
      },
      emAndamento: {
        titulo: "Metas e Tasks em Andamento",
        tarefas: emAndamento.map((t) => ({
          titulo: t.titulo,
          responsavel: t.responsavel?.nome ?? "—",
          prazo: t.prazo,
          diasEmAndamento: daysStalled(t),
          alerta: daysStalled(t) >= 5,
        })),
      },
      bloqueios: {
        titulo: "Bloqueios",
        tarefas: bloqueadas.map((t) => ({
          titulo: t.titulo,
          responsavel: t.responsavel?.nome ?? "—",
          diasParado: daysStalled(t),
        })),
      },
      velocidade: {
        titulo: "Velocidade da Equipe",
        membros,
      },
      proximosPassosTecnicos: {
        titulo: "Próximos Passos Técnicos",
        tarefas: proximas.map((t) => ({
          titulo: t.titulo,
          sprint: sprintLabel(t.sprint_id, sprints),
          responsavel: t.responsavel?.nome ?? "—",
          prazo: t.prazo,
          prioridade: t.prioridade ?? "media",
        })),
      },
    },
  }
}
