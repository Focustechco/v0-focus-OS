"use client"

import { useState, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import {
  getTeams,
  getSpaces,
  getFolders,
  getLists,
  getFolderlessLists,
  getList,
  getTasks,
  getTask,
  updateTask,
  createTask,
  getComments,
  addComment,
  getMembers,
  getCustomFields,
  testConnection,
  type ClickUpTeam,
  type ClickUpSpace,
  type ClickUpFolder,
  type ClickUpList,
  type ClickUpStatus,
  type ClickUpTask,
  type ClickUpComment,
  type ClickUpMember,
  type ClickUpCustomField,
} from '@/lib/clickup-api'
import { mapTaskToDeal, type CRMDeal } from '@/lib/crm-field-mapper'

// Storage keys
const STORAGE_KEYS = {
  token: 'focus_clickup_token',
  teamId: 'focus_clickup_team_id',
  spaceId: 'focus_clickup_space_id',
  listId: 'focus_clickup_list_id',
  fieldMapping: 'focus_clickup_field_mapping',
  syncInterval: 'focus_clickup_sync_interval',
}

// Get/Set localStorage values
function getStoredValue(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

function setStoredValue(key: string, value: string | null) {
  if (typeof window === 'undefined') return
  if (value === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, value)
  }
}

// Config interface
export interface ClickUpCRMConfig {
  token: string | null
  teamId: string | null
  spaceId: string | null
  listId: string | null
  syncInterval: number // em minutos
}

// Hook para gerenciar configuração
export function useClickUpConfig() {
  const [config, setConfigState] = useState<ClickUpCRMConfig>({
    token: null,
    teamId: null,
    spaceId: null,
    listId: null,
    syncInterval: 5,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar config do localStorage
  useEffect(() => {
    setConfigState({
      token: getStoredValue(STORAGE_KEYS.token),
      teamId: getStoredValue(STORAGE_KEYS.teamId),
      spaceId: getStoredValue(STORAGE_KEYS.spaceId),
      listId: getStoredValue(STORAGE_KEYS.listId),
      syncInterval: parseInt(getStoredValue(STORAGE_KEYS.syncInterval) || '5'),
    })
    setIsLoaded(true)
  }, [])

  const setConfig = useCallback((updates: Partial<ClickUpCRMConfig>) => {
    setConfigState(prev => {
      const newConfig = { ...prev, ...updates }
      
      if (updates.token !== undefined) setStoredValue(STORAGE_KEYS.token, updates.token)
      if (updates.teamId !== undefined) setStoredValue(STORAGE_KEYS.teamId, updates.teamId)
      if (updates.spaceId !== undefined) setStoredValue(STORAGE_KEYS.spaceId, updates.spaceId)
      if (updates.listId !== undefined) setStoredValue(STORAGE_KEYS.listId, updates.listId)
      if (updates.syncInterval !== undefined) setStoredValue(STORAGE_KEYS.syncInterval, String(updates.syncInterval))
      
      return newConfig
    })
  }, [])

  const clearConfig = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => setStoredValue(key, null))
    setConfigState({
      token: null,
      teamId: null,
      spaceId: null,
      listId: null,
      syncInterval: 5,
    })
  }, [])

  const isConfigured = Boolean(config.token && config.teamId && config.listId)

  return { config, setConfig, clearConfig, isConfigured, isLoaded }
}

