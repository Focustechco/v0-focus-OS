"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Mapeamento de modulos do sidebar para IDs das configuracoes
const MODULE_MAPPING: Record<string, string[]> = {
  "command-center": ["command-center"],
  "projetos": ["projetos"],
  "tarefas": ["tarefas"],
  "agenda": ["agenda"],
  "comercial": ["comercial"],
  "equipe": ["equipe"],
  "clientes": ["clientes"],
  "intelligence": ["intelligence"],
  "relatorios": ["relatorios"],
  "sistemas": ["sistemas"],
  "configuracoes": ["configuracoes"],
  "documentos": ["documentos"],
  "financeiro": ["financeiro"],
}

// Modulos que sempre devem estar visiveis (essenciais)
const ESSENTIAL_MODULES = ["command-center", "configuracoes"]

// Estado inicial dos modulos
const DEFAULT_MODULE_STATES: Record<string, boolean> = {
  "command-center": true,
  "configuracoes": true,
  "sistemas": true,
  "projetos": true,
  "tarefas": true,
  "agenda": true,
  "comercial": true,
  "clientes": true,
  "equipe": true,
  "intelligence": true,
  "relatorios": true,
  "documentos": true,
  "financeiro": true,
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
        // Merge saved states with defaults to ensure new modules are included
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
