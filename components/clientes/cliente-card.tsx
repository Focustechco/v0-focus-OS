"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical,
  ExternalLink,
  FolderKanban,
  FileText,
  Paperclip,
  Trash2
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ClienteCard({ cliente, projectCount, onViewDetails, onDelete }: any) {
  
  // Extrai iniciais
  const getInitials = (name: string) => {
    if (!name) return "CL"
    const words = name.split(" ")
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const initials = getInitials(cliente.empresa || cliente.nome)

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-all group overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {cliente.logo_url ? (
              <img 
                src={cliente.logo_url} 
                alt="Logo do cliente"
                className="w-11 h-11 rounded-lg object-cover bg-white"
                style={{ width: "44px", height: "44px", borderRadius: "8px" }}
              />
            ) : (
              <div 
                className="w-11 h-11 rounded-lg bg-[#1A1A1A] flex items-center justify-center border border-[#2A2A2A]"
                style={{ width: "44px", height: "44px", borderRadius: "8px" }}
              >
                <span className="text-orange-500 font-bold font-mono tracking-widest text-sm uppercase">{initials}</span>
              </div>
            )}
            
            <div>
              <h3 className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors uppercase tracking-tight flex items-center gap-2">
                {cliente.empresa || "Sem Empresa"}
              </h3>
              <p className="text-neutral-500 text-xs">{cliente.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cliente.contract_url && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-neutral-500 hover:text-white"
                      onClick={() => window.open(cliente.contract_url, '_blank')}
                    >
                      <Paperclip className="w-4 h-4 text-orange-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <p>Contrato anexado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] uppercase font-mono tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2.5 mr-1"
                onClick={(e) => { e.stopPropagation(); onDelete(cliente.id); }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Excluir
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                <DropdownMenuItem onClick={onViewDetails} className="focus:bg-[#2A2A2A] focus:text-orange-500 cursor-pointer">
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                  Editar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Mail className="w-3.5 h-3.5 text-neutral-600" />
            <span className="truncate">{cliente.email || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <FileText className="w-3.5 h-3.5 text-neutral-600" />
            <span>{cliente.cnpj || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Phone className="w-3.5 h-3.5 text-neutral-600" />
            <span>{cliente.telefone || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-500 text-[10px] py-0 px-2 h-5 flex items-center gap-1">
              <FolderKanban className="w-3 h-3" />
              {projectCount} {projectCount === 1 ? "Projeto" : "Projetos"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 font-mono">
            <Calendar className="w-3 h-3" />
            {new Date(cliente.created_at).toLocaleDateString()}
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={onViewDetails}
          className="w-full mt-4 h-8 text-xs bg-[#1A1A1A] hover:bg-orange-500 hover:text-white transition-all text-neutral-400 font-mono tracking-widest uppercase"
        >
          Ver Detalhes
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