// Hook principal para dados do CRM
export function useClickUpCRM() {
  const { config, isConfigured, isLoaded } = useClickUpConfig()
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Fetch deals
  const { data: dealsData, error: dealsError, isLoading: dealsLoading, mutate: mutateDeals } = useSWR(
    isConfigured && config.token && config.listId ? ['deals', config.listId] : null,
    async () => {
      const { tasks } = await getTasks(config.token!, config.listId!, { includeClosed: true })
      setLastSync(new Date())
      return tasks.map(mapTaskToDeal)
    },
    {
      refreshInterval: config.syncInterval * 60 * 1000,
      revalidateOnFocus: false,
    }
  )

  // Fetch statuses
  const { data: statusesData } = useSWR(
    isConfigured && config.token && config.listId ? ['statuses', config.listId] : null,
    async () => {
      const list = await getList(config.token!, config.listId!)
      return list.statuses || []
    }
  )

  // Fetch members
  const { data: membersData } = useSWR(
    isConfigured && config.token && config.teamId ? ['members', config.teamId] : null,
    async () => {
      const { members } = await getMembers(config.token!, config.teamId!)
      return members
    }
  )

  // Fetch custom fields
  const { data: fieldsData } = useSWR(
    isConfigured && config.token && config.listId ? ['fields', config.listId] : null,
    async () => {
      const { fields } = await getCustomFields(config.token!, config.listId!)
      return fields
    }
  )

  // Update deal status
  const updateDealStatus = useCallback(async (dealId: string, newStatus: string) => {
    if (!config.token) throw new Error('Token não configurado')
    
    await updateTask(config.token, dealId, { status: newStatus })
    mutateDeals()
  }, [config.token, mutateDeals])

  // Create new deal
  const createDeal = useCallback(async (data: {
    name: string
    description?: string
    status?: string
    priority?: number
    dueDate?: Date
    assignees?: number[]
  }) => {
    if (!config.token || !config.listId) throw new Error('Configuração incompleta')
    
    const task = await createTask(config.token, config.listId, {
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.dueDate ? data.dueDate.getTime() : undefined,
      assignees: data.assignees,
    })
    
    mutateDeals()
    return mapTaskToDeal(task)
  }, [config.token, config.listId, mutateDeals])

  // Add comment to deal
  const addDealComment = useCallback(async (dealId: string, text: string) => {
    if (!config.token) throw new Error('Token não configurado')
    
    return addComment(config.token, dealId, text)
  }, [config.token])

  // Get deal comments
  const getDealComments = useCallback(async (dealId: string) => {
    if (!config.token) throw new Error('Token não configurado')
    
    const { comments } = await getComments(config.token, dealId)
    return comments
  }, [config.token])

  // Refresh data
  const refresh = useCallback(() => {
    mutateDeals()
  }, [mutateDeals])

  return {
    deals: dealsData || [],
    statuses: statusesData || [],
    members: membersData || [],
    customFields: fieldsData || [],
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

// Hook para setup inicial (buscar teams, spaces, lists)
export function useClickUpSetup(token: string | null) {
  // Teams
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useSWR(
    token ? ['teams', token] : null,
    async () => {
      const { teams } = await getTeams(token!)
      return teams
    }
  )

  // Test connection
  const testToken = useCallback(async (tokenToTest: string) => {
    try {
      const result = await testConnection(tokenToTest)
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [])

  // Get spaces for team
  const getSpacesForTeam = useCallback(async (teamId: string) => {
    if (!token) return []
    const { spaces } = await getSpaces(token, teamId)
    return spaces
  }, [token])

  // Get folders for space
  const getFoldersForSpace = useCallback(async (spaceId: string) => {
    if (!token) return []
    const { folders } = await getFolders(token, spaceId)
    return folders
  }, [token])

  // Get lists for folder or space
  const getListsForContainer = useCallback(async (containerId: string, isFolder: boolean) => {
    if (!token) return []
    if (isFolder) {
      const { lists } = await getLists(token, containerId)
      return lists
    } else {
      const { lists } = await getFolderlessLists(token, containerId)
      return lists
    }
  }, [token])

  return {
    teams: teams || [],
    teamsLoading,
    teamsError,
    testToken,
    getSpacesForTeam,
    getFoldersForSpace,
    getListsForContainer,
  }
}

// Hook para comentários de um deal específico
export function useDealComments(dealId: string | null) {
  const { config } = useClickUpConfig()
  
  const { data, error, isLoading, mutate: mutateComments } = useSWR(
    dealId && config.token ? ['comments', dealId] : null,
    async () => {
      const { comments } = await getComments(config.token!, dealId!)
      return comments
    }
  )

  const postComment = useCallback(async (text: string) => {
    if (!config.token || !dealId) throw new Error('Configuração incompleta')
    
    await addComment(config.token, dealId, text)
    mutateComments()
  }, [config.token, dealId, mutateComments])

  return {
    comments: data || [],
    loading: isLoading,
    error,
    postComment,
    refresh: mutateComments,
  }
}
