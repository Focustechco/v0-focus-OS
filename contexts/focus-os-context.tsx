"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { toast } from "sonner"

// Types
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  thumbnailLink?: string
  modifiedTime: Date
  size?: number
}

export interface Contract {
  id: string
  name: string
  driveFileId: string
  url: string
  uploadedAt: Date
  linkedTaskId?: string
  status: "active" | "expired" | "pending"
}

export interface SheetImport {
  id: string
  sheetId: string
  sheetName: string
  importedAt: Date
  rowCount: number
  lastSync?: Date
}

export interface BacklogTask {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
  assignee?: string
  dueDate?: Date
  fromDrive?: boolean
  linkedDriveFileId?: string
}

export interface IntegrationStatus {
  connected: boolean
  lastSync: Date | null
  loading: boolean
  error: string | null
}

export interface GoogleSheetsIntegration extends IntegrationStatus {
  frequency: number // minutes
  syncedSheets: number
}

export interface GoogleDriveIntegration extends IntegrationStatus {
  quota: { used: number; total: number }
  filesCount: number
}

export interface GoogleCalendarIntegration extends IntegrationStatus {
  upcomingEvents: CalendarEvent[]
  syncedCalendars: number
}

export interface GitHubIntegration extends IntegrationStatus {
  openPRs: number
  lastCommit: string
  repoName?: string
  username?: string
}

export interface FocusOSState {
  integrations: {
    googleSheets: GoogleSheetsIntegration
    googleDrive: GoogleDriveIntegration
    googleCalendar: GoogleCalendarIntegration
    github: GitHubIntegration
  }
  backlog: {
    tasks: BacklogTask[]
    driveFiles: DriveFile[]
    contracts: Contract[]
    importedSheets: SheetImport[]
  }
  lastUpdate: Date
  notificationCount: number
}

interface FocusOSContextType extends FocusOSState {
  // Integration actions
  connectIntegration: (integration: keyof FocusOSState["integrations"]) => Promise<void>
  disconnectIntegration: (integration: keyof FocusOSState["integrations"]) => void
  syncIntegration: (integration: keyof FocusOSState["integrations"]) => Promise<void>
  updateIntegrationFrequency: (integration: "googleSheets" | "googleDrive", frequency: number) => void
  
  // Backlog actions
  addContract: (contract: Omit<Contract, "id" | "uploadedAt">) => void
  removeContract: (contractId: string) => void
  linkContractToTask: (contractId: string, taskId: string) => void
  addDriveFile: (file: DriveFile) => void
  removeDriveFile: (fileId: string) => void
  importSheet: (sheet: Omit<SheetImport, "id" | "importedAt">) => void
  removeSheet: (sheetId: string) => void
  
  // General actions
  refreshAll: () => Promise<void>
  clearNotifications: () => void
  incrementNotifications: () => void
}

const defaultState: FocusOSState = {
  integrations: {
    googleSheets: {
      connected: false,
      lastSync: null,
      loading: false,
      error: null,
      frequency: 15,
      syncedSheets: 0,
    },
    googleDrive: {
      connected: false,
      lastSync: null,
      loading: false,
      error: null,
      quota: { used: 0, total: 15 * 1024 * 1024 * 1024 }, // 15GB default
      filesCount: 0,
    },
    googleCalendar: {
      connected: false,
      lastSync: null,
      loading: false,
      error: null,
      upcomingEvents: [],
      syncedCalendars: 0,
    },
    github: {
      connected: false,
      lastSync: null,
      loading: false,
      error: null,
      openPRs: 0,
      lastCommit: "",
      repoName: undefined,
      username: undefined,
    },
  },
  backlog: {
    tasks: [],
    driveFiles: [],
    contracts: [],
    importedSheets: [],
  },
  lastUpdate: new Date(),
  notificationCount: 0,
}

const FocusOSContext = createContext<FocusOSContextType | undefined>(undefined)

