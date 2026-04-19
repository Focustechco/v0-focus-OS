import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useComercialIntel() {
  const fetcher = async () => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // 1. Métricas Globais
    const [
      { count: oportunidadesAtivas },
      { data: mrrData },
      { data: conversionData },
      { data: ticketMedioData },
      { data: sdrStats },
      { data: closerStats },
      { data: pipelineStats },
      { data: equipeComercial }
    ] = await Promise.all([
      // Oportunidades Ativas
      supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "in", '("fechado_ganho","fechado_perdido")'),
      
      // MRR Total (Ganhos no mês)
      supabase.from("leads").select("valor").eq("status", "fechado_ganho").gte("fechado_em", firstDayOfMonth),
      
      // Conversão
      supabase.from("leads").select("status").gte("created_at", firstDayOfMonth),
      
      // Ticket Médio
      supabase.from("leads").select("valor").eq("status", "fechado_ganho"),

      // SDR Stats
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("origem", "sdr").gte("created_at", firstDayOfMonth),

      // Closer Stats
      supabase.from("leads").select("status").in("status", ["proposta_enviada", "negociacao", "fechado_ganho"]),

      // Pipeline Distribution
      supabase.from("leads").select("status"),

      // Equipe Comercial
      supabase.from("team").select("*").in("sector", ["SDR", "Closer", "Comercial"])
    ])

    // Cálculos
    const mrrTotal = mrrData?.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0
    const ticketMedio = ticketMedioData && ticketMedioData.length > 0 
      ? (ticketMedioData.reduce((acc, curr) => acc + Number(curr.valor), 0) || 0) / ticketMedioData.length 
      : 0
    
    const leadsNoMes = conversionData?.length || 0
    const ganhosNoMes = conversionData?.filter(l => l.status === 'fechado_ganho').length || 0
    const conversionRate = leadsNoMes > 0 ? (ganhosNoMes / leadsNoMes) * 100 : 0

    // Pipeline format
    const pipelineGroups = (pipelineStats || []).reduce((acc: any, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    return {
      kpis: {
        oportunidadesAtivas: oportunidadesAtivas || 0,
        mrrTotal,
        conversionRate,
        ticketMedio
      },
      sdr: {
        leadsGerados: sdrStats || 0,
        metaLeads: 50,
        contatosRealizados: 124,
        reunioesAgendadas: 12
      },
      closer: {
        propostasEnviadas: closerStats?.filter(l => l.status === 'proposta_enviada').length || 0,
        emNegociacao: closerStats?.filter(l => l.status === 'negociacao').length || 0,
        fechadosMes: ganhosNoMes,
        metaFechamentos: 10
      },
      pipeline: pipelineGroups,
      equipe: equipeComercial || []
    }
  }

  const { data, error, isLoading, mutate } = useSWR("comercial-intel-metrics", fetcher)

  // Realtime
  useEffect(() => {
    const channelId = `comercial_intel_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate
  }
}
