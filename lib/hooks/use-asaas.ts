"use client"

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

export function useAsaas() {
  const { data: cobrancasData, error: errCobrancas, mutate: mutateCobrancas, isLoading: loadingCobrancas } = 
    useSWR('/api/asaas/cobrancas', fetcher, { revalidateOnFocus: false })
  
  const { data: pagamentosData, error: errPagamentos, isLoading: loadingPagamentos } = 
    useSWR('/api/asaas/pagamentos', fetcher, { revalidateOnFocus: false })
  
  const { data: resumoData, error: errResumo, isLoading: loadingResumo } = 
    useSWR('/api/asaas/resumo', fetcher, { revalidateOnFocus: false })

  const { data: clientesData, error: errClientes, isLoading: loadingClientes } = 
    useSWR('/api/asaas/clientes', fetcher, { revalidateOnFocus: false })

  const criarCobranca = async (dados: any) => {
    const res = await fetch('/api/asaas/cobrancas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao criar cobrança')
    mutateCobrancas()
    return data
  }

  const buscarBoletoPdf = async (id: string) => {
    const res = await fetch(`/api/asaas/boleto/${id}/pdf`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar boleto')
    return data.url
  }

  const buscarLinhaDigitavel = async (id: string) => {
    const res = await fetch(`/api/asaas/boleto/${id}/linha`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar linha digitável')
    return data.identificationField
  }

  const enviarBoletoEmail = async (cobrancaId: string, email: string) => {
    const res = await fetch('/api/asaas/boleto/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cobrancaId, email })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar boleto')
    return data
  }

  const anexarNF = async (cobrancaId: string, arquivo: string, numero: string) => {
    const res = await fetch('/api/nf/anexar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cobrancaId, arquivo, numero })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao anexar NF')
    return data
  }

  const criarCliente = async (dados: any) => {
    const res = await fetch('/api/asaas/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao criar cliente')
    return data
  }

  return {
    // Dados
    cobrancas: cobrancasData?.data || [],
    pagamentos: pagamentosData?.data || [],
    resumo: resumoData || null,
    clientes: clientesData?.data || [],

    // Estados
    isLoading: loadingCobrancas || loadingResumo,
    isLoadingClientes: loadingClientes,
    isError: errCobrancas || errPagamentos || errResumo,
    hasApiKey: !errCobrancas || (errCobrancas?.message !== 'HTTP 401'),

    // Ações
    criarCobranca,
    buscarBoletoPdf,
    buscarLinhaDigitavel,
    enviarBoletoEmail,
    anexarNF,
    criarCliente,
    mutateCobrancas
  }
}