// Storage keys
const STORAGE_KEY = "focus-os-state"
const TOKEN_PREFIX = "focusOS_token_"

// Mock data for demo (when not connected to real APIs)
const mockCalendarEvents: CalendarEvent[] = [
  { id: "1", title: "Sprint Planning", start: new Date(), end: new Date(Date.now() + 3600000), description: "Reuniao de planejamento" },
  { id: "2", title: "Daily Standup", start: new Date(Date.now() + 86400000), end: new Date(Date.now() + 86400000 + 1800000) },
  { id: "3", title: "Review Cliente X", start: new Date(Date.now() + 172800000), end: new Date(Date.now() + 172800000 + 3600000) },
]

const mockDriveFiles: DriveFile[] = [
  { id: "d1", name: "Proposta Comercial - Cliente A.pdf", mimeType: "application/pdf", webViewLink: "#", modifiedTime: new Date(), size: 2400000 },
  { id: "d2", name: "Contrato de Servicos.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", webViewLink: "#", modifiedTime: new Date(), size: 450000 },
  { id: "d3", name: "Planilha Financeira Q1.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", webViewLink: "#", modifiedTime: new Date(), size: 890000 },
]

const mockContracts: Contract[] = [
  { id: "c1", name: "Contrato - Empresa ABC Ltda", driveFileId: "d2", url: "#", uploadedAt: new Date(Date.now() - 86400000 * 30), status: "active" },
  { id: "c2", name: "Aditivo - Projeto XYZ", driveFileId: "d2", url: "#", uploadedAt: new Date(Date.now() - 86400000 * 15), status: "pending" },
]

const mockSheets: SheetImport[] = [
  { id: "s1", sheetId: "abc123", sheetName: "Controle de Horas - Março", importedAt: new Date(Date.now() - 86400000 * 2), rowCount: 245, lastSync: new Date() },
  { id: "s2", sheetId: "def456", sheetName: "Budget 2024", importedAt: new Date(Date.now() - 86400000 * 7), rowCount: 120 },
]

