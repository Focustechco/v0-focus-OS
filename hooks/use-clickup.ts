"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"
import type { CRMDeal } from "@/lib/crm-field-mapper"
import type { ClickUpComment, ClickUpStatus, ClickUpMember, ClickUpCustomField } from "@/lib/clickup-api"

// =====================================================
// Hooks do ClickUp — chamam API routes server-side
// =====================================================
// O token do ClickUp é mantido no servidor (env var CLICKUP_API_TOKEN).
// Todas as requisições passam por /api/clickup/*.

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status}`)
  }
  return res.json()
}

export interface ClickUpCRMConfig {
  configured: boolean
  teamId: string | null
  spaceId: string | null
  listId: string | null
}

export function useClickUpConfig() {
  const { data, error, isLoading } = useSWR<ClickUpCRMConfig>(
    "/api/clickup/config",
    fetcher
  )

  return {
    config: data ?? {
      configured: false,
      teamId: null,
      spaceId: null,
      listId: null,
    },
    isConfigured: Boolean(data?.configured),
    isLoaded: !isLoading,
    error,
  }
}

export function useClickUpCRM() {
  const { isConfigured, isLoaded } = useClickUpConfig()
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const {
    data: dealsData,
    error: dealsError,
    isLoading: dealsLoading,
    mutate: mutateDeals,
  } = useSWR<{ deals: CRMDeal[]; updated_at: string }>(
    isConfigured ? "/api/clickup/deals" : null,
    async (url: string) => {
      const result = await fetcher(url)
      setLastSync(new Date(result.updated_at))
      // Reconstruir Dates (JSON serializa como string)
      const deals: CRMDeal[] = result.deals.map((d: CRMDeal) => ({
        ...d,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        dateCreated: new Date(d.dateCreated),
        dateUpdated: new Date(d.dateUpdated),
        dateClosed: d.dateClosed ? new Date(d.dateClosed) : null,
      }))
      return { deals, updated_at: result.updated_at }
    },
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  )

  const updateDealStatus = useCallback(
    async (dealId: string, newStatus: string) => {
      const res = await fetch(`/api/clickup/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar status")
      mutateDeals()
    },
    [mutateDeals]
  )

  const createDeal = useCallback(
    async () => {
      throw new Error(
        "createDeal ainda não implementado no backend server-side."
      )
    },
    []
  )

  const addDealComment = useCallback(async (dealId: string, text: string) => {
    const res = await fetch(`/api/clickup/deals/${dealId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error("Falha ao adicionar comentário")
    return res.json()
  }, [])

  const getDealComments = useCallback(async (dealId: string) => {
    const res = await fetch(`/api/clickup/deals/${dealId}/comments`)
    if (!res.ok) throw new Error("Falha ao buscar comentários")
    const data = await res.json()
    return data.comments as ClickUpComment[]
  }, [])

  const refresh = useCallback(() => {
    mutateDeals()
  }, [mutateDeals])

  return {
    deals: dealsData?.deals ?? [],
    statuses: [] as ClickUpStatus[],
    members: [] as ClickUpMember[],
    customFields: [] as ClickUpCustomField[],
    loading: !isLoaded || dealsLoading,
    error: dealsError,
    lastSync,
    isConfigured,
    updateDealStatus,
    createDeal,
    addDealComment,
    getDealComments,
    refresh,
  }
}

export function useDealComments(dealId: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: mutateComments,
  } = useSWR<{ comments: ClickUpComment[] }>(
    dealId ? `/api/clickup/deals/${dealId}/comments` : null,
    fetcher
  )

  const postComment = useCallback(
    async (text: string) => {
      if (!dealId) throw new Error("dealId obrigatório")
      const res = await fetch(`/api/clickup/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error("Falha ao postar comentário")
      mutateComments()
    },
    [dealId, mutateComments]
  )

  return {
    comments: data?.comments ?? [],
    loading: isLoading,
    error,
    postComment,
    refresh: mutateComments,
  }
}

// Hook de setup (teams/spaces/lists) — deprecated.
// Agora a configuração vem das env vars do servidor.
// Mantido como stub para não quebrar configurar-crm.tsx.
export function useClickUpSetup(_token: string | null) {
  return {
    teams: [],
    teamsLoading: false,
    teamsError: null as Error | null,
    testToken: async () => ({
      success: false,
      error: "Configuração agora é feita via variáveis de ambiente no servidor.",
    }),
    getSpacesForTeam: async () => [],
    getFoldersForSpace: async () => [],
    getListsForContainer: async () => [],
  }
}
