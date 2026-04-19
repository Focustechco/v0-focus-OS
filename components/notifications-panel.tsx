"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  Bell, 
  CheckCircle2, 
  FolderKanban, 
  ListTodo, 
  Zap, 
  CheckSquare, 
  Briefcase, 
  Clock,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotificacoes, Notificacao } from "@/lib/hooks/use-notificacoes"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotificacoes()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEsc)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen])

  const formatRelativeTime = (iso: string) => {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diffMs = now - then
    const diffMin = Math.round(diffMs / 60000)
    if (diffMin < 1) return "agora"
    if (diffMin < 60) return `há ${diffMin} min`
    const diffHr = Math.round(diffMin / 60)
    if (diffHr < 24) return `há ${diffHr} h`
    const diffDay = Math.round(diffHr / 24)
    if (diffDay === 1) return "ontem"
    return `há ${diffDay} dias`
  }

  const getIcon = (tipo: Notificacao["tipo"]) => {
    switch (tipo) {
      case "projeto": return <FolderKanban className="w-4 h-4 text-orange-500" />
      case "tarefa": return <ListTodo className="w-4 h-4 text-blue-400" />
      case "sprint": return <Zap className="w-4 h-4 text-purple-400" />
      case "aprovacao": return <CheckSquare className="w-4 h-4 text-yellow-500" />
      case "comercial": return <Briefcase className="w-4 h-4 text-green-400" />
      default: return <Bell className="w-4 h-4 text-neutral-500" />
    }
  }

  const handleNotificationClick = async (notif: Notificacao) => {
    if (!notif.lida) {
      await markAsRead(notif.id)
    }
    
    // Navegação baseada no tipo
    if (notif.referencia_tipo === "projects") {
      router.push(`/projetos?id=${notif.referencia_id}`)
    } else if (notif.referencia_tipo === "tarefas") {
      router.push(`/projetos?tab=tasks&id=${notif.referencia_id}`)
    } else if (notif.referencia_tipo === "sprints") {
      router.push(`/projetos?tab=sprints&id=${notif.referencia_id}`)
    } else if (notif.referencia_tipo === "aprovacoes") {
      router.push(`/projetos?tab=aprovacoes&id=${notif.referencia_id}`)
    } else if (notif.referencia_tipo === "leads") {
      router.push(`/comercial?id=${notif.referencia_id}`)
    }
    
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A] relative transition-colors",
          isOpen && "text-orange-500 bg-[#1A1A1A]"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-orange-500 text-white border-0 animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-300">NOTIFICAÇÕES</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-[10px] text-orange-500 hover:text-orange-400 font-mono h-6 px-2"
            >
              MARCAR TODAS COMO LIDAS
            </Button>
          </div>

          <div className="max-h-[500px] overflow-y-auto overscroll-contain custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-[10px] text-neutral-600 font-mono uppercase">Sincronizando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-8 h-8 text-neutral-800 mx-auto mb-3" />
                <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest">Nada por aqui no momento</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1A1A1A]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-4 flex gap-3 cursor-pointer transition-all hover:bg-[#1A1A1A] active:bg-[#202020] group",
                      !notif.lida && "bg-orange-500/[0.03]"
                    )}
                  >
                    <div className="relative flex-shrink-0 mt-1">
                      {getIcon(notif.tipo)}
                      {!notif.lida && (
                        <span className="absolute -top-1 -left-1 w-2 h-2 bg-orange-500 rounded-full border border-[#0F0F0F]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs leading-tight mb-1",
                        notif.lida ? "text-neutral-400" : "text-white font-medium"
                      )}>
                        {notif.titulo}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-normal mb-2">
                        {notif.descricao}
                      </p>
                      <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">
                        {formatRelativeTime(notif.created_at)}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3 h-3 text-neutral-700" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-[#2A2A2A] bg-[#141414] text-center">
             <Link href="/configuracoes/notificacoes" className="text-[9px] text-neutral-600 font-mono hover:text-neutral-400 transition-colors uppercase tracking-widest">
                Gerenciar Preferências
             </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}