export function FocusOSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FocusOSState>(defaultState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "lastSync" || key === "uploadedAt" || key === "importedAt" || key === "modifiedTime" || key === "lastUpdate" || key === "start" || key === "end" || key === "dueDate") {
            return value ? new Date(value) : null
          }
          return value
        })
        setState({ ...defaultState, ...parsed })
      } catch {
        // Keep default state if parsing fails
      }
    }
    setIsHydrated(true)
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  // Check for existing tokens and restore connections
  useEffect(() => {
    if (!isHydrated) return
    
    const checkTokens = () => {
      const sheetsToken = localStorage.getItem(`${TOKEN_PREFIX}sheets`)
      const driveToken = localStorage.getItem(`${TOKEN_PREFIX}drive`)
      const calendarToken = localStorage.getItem(`${TOKEN_PREFIX}calendar`)
      const githubToken = localStorage.getItem(`${TOKEN_PREFIX}github`)

      setState(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          googleSheets: { ...prev.integrations.googleSheets, connected: !!sheetsToken },
          googleDrive: { ...prev.integrations.googleDrive, connected: !!driveToken },
          googleCalendar: { ...prev.integrations.googleCalendar, connected: !!calendarToken },
          github: { ...prev.integrations.github, connected: !!githubToken },
        }
      }))
    }
    
    checkTokens()
  }, [isHydrated])

  const connectIntegration = useCallback(async (integration: keyof FocusOSState["integrations"]) => {
    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: { ...prev.integrations[integration], loading: true, error: null }
      }
    }))

    try {
      // Simulate OAuth flow - in production, this would redirect to Google/GitHub OAuth
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock token storage
      const tokenKey = integration === "github" ? "github" : integration.replace("google", "").toLowerCase()
      localStorage.setItem(`${TOKEN_PREFIX}${tokenKey}`, `mock_token_${Date.now()}`)
      
      // Update state with mock data
      const now = new Date()
      
      setState(prev => {
        const updated = { ...prev }
        updated.integrations[integration] = {
          ...prev.integrations[integration],
          connected: true,
          loading: false,
          lastSync: now,
          error: null,
        }
        
        // Add mock data based on integration type
        if (integration === "googleCalendar") {
          (updated.integrations.googleCalendar as GoogleCalendarIntegration).upcomingEvents = mockCalendarEvents
          updated.integrations.googleCalendar.syncedCalendars = 2
        } else if (integration === "googleDrive") {
          updated.integrations.googleDrive.filesCount = mockDriveFiles.length
          updated.integrations.googleDrive.quota = { used: 5.2 * 1024 * 1024 * 1024, total: 15 * 1024 * 1024 * 1024 }
          updated.backlog.driveFiles = mockDriveFiles
          updated.backlog.contracts = mockContracts
        } else if (integration === "googleSheets") {
          updated.integrations.googleSheets.syncedSheets = mockSheets.length
          updated.backlog.importedSheets = mockSheets
        } else if (integration === "github") {
          updated.integrations.github.openPRs = 5
          updated.integrations.github.lastCommit = "feat: adicionar novas funcionalidades"
          updated.integrations.github.repoName = "focus-project-os"
          updated.integrations.github.username = "focus-dev"
        }
        
        updated.lastUpdate = now
        updated.notificationCount = prev.notificationCount + 1
        
        return updated
      })
      
      toast.success(`${getIntegrationName(integration)} conectado com sucesso!`)
    } catch (error) {
      setState(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          [integration]: { 
            ...prev.integrations[integration], 
            loading: false, 
            error: "Falha ao conectar. Tente novamente." 
          }
        }
      }))
      toast.error(`Erro ao conectar ${getIntegrationName(integration)}`)
    }
  }, [])

  const disconnectIntegration = useCallback((integration: keyof FocusOSState["integrations"]) => {
    const tokenKey = integration === "github" ? "github" : integration.replace("google", "").toLowerCase()
    localStorage.removeItem(`${TOKEN_PREFIX}${tokenKey}`)
    
    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: {
          ...defaultState.integrations[integration],
          connected: false,
        }
      },
      lastUpdate: new Date(),
    }))
    
    toast.success(`${getIntegrationName(integration)} desconectado`)
  }, [])

  const syncIntegration = useCallback(async (integration: keyof FocusOSState["integrations"]) => {
    if (!state.integrations[integration].connected) {
      toast.error(`${getIntegrationName(integration)} nao esta conectado`)
      return
    }

    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: { ...prev.integrations[integration], loading: true }
      }
    }))

    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setState(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          [integration]: { 
            ...prev.integrations[integration], 
            loading: false, 
            lastSync: new Date() 
          }
        },
        lastUpdate: new Date(),
      }))
      
      toast.success(`${getIntegrationName(integration)} sincronizado!`)
    } catch {
      setState(prev => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          [integration]: { ...prev.integrations[integration], loading: false }
        }
      }))
      toast.error(`Erro ao sincronizar ${getIntegrationName(integration)}`)
    }
  }, [state.integrations])

  const updateIntegrationFrequency = useCallback((integration: "googleSheets" | "googleDrive", frequency: number) => {
    setState(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integration]: { ...prev.integrations[integration], frequency }
      }
    }))
  }, [])

  const addContract = useCallback((contract: Omit<Contract, "id" | "uploadedAt">) => {
    const newContract: Contract = {
      ...contract,
      id: `c_${Date.now()}`,
      uploadedAt: new Date(),
    }
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        contracts: [...prev.backlog.contracts, newContract],
      },
      lastUpdate: new Date(),
      notificationCount: prev.notificationCount + 1,
    }))
    toast.success("Contrato adicionado")
  }, [])

  const removeContract = useCallback((contractId: string) => {
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        contracts: prev.backlog.contracts.filter(c => c.id !== contractId),
      },
    }))
    toast.success("Contrato removido")
  }, [])

  const linkContractToTask = useCallback((contractId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        contracts: prev.backlog.contracts.map(c => 
          c.id === contractId ? { ...c, linkedTaskId: taskId } : c
        ),
      },
    }))
    toast.success("Contrato vinculado a tarefa")
  }, [])

  const addDriveFile = useCallback((file: DriveFile) => {
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        driveFiles: [...prev.backlog.driveFiles, file],
      },
      integrations: {
        ...prev.integrations,
        googleDrive: {
          ...prev.integrations.googleDrive,
          filesCount: prev.integrations.googleDrive.filesCount + 1,
        }
      },
      lastUpdate: new Date(),
    }))
  }, [])

  const removeDriveFile = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        driveFiles: prev.backlog.driveFiles.filter(f => f.id !== fileId),
      },
      integrations: {
        ...prev.integrations,
        googleDrive: {
          ...prev.integrations.googleDrive,
          filesCount: Math.max(0, prev.integrations.googleDrive.filesCount - 1),
        }
      },
    }))
  }, [])

  const importSheet = useCallback((sheet: Omit<SheetImport, "id" | "importedAt">) => {
    const newSheet: SheetImport = {
      ...sheet,
      id: `s_${Date.now()}`,
      importedAt: new Date(),
    }
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        importedSheets: [...prev.backlog.importedSheets, newSheet],
      },
      integrations: {
        ...prev.integrations,
        googleSheets: {
          ...prev.integrations.googleSheets,
          syncedSheets: prev.integrations.googleSheets.syncedSheets + 1,
        }
      },
      lastUpdate: new Date(),
      notificationCount: prev.notificationCount + 1,
    }))
    toast.success("Planilha importada")
  }, [])

  const removeSheet = useCallback((sheetId: string) => {
    setState(prev => ({
      ...prev,
      backlog: {
        ...prev.backlog,
        importedSheets: prev.backlog.importedSheets.filter(s => s.id !== sheetId),
      },
      integrations: {
        ...prev.integrations,
        googleSheets: {
          ...prev.integrations.googleSheets,
          syncedSheets: Math.max(0, prev.integrations.googleSheets.syncedSheets - 1),
        }
      },
    }))
    toast.success("Planilha removida")
  }, [])

  const refreshAll = useCallback(async () => {
    const connectedIntegrations = Object.entries(state.integrations)
      .filter(([, value]) => value.connected)
      .map(([key]) => key as keyof FocusOSState["integrations"])

    for (const integration of connectedIntegrations) {
      await syncIntegration(integration)
    }
  }, [state.integrations, syncIntegration])

  const clearNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notificationCount: 0 }))
  }, [])

  const incrementNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notificationCount: prev.notificationCount + 1 }))
  }, [])

  return (
    <FocusOSContext.Provider
      value={{
        ...state,
        connectIntegration,
        disconnectIntegration,
        syncIntegration,
        updateIntegrationFrequency,
        addContract,
        removeContract,
        linkContractToTask,
        addDriveFile,
        removeDriveFile,
        importSheet,
        removeSheet,
        refreshAll,
        clearNotifications,
        incrementNotifications,
      }}
    >
      {children}
    </FocusOSContext.Provider>
  )
}

export function useFocusOS() {
  const context = useContext(FocusOSContext)
  if (context === undefined) {
    throw new Error("useFocusOS must be used within a FocusOSProvider")
  }
  return context
}

// Helper function
function getIntegrationName(integration: keyof FocusOSState["integrations"]): string {
  const names: Record<keyof FocusOSState["integrations"], string> = {
    googleSheets: "Google Sheets",
    googleDrive: "Google Drive",
    googleCalendar: "Google Calendar",
    github: "GitHub",
  }
  return names[integration]
}
