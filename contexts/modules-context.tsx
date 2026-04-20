"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Mapeamento de modulos do sidebar para IDs das configuracoes
const MODULE_MAPPING: Record<string, string[]> = {
  "command-center": ["command-center"],
  "comercial": ["pipeline"],
  "equipe": ["usuarios"],
  "projetos": ["projetos"],
  "fluxo": ["projetos"],
  "sprints": ["sprint-board"],
  "tasks": ["projetos"],
  "tarefas": ["projetos"],
  "checklists": ["projetos"],
  "aprovacoes": ["projetos"],
  "prazos": ["projetos"],
  "backlog": ["backlog"],
  "setores": ["projetos"],
  "intelligence": ["relatorios"],
  "relatorios": ["relatorios"],
  "sistemas": ["configuracoes"],
  "configuracoes": ["configuracoes"],
  "focushub": ["focushub"],
}

// Modulos que sempre devem estar visiveis (essenciais)
const ESSENTIAL_MODULES = ["command-center", "configuracoes"]

// Estado inicial dos modulos
const DEFAULT_MODULE_STATES: Record<string, boolean> = {
  "command-center": true,
  "configuracoes": true,
  "usuarios": true,
  "projetos": true,
  "backlog": true,
  "sprint-board": true,
  "time-tracker": false,
  "relatorios": true,
  "pipeline": true,
  "focushub": true,
  "propostas": false,
  "contratos": true,
  "canal-interno": false,
  "notificacoes": true,
  "activity-log": true,
  "google": true,
  "github": true,
  "slack": false,
  "webhooks": false,
}

interface ModulesContextType {
  moduleStates: Record<string, boolean>
  setModuleState: (moduleId: string, enabled: boolean) => void
  isModuleEnabled: (moduleId: string) => boolean
  isSidebarItemVisible: (sidebarId: string) => boolean
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined)

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>(DEFAULT_MODULE_STATES)
  const [isHydrated, setIsHydrated] = useState(false)

  // Carregar estado do localStorage na inicializacao
  useEffect(() => {
    const saved = localStorage.getItem("focus-module-states")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setModuleStates({ ...DEFAULT_MODULE_STATES, ...parsed })
      } catch {
        // Manter estado padrao se houver erro
      }
    }
    setIsHydrated(true)
  }, [])

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("focus-module-states", JSON.stringify(moduleStates))
    }
  }, [moduleStates, isHydrated])

  const setModuleState = (moduleId: string, enabled: boolean) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleId]: enabled
    }))
  }

  const isModuleEnabled = (moduleId: string) => {
    return moduleStates[moduleId] ?? true
  }

  const isSidebarItemVisible = (sidebarId: string) => {
    // Modulos essenciais sempre visiveis
    if (ESSENTIAL_MODULES.includes(sidebarId)) {
      return true
    }

    // Verificar se algum modulo mapeado esta ativo
    const mappedModules = MODULE_MAPPING[sidebarId]
    if (!mappedModules) {
      return true // Se nao tem mapeamento, mostrar por padrao
    }

    return mappedModules.some(moduleId => moduleStates[moduleId] ?? true)
  }

  return (
    <ModulesContext.Provider value={{ moduleStates, setModuleState, isModuleEnabled, isSidebarItemVisible }}>
      {children}
    </ModulesContext.Provider>
  )
}

export function useModules() {
  const context = useContext(ModulesContext)
  if (context === undefined) {
    throw new Error("useModules must be used within a ModulesProvider")
  }
  return context
}
