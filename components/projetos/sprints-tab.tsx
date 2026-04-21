"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap,
  Calendar,
  Plus,
  ArrowRight,
  TrendingDown,
} from "lucide-react"

import { useSprints } from "@/lib/hooks/use-sprints"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { supabase } from "@/lib/supabase"
import { SprintDetailsModal } from "./sprint-details-modal"

import { SprintCard } from "./sprint-card"

export function SprintsTab() {
  const { sprints, addSprint, isLoading: loadingSprints } = useSprints()
  const { projects } = useProjetos()
  
  const [newSprintOpen, setNewSprintOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    projeto_id: "",
    objetivo: "",
    data_inicio: "",
    data_fim: "",
  })

  // Modal de Detalhes da Sprint
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<any>(null)
  
  const handleViewSprint = (sprint: any) => {
    setSelectedSprint(sprint)
    setDetailsModalOpen(true)
  }

  // Pegando a sprint mais recente como a "ativa" para destaque
  const activeSprint = sprints?.find((s: any) => s.status === "ativa") || sprints?.[0]
  const { tasks: sprintTasks, isLoading: loadingTasks } = useTarefas(activeSprint?.id)

  const isLoading = loadingSprints || loadingTasks

  const handleCreateSprint = async () => {
    if (!formData.nome || !formData.projeto_id || !formData.data_inicio || !formData.data_fim) {
      alert("Preencha todos os campos obrigatorios!")
      return
    }

    await addSprint({
      ...formData,
      status: "ativa"
    })
    
    setNewSprintOpen(false)
    setFormData({ nome: "", projeto_id: "", objetivo: "", data_inicio: "", data_fim: "" })
  }

  const handleDeleteSprint = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sprint permanentemente? As tarefas associadas podem perder o seu agrupamento de Sprint.")) return
    try {
      const { error } = await supabase.from("sprints").delete().eq("id", id)
      if (error) throw error
      alert("Sprint excluída com sucesso.")
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir sprint.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-orange-500">
         Carregando Sprints e Tasks do Banco de Dados...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-white">Sprints</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Gerenciamento de sprints ativas do Supabase</p>
        </div>
        
        <Dialog open={newSprintOpen} onOpenChange={setNewSprintOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sprint
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white">
            <DialogHeader>
              <DialogTitle className="font-display">Criar Nova Sprint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs font-mono uppercase">Nome da Sprint</Label>
                <Input 
                  placeholder="Ex: SPRINT #12 - MVP"
                  className="bg-[#1A1A1A] border-[#2A2A2A]"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs font-mono uppercase">Vincular Projeto</Label>
                <Select value={formData.projeto_id} onValueChange={(val) => setFormData({...formData, projeto_id: val})}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectValue placeholder="Selecione o projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {projects.map((proj: any) => (
                      <SelectItem key={proj.id} value={proj.id}>{proj.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs font-mono uppercase">Objetivo da Sprint</Label>
                <Textarea 
                  placeholder="O que queremos entregar..."
                  className="bg-[#1A1A1A] border-[#2A2A2A] min-h-[80px]"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-400 text-xs font-mono uppercase">Data Inicio</Label>
                  <Input 
                    type="date"
                    className="bg-[#1A1A1A] border-[#2A2A2A] [color-scheme:dark]"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-400 text-xs font-mono uppercase">Data Fim</Label>
                  <Input 
                    type="date"
                    className="bg-[#1A1A1A] border-[#2A2A2A] [color-scheme:dark]"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleCreateSprint} className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                Criar Sprint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!activeSprint ? (
        <div className="text-neutral-500 text-center p-12 bg-[#141414] rounded border border-[#2A2A2A]">
           Nenhuma Sprint cadastrada no banco.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Sprint Detail */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-orange-500">
              <CardHeader className="border-b border-[#2A2A2A] p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    {activeSprint.nome.toUpperCase()}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <div className="text-sm text-neutral-400 max-w-lg">
                    Objetivo Oficial: <span className="text-white">{activeSprint.objetivo}</span>
                  </div>
                </div>

                <div className="h-40 sm:h-48 bg-[#0A0A0A] rounded-lg p-3 sm:p-4 flex items-center justify-center border border-[#2A2A2A] border-dashed">
                    <div className="text-center text-neutral-500">
                        <TrendingDown className="w-8 h-8 opacity-20 mx-auto mb-2" />
                        <span className="text-xs font-mono">GRAFICO BURNDOWN</span><br/>
                        <span className="text-[10px]">Aguardando conexao com historico de pontuacao real das Tasks</span>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A] p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider">
                  TASKS DESTA SPRINT (WIP)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 text-neutral-500 text-center text-xs font-mono">
                    Nenhuma task encontrada para esta sprint
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider">HISTORICO DE SPRINTS</h2>
            {sprints.map((sprint: any) => (
               <SprintCard key={sprint.id} sprint={sprint} onView={() => handleViewSprint(sprint)} onDelete={handleDeleteSprint} />
            ))}
          </div>
        </div>
      )}

      {/* Modal De Visualização da Sprint */}
      <SprintDetailsModal 
        open={detailsModalOpen} 
        onOpenChange={setDetailsModalOpen} 
        sprint={selectedSprint} 
      />
    </div>
  )
}
