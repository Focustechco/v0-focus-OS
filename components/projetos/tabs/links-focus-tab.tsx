"use client"

import { useState, useEffect } from "react"
import {
  ExternalLink,
  Lock,
  Plus,
  Eye,
  EyeOff,
  X,
  Upload,
  Check,
  Link,
  Briefcase,
  Settings,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

// Types
interface Project {
  id: string
  type: "client" | "internal"
  name: string
  client: string
  url: string
  logo?: string
  logoInitials: string
  logoBg: string
  status: "em_andamento" | "em_risco" | "parado" | "concluido" | "proposta"
  progress: number
  stage: string
  responsible: string[]
  lastAccess?: string
  credentials?: {
    username: string
    password: string
  }
}

interface AccessCard {
  id: string
  projectName: string
  client: string
  url: string
  status: "online" | "offline" | "degraded"
  logoInitials: string
  logoBg: string
}

// Sample data
const initialClientProjects: Project[] = [
  {
    id: "1",
    type: "client",
    name: "Sistema de Gestão Empresarial",
    client: "Empresa XYZ",
    url: "https://gestao.empresaxyz.com.br",
    logoInitials: "EX",
    logoBg: "bg-purple-600",
    status: "em_andamento",
    progress: 36,
    stage: "DIAGNÓSTICO",
    responsible: ["Gabriel"],
    lastAccess: "há 2h",
  },
  {
    id: "2",
    type: "client",
    name: "App Mobile E-commerce",
    client: "Loja ABC",
    url: "https://app.lojaabc.com.br",
    logoInitials: "LA",
    logoBg: "bg-blue-600",
    status: "em_andamento",
    progress: 68,
    stage: "SPRINT #4",
    responsible: ["Dev_02"],
    lastAccess: "há 5h",
  },
  {
    id: "3",
    type: "client",
    name: "Portal Interno B2B",
    client: "TechKorp",
    url: "https://portal.techkorp.com",
    logoInitials: "TK",
    logoBg: "bg-green-600",
    status: "em_risco",
    progress: 22,
    stage: "MVP",
    responsible: ["DevSecOps"],
    lastAccess: "há 1d",
  },
  {
    id: "4",
    type: "client",
    name: "Dashboard Financeiro",
    client: "MaxFinance",
    url: "https://dash.maxfinance.com.br",
    logoInitials: "MF",
    logoBg: "bg-orange-600",
    status: "concluido",
    progress: 100,
    stage: "SUPORTE",
    responsible: ["Gabriel"],
    lastAccess: "há 3d",
  },
  {
    id: "5",
    type: "client",
    name: "Landing Page + CRM",
    client: "StartupNova",
    url: "https://startupnova.com.br",
    logoInitials: "SN",
    logoBg: "bg-yellow-600",
    status: "proposta",
    progress: 5,
    stage: "PROPOSTA",
    responsible: ["Consultor Técnico"],
    lastAccess: "há 1h",
  },
  {
    id: "6",
    type: "client",
    name: "Sistema de Estoque",
    client: "RetailVix",
    url: "https://estoque.retailvix.com",
    logoInitials: "RV",
    logoBg: "bg-red-600",
    status: "parado",
    progress: 15,
    stage: "ESCOPO",
    responsible: ["Estagiario_01"],
    lastAccess: "há 2d",
  },
]

const initialInternalProjects: Project[] = [
  {
    id: "i1",
    type: "internal",
    name: "Plataforma Operacional Principal",
    client: "Focus OS",
    url: "https://app.focusos.com.br",
    logoInitials: "F",
    logoBg: "bg-orange-500",
    status: "em_andamento",
    progress: 72,
    stage: "SPRINT #7",
    responsible: ["Gabriel", "Dev_02"],
    lastAccess: "há 30min",
  },
  {
    id: "i2",
    type: "internal",
    name: "CRM + Pipeline Interno",
    client: "Focus HUB",
    url: "https://hub.focusos.com.br",
    logoInitials: "F",
    logoBg: "bg-orange-500",
    status: "em_andamento",
    progress: 45,
    stage: "SPRINT #3",
    responsible: ["Gabriel"],
    lastAccess: "há 1h",
  },
  {
    id: "i3",
    type: "internal",
    name: "Base de Conhecimento Interna",
    client: "Focus DOCS",
    url: "https://docs.focusos.com.br",
    logoInitials: "F",
    logoBg: "bg-orange-500",
    status: "em_risco",
    progress: 30,
    stage: "MVP",
    responsible: ["Estagiario_01"],
    lastAccess: "há 2d",
  },
  {
    id: "i4",
    type: "internal",
    name: "Monitoramento & DevOps",
    client: "Focus INFRA",
    url: "https://infra.focusos.com.br",
    logoInitials: "F",
    logoBg: "bg-orange-500",
    status: "em_andamento",
    progress: 88,
    stage: "DEPLOY",
    responsible: ["DevSecOps"],
    lastAccess: "há 15min",
  },
]

const initialAccessCards: AccessCard[] = [
  {
    id: "a1",
    projectName: "Sistema de Gestão",
    client: "Empresa XYZ",
    url: "https://gestao.empresaxyz.com.br",
    status: "online",
    logoInitials: "EX",
    logoBg: "bg-purple-600",
  },
  {
    id: "a2",
    projectName: "App Mobile",
    client: "Loja ABC",
    url: "https://app.lojaabc.com.br",
    status: "online",
    logoInitials: "LA",
    logoBg: "bg-blue-600",
  },
  {
    id: "a3",
    projectName: "Portal B2B",
    client: "TechKorp",
    url: "https://portal.techkorp.com",
    status: "degraded",
    logoInitials: "TK",
    logoBg: "bg-green-600",
  },
  {
    id: "a4",
    projectName: "Focus OS",
    client: "Interno",
    url: "https://app.focusos.com.br",
    status: "online",
    logoInitials: "F",
    logoBg: "bg-orange-500",
  },
]

const teamMembers = ["Gabriel", "Dev_02", "DevSecOps", "Estagiario_01", "Consultor Técnico"]

const statusConfig = {
  em_andamento: { label: "EM ANDAMENTO", color: "bg-green-500", textColor: "text-green-500" },
  em_risco: { label: "EM RISCO", color: "bg-yellow-500", textColor: "text-yellow-500" },
  parado: { label: "PARADO", color: "bg-red-500", textColor: "text-red-500" },
  concluido: { label: "CONCLUÍDO", color: "bg-green-700", textColor: "text-green-700" },
  proposta: { label: "PROPOSTA", color: "bg-blue-500", textColor: "text-blue-500" },
}

const colorPalette = [
  "bg-purple-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-orange-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-cyan-600",
]

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colorPalette[Math.abs(hash) % colorPalette.length]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Project Card Component
function ProjectCard({ project, isInternal = false }: { project: Project; isInternal?: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const status = statusConfig[project.status]
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(project.progress), 100)
    return () => clearTimeout(timer)
  }, [project.progress])

  return (
    <div
      className={`relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 transition-all duration-200 ${
        isHovered ? "border-orange-500/50 -translate-y-0.5 shadow-lg shadow-orange-500/10" : ""
      } ${isInternal ? "border-l-2 border-l-orange-500" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Internal badge */}
      {isInternal && (
        <Badge className="absolute top-2 right-2 bg-transparent border border-orange-500 text-orange-500 text-[9px] font-mono">
          INTERNO
        </Badge>
      )}

      {/* Top bar */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full ${project.logoBg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {project.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-white text-sm truncate ${project.status === "concluido" ? "line-through opacity-60" : ""}`}
          >
            {project.name}
          </h3>
          <p className="text-neutral-500 text-xs">{project.client}</p>
        </div>
        {!isInternal && (
          <Badge className={`${status.color} text-white text-[9px] font-mono px-2 py-0.5 flex-shrink-0`}>
            {status.label}
          </Badge>
        )}
      </div>

      {/* URL */}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-orange-500 text-xs font-mono mb-3 hover:underline truncate"
      >
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{project.url}</span>
      </a>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-neutral-500 text-[10px]">Progresso geral</span>
          <span className="text-white text-xs font-mono">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full ${status.color} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#2a2a2a] text-neutral-300 text-[9px] font-mono px-2 py-0.5">{project.stage}</Badge>
          <div className="flex -space-x-1">
            {project.responsible.slice(0, 2).map((person, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full bg-neutral-700 border border-[#1a1a1a] flex items-center justify-center text-[8px] text-white"
                title={person}
              >
                {person[0]}
              </div>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-500 text-[10px] font-mono hover:bg-orange-500/10 px-2 h-7"
          onClick={() => window.open(project.url, "_blank")}
        >
          Abrir Projeto <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Hover tooltip */}
      {isHovered && project.lastAccess && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#2a2a2a] text-neutral-400 text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
          Último acesso: {project.lastAccess}
        </div>
      )}
    </div>
  )
}

// Access Card Component
function AccessCardComponent({ card }: { card: AccessCard }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saveCredentials, setSaveCredentials] = useState(false)

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-red-500",
    degraded: "bg-yellow-500",
  }

  const statusLabels = {
    online: "online",
    offline: "offline",
    degraded: "degradado",
  }

  const handleAccess = () => {
    if (saveCredentials) {
      localStorage.setItem(`creds_${card.id}`, JSON.stringify({ username, password }))
    }
    window.open(card.url, "_blank")
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-8 h-8 rounded-full ${card.logoBg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
        >
          {card.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">{card.projectName}</h4>
          <p className="text-neutral-500 text-xs font-mono truncate">{card.url}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${statusColors[card.status]}`} />
          <span className="text-neutral-500 text-[10px]">{statusLabels[card.status]}</span>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-2 mb-3">
        <Input
          type="text"
          placeholder="usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-[#0d0d0d] border-[#2a2a2a] text-white font-mono text-sm h-9 focus:border-orange-500"
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0d0d0d] border-[#2a2a2a] text-white font-mono text-sm h-9 pr-10 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Access button */}
      <Button
        onClick={handleAccess}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono text-sm h-9"
      >
        ACESSAR <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {/* Save credentials */}
      <div className="flex items-center gap-2 mt-3">
        <Checkbox
          id={`save-${card.id}`}
          checked={saveCredentials}
          onCheckedChange={(checked) => setSaveCredentials(checked as boolean)}
          className="border-neutral-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
        />
        <label htmlFor={`save-${card.id}`} className="text-neutral-500 text-[10px] cursor-pointer">
          Salvar credenciais
        </label>
      </div>
    </div>
  )
}

// New Project Modal
function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (project: Project) => void
}) {
  const [type, setType] = useState<"client" | "internal">("client")
  const [name, setName] = useState("")
  const [client, setClient] = useState("")
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<Project["status"]>("em_andamento")
  const [stage, setStage] = useState("DIAGNÓSTICO")
  const [responsible, setResponsible] = useState<string[]>([])
  const [progress, setProgress] = useState([0])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    const clientName = type === "internal" ? "Focus OS" : client
    const newProject: Project = {
      id: Date.now().toString(),
      type,
      name,
      client: clientName,
      url,
      logo: logoPreview || undefined,
      logoInitials: type === "internal" ? "F" : getInitials(clientName),
      logoBg: type === "internal" ? "bg-orange-500" : getColorFromString(clientName),
      status,
      progress: progress[0],
      stage,
      responsible,
      lastAccess: "agora",
      credentials: username || password ? { username, password } : undefined,
    }
    onSubmit(newProject)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setType("client")
    setName("")
    setClient("")
    setUrl("")
    setStatus("em_andamento")
    setStage("DIAGNÓSTICO")
    setResponsible([])
    setProgress([0])
    setUsername("")
    setPassword("")
    setLogoPreview(null)
  }

  const toggleResponsible = (member: string) => {
    setResponsible((prev) => (prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-mono">Novo Projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType("client")}
              className={`flex-1 py-2 px-4 rounded text-sm font-mono transition-colors ${
                type === "client" ? "bg-orange-500 text-white" : "bg-[#2a2a2a] text-neutral-400"
              }`}
            >
              CLIENTE
            </button>
            <button
              onClick={() => setType("internal")}
              className={`flex-1 py-2 px-4 rounded text-sm font-mono transition-colors ${
                type === "internal" ? "bg-orange-500 text-white" : "bg-[#2a2a2a] text-neutral-400"
              }`}
            >
              INTERNO
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Nome do projeto *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0d0d0d] border-[#2a2a2a] text-white focus:border-orange-500"
            />
          </div>

          {/* Client (only for client type) */}
          {type === "client" && (
            <div>
              <label className="text-neutral-400 text-xs font-mono block mb-1">Cliente / Empresa *</label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white focus:border-orange-500"
              />
            </div>
          )}

          {/* URL */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">URL do projeto *</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="bg-[#0d0d0d] border-[#2a2a2a] text-white focus:border-orange-500"
            />
          </div>

          {/* Logo upload */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Logo do cliente</label>
            <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-4 text-center">
              {logoPreview ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-full object-cover" />
                  <button onClick={() => setLogoPreview(null)} className="text-red-500 text-xs">
                    Remover
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto text-neutral-500 mb-2" />
                  <span className="text-neutral-500 text-xs">Arraste a logo ou clique para enviar</span>
                  <input type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Status inicial</label>
            <Select value={status} onValueChange={(v) => setStatus(v as Project["status"])}>
              <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a2a] text-white focus:border-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-[#2a2a2a]">
                    {val.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Etapa atual</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="bg-[#0d0d0d] border-[#2a2a2a] text-white focus:border-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {["DIAGNÓSTICO", "PROPOSTA", "MVP", "SPRINTS", "DEPLOY", "SUPORTE"].map((s) => (
                  <SelectItem key={s} value={s} className="text-white hover:bg-[#2a2a2a]">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsible */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Responsável</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <button
                  key={member}
                  onClick={() => toggleResponsible(member)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    responsible.includes(member)
                      ? "bg-orange-500 text-white"
                      : "bg-[#2a2a2a] text-neutral-400 hover:bg-[#3a3a3a]"
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="text-neutral-400 text-xs font-mono block mb-1">Progresso inicial: {progress[0]}%</label>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-orange-500"
            />
          </div>

          {/* Credentials (optional) */}
          <div className="border-t border-[#2a2a2a] pt-4">
            <label className="text-neutral-400 text-xs font-mono block mb-2">Credenciais de acesso (opcional)</label>
            <div className="space-y-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuário"
                className="bg-[#0d0d0d] border-[#2a2a2a] text-white font-mono focus:border-orange-500"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="senha"
                  className="bg-[#0d0d0d] border-[#2a2a2a] text-white font-mono pr-10 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-6 pt-4 border-t border-[#2a2a2a]">
          <Button variant="ghost" onClick={onClose} className="text-neutral-400 hover:text-white">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !url || (type === "client" && !client)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Criar Projeto <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Toast Component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-right">
      <Check className="w-4 h-4" />
      {message}
    </div>
  )
}

// Main Component
export function LinksFocusTab() {
  const [clientProjects, setClientProjects] = useState<Project[]>(initialClientProjects)
  const [internalProjects, setInternalProjects] = useState<Project[]>(initialInternalProjects)
  const [accessCards] = useState<AccessCard[]>(initialAccessCards)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"status" | "progress" | "name">("name")

  const handleAddProject = (project: Project) => {
    if (project.type === "client") {
      setClientProjects((prev) => [...prev, project])
    } else {
      setInternalProjects((prev) => [...prev, project])
    }
    setToast("Projeto criado com sucesso")
  }

  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "progress") return b.progress - a.progress
      if (sortBy === "status") return a.status.localeCompare(b.status)
      return 0
    })
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-orange-500 rounded-full" />
          <Link className="w-5 h-5 text-orange-500" />
          <h2 className="text-white font-bold text-lg tracking-wider">LINKS FOCUS</h2>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="border-orange-500 text-orange-500 hover:bg-orange-500/10 font-mono text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Sort buttons */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-500 text-xs font-mono">Ordenar por:</span>
        {(["name", "status", "progress"] as const).map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
              sortBy === sort ? "bg-orange-500/20 text-orange-500" : "bg-[#2a2a2a] text-neutral-400 hover:text-white"
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sort === "name" ? "Nome" : sort === "status" ? "Status" : "Progresso"}
          </button>
        ))}
      </div>

      {/* PROJETOS DE CLIENTES */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-neutral-400" />
          <h3 className="text-neutral-300 font-mono text-sm tracking-wider">PROJETOS DE CLIENTES</h3>
          <Badge className="bg-[#2a2a2a] text-neutral-400 text-[10px] font-mono">
            {clientProjects.length} projetos
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortProjects(clientProjects).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a]" />

      {/* PROJETOS INTERNOS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-neutral-400" />
          <h3 className="text-neutral-300 font-mono text-sm tracking-wider">PROJETOS INTERNOS</h3>
          <Badge className="bg-orange-500/20 text-orange-500 text-[10px] font-mono">Focus OS</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortProjects(internalProjects).map((project) => (
            <ProjectCard key={project.id} project={project} isInternal />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#2a2a2a]" />

      {/* ACESSO RÁPIDO */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-neutral-400" />
          <h3 className="text-neutral-300 font-mono text-sm tracking-wider">ACESSO RÁPIDO</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessCards.map((card) => (
            <AccessCardComponent key={card.id} card={card} />
          ))}
        </div>
        <p className="text-neutral-500 text-[10px] italic mt-4">
          As credenciais são salvas localmente no navegador. Nunca compartilhe o acesso.
        </p>
      </section>

      {/* Modal */}
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProject} />

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
