"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  LayoutGrid,
  Building2,
  Users,
  Palette,
  Bell,
  Shield,
  Plug,
  Code,
  Database,
  Monitor,
  Save,
  X,
  ChevronLeft,
} from "lucide-react"

import { PerfilIdentidadeSection } from "./sections/perfil-identidade-section"
import { ModulosSection } from "./sections/modulos-section"
import { UsuariosSection } from "./sections/usuarios-section"
import { AparenciaSection } from "./sections/aparencia-section"
import { NotificacoesSection } from "./sections/notificacoes-section"
import { SegurancaSection } from "./sections/seguranca-section"
import { IntegracoesSection } from "./sections/integracoes-section"
import { ApiSection } from "./sections/api-section"
import { BackupSection } from "./sections/backup-section"
import { SistemaSection } from "./sections/sistema-section"

const sections = [
  { id: "perfil-identidade", label: "Meu Perfil", icon: User, group: "SISTEMA" },
  { id: "modulos", label: "Modulos do Sistema", icon: LayoutGrid, group: "SISTEMA" },
  { id: "usuarios", label: "Usuarios & Permissoes", icon: Users, group: "EQUIPE" },
  { id: "aparencia", label: "Personalização", icon: Palette, group: "EQUIPE" },
  { id: "notificacoes", label: "Notificacoes", icon: Bell, group: "EQUIPE" },
  { id: "seguranca", label: "Seguranca", icon: Shield, group: "SEGURANCA" },
  { id: "integracoes", label: "Integracoes", icon: Plug, group: "INTEGRACOES" },
  { id: "api", label: "API & Desenvolvedores", icon: Code, group: "INTEGRACOES" },
  { id: "backup", label: "Backup & Dados", icon: Database, group: "DADOS" },
  { id: "sistema", label: "Sistema & Logs", icon: Monitor, group: "DADOS" },
]

const groupedSections = sections.reduce((acc, section) => {
  if (!acc[section.group]) acc[section.group] = []
  acc[section.group].push(section)
  return acc
}, {} as Record<string, typeof sections>)

export function ConfiguracoesModule() {
  const [activeSection, setActiveSection] = useState("modulos")
  const [hasChanges, setHasChanges] = useState(false)
  const [mobileView, setMobileView] = useState<"menu" | "content">("menu")

  const renderSection = () => {
    switch (activeSection) {
      case "perfil-identidade":
        return <PerfilIdentidadeSection />
      case "modulos":
        return <ModulosSection onChange={() => setHasChanges(true)} />
      case "usuarios":
        return <UsuariosSection onChange={() => setHasChanges(true)} />
      case "aparencia":
        return <AparenciaSection onChange={() => setHasChanges(true)} />
      case "notificacoes":
        return <NotificacoesSection onChange={() => setHasChanges(true)} />
      case "seguranca":
        return <SegurancaSection onChange={() => setHasChanges(true)} />
      case "integracoes":
        return <IntegracoesSection onChange={() => setHasChanges(true)} />
      case "api":
        return <ApiSection onChange={() => setHasChanges(true)} />
      case "backup":
        return <BackupSection onChange={() => setHasChanges(true)} />
      case "sistema":
        return <SistemaSection />
      default:
        return <ModulosSection onChange={() => setHasChanges(true)} />
    }
  }

  const currentSection = sections.find((s) => s.id === activeSection)

  return (
    <div className="flex h-full bg-secondary">
      {/* Sidebar */}
      <div className={`w-full md:w-60 bg-secondary border-r border-[#2a2a2a] flex-col ${mobileView === 'content' ? 'hidden md:flex' : 'flex'}`}>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-6">
            {Object.entries(groupedSections).map(([group, items]) => (
              <div key={group}>
                <p className="text-neutral-600 text-[10px] font-mono tracking-widest uppercase mb-2 px-2">
                  {group}
                </p>
                <div className="space-y-1">
                  {items.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id)
                        setMobileView("content")
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${
                        activeSection === section.id
                          ? "bg-[#1a1a1a] text-orange-500 border-l-[3px] border-l-orange-500"
                          : "text-neutral-400 hover:bg-[#1f1f1f] hover:text-foreground"
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                      {hasChanges && activeSection === section.id && (
                        <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Version Info */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <p className="text-neutral-600 text-[10px] font-mono">FOCUS OS v2.4.1</p>
          <p className="text-neutral-700 text-[10px] font-mono">BUILD 2026.03</p>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 flex-col ${mobileView === 'menu' ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 text-neutral-400 hover:text-foreground"
              onClick={() => setMobileView("menu")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <p className="text-neutral-500 text-xs font-mono tracking-widest hidden sm:block">
              CONFIGURACOES / <span className="text-orange-500">{activeSection === "perfil-identidade" ? "PERFIL" : currentSection?.label.toUpperCase()}</span>
            </p>
            <p className="text-neutral-500 text-xs font-mono tracking-widest sm:hidden">
              <span className="text-orange-500">{currentSection?.label.toUpperCase()}</span>
            </p>
          </div>
          {hasChanges && (
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs tracking-widest uppercase"
              onClick={() => setHasChanges(false)}
              title="CMD+S para salvar"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alteracoes
            </Button>
          )}
        </div>

        {/* Section Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">{renderSection()}</div>
        </ScrollArea>

        {/* Unsaved Changes Bar */}
        {hasChanges && (
          <div className="px-4 md:px-6 py-3 bg-card border-t border-[#2a2a2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <p className="text-neutral-400 text-xs md:text-sm font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
              Voce tem alteracoes nao salvas
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => setHasChanges(false)}
                className="text-neutral-400 hover:text-foreground font-mono text-xs"
              >
                <X className="w-4 h-4 mr-2" />
                Descartar
              </Button>
              <Button
                onClick={() => setHasChanges(false)}
                className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alteracoes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
