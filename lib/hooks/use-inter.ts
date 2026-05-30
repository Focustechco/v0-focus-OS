"use client"

import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

export function useInter() {
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS') // TODOS, ENTRADAS, SAIDAS, PIX, BOLETO, TED
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('30') // 1, 7, 30, 90, custom
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [busca, setBusca] = useState<string>('')
  const [pagina, setPagina] = useState<number>(0)

  // Determinar datas com base no período selecionado
  const obterDatasFiltro = () => {
    if (filtroPeriodo === 'custom' && dataInicio && dataFim) {
      return { inicio: dataInicio, fim: dataFim }
    }
    const hoje = new Date()
    let inicio = new Date()
    
    if (filtroPeriodo === '1') {
      inicio = hoje
    } else if (filtroPeriodo === '7') {
      inicio.setDate(hoje.getDate() - 7)
    } else if (filtroPeriodo === '30') {
      inicio.setDate(hoje.getDate() - 30)
    } else if (filtroPeriodo === '90') {
      inicio.setDate(hoje.getDate() - 90)
    }
    
    return {
      inicio: inicio.toISOString().split('T')[0],
      fim: hoje.toISOString().split('T')[0]
    }
  }

  const dates = obterDatasFiltro()

  // SWR queries
  const { 
    data: saldoData, 
    error: errSaldo, 
    mutate: mutateSaldo, 
    isLoading: loadingSaldo 
  } = useSWR('/api/inter/saldo', fetcher, { 
    revalidateOnFocus: false,
    refreshInterval: 300000 // 5 minutos auto-sincronização
  })

  const { 
    data: extratoData, 
    error: errExtrato, 
    mutate: mutateExtrato, 
    isLoading: loadingExtrato 
  } = useSWR(
    `/api/inter/extrato?dataInicio=${dates.inicio}&dataFim=${dates.fim}&pagina=${pagina}&tamanhoPagina=50`, 
    fetcher, 
    { revalidateOnFocus: false }
  )

  const { 
    data: resumoData, 
    error: errResumo, 
    isLoading: loadingResumo 
  } = useSWR('/api/inter/extrato?resumo=true', fetcher, { revalidateOnFocus: false })

  const { 
    data: chavesData, 
    error: errChaves, 
    isLoading: loadingChaves 
  } = useSWR('/api/inter/pix?action=chaves', fetcher, { revalidateOnFocus: false })

  // Funções de ação
  const enviarPix = async (valor: number, chave: string, descricao: string) => {
    const res = await fetch('/api/inter/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pagar', valor, chave, descricao })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar Pix')
    mutateSaldo()
    mutateExtrato()
    return data
  }

  const cobrarPix = async (valor: number, chave: string, descricao: string) => {
    const res = await fetch('/api/inter/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cobrar', valor, chave, descricao })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobrança Pix')
    mutateExtrato()
    return data
  }

  const validarChavePix = async (chave: string) => {
    const res = await fetch('/api/inter/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validar', chave })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao validar chave Pix')
    return data
  }

  const emitirBoleto = async (valor: number, vencimento: string, pagador: any) => {
    const res = await fetch('/api/inter/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'emitir', valor, vencimento, pagador })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao emitir boleto')
    mutateExtrato()
    return data
  }

  const validarCodigoBarras = async (codigoBarras: string) => {
    const res = await fetch('/api/inter/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validar', codigoBarras })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao validar boleto')
    return data
  }

  const pagarBoleto = async (codigoBarras: string, valor: number) => {
    const res = await fetch('/api/inter/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pagar', codigoBarras, valor })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao pagar boleto')
    mutateSaldo()
    mutateExtrato()
    return data
  }

  const transferirTED = async (valor: number, favorecido: any) => {
    const res = await fetch('/api/inter/transferencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor, favorecido })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao transferir TED')
    mutateSaldo()
    mutateExtrato()
    return data
  }

  const exportarExtrato = async (formato: 'PDF' | 'CSV') => {
    window.open(`/api/inter/exportar?dataInicio=${dates.inicio}&dataFim=${dates.fim}&formato=${formato}`, '_blank');
  }

  const sincronizarManual = async () => {
    await Promise.all([mutateSaldo(), mutateExtrato()]);
  }

  // Filtragem local do extrato
  const transacoesFiltradas = (extratoData?.transacoes || []).filter((t: any) => {
    // Filtro por tipo
    if (filtroTipo === 'ENTRADAS' && t.tipoLancamento !== 'CREDITO') return false
    if (filtroTipo === 'SAIDAS' && t.tipoLancamento !== 'DEBITO') return false
    if (filtroTipo === 'PIX' && t.canal !== 'PIX') return false
    if (filtroTipo === 'BOLETO' && t.canal !== 'BOLETO') return false
    if (filtroTipo === 'TED' && t.canal !== 'TED') return false

    // Filtro por busca (título, descrição ou documento)
    if (busca) {
      const termo = busca.toLowerCase()
      const matchTitulo = t.titulo?.toLowerCase().includes(termo)
      const matchDesc = t.descricao?.toLowerCase().includes(termo)
      const matchDoc = t.documento?.toLowerCase().includes(termo)
      return matchTitulo || matchDesc || matchDoc
    }

    return true
  })

  return {
    // Dados do Banco Inter
    saldo: saldoData || { disponivel: 0, bloqueadoCheque: 0, bloqueadoJudicialmente: 0, limite: 0 },
    transacoes: transacoesFiltradas,
    resumoFinanceiro: resumoData || { totalEntradasMes: 0, totalSaidasMes: 0, resultadoLiquido: 0, graficoFluxo: [] },
    chavesPix: chavesData?.chaves || [],

    // Estados
    isLoading: loadingSaldo || loadingExtrato || loadingResumo,
    isError: errSaldo || errExtrato || errResumo,

    // Filtros e Controle
    filtroTipo,
    setFiltroTipo,
    filtroPeriodo,
    setFiltroPeriodo,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    busca,
    setBusca,
    pagina,
    setPagina,

    // Ações
    enviarPix,
    cobrarPix,
    validarChavePix,
    emitirBoleto,
    validarCodigoBarras,
    pagarBoleto,
    transferirTED,
    exportarExtrato,
    sincronizarManual
  }
}
