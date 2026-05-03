"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MoreVertical,
  X,
  Check,
  Layout,
  HeadphonesIcon
} from "lucide-react"
import { useFluxo, ProjectStage } from "@/lib/hooks/use-fluxo"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { usePermissoes } from "@/lib/hooks/use-permissoes"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────

function StageCard({ 
  stage, 
  projetoId,
  isExpanded, 
  onToggle, 
  onEdit,
  isAdmin 
}: { 
  stage: ProjectStage; 
  projetoId: string;
  isExpanded: boolean; 
  onToggle: () => void;
  onEdit: (s: ProjectStage) => void;
  isAdmin: boolean;
  index: number;
}) {
  const { toggleItem, addItem, deleteItem, updateItem, addGroup, updateGroup } = useFluxo(projetoId)
  const { equipe } = useEquipe()

  // Cálculo de progresso
  const allItems = stage.groups?.flatMap(g => g.items || []) || []
  const completedItems = allItems.filter(it => it.concluido).length
  const totalItems = allItems.length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Icon Mapping
  const getIcon = (name: string) => {
    const icons: any = { Layout, Code, Rocket, Shield, HeadphonesIcon, Briefcase: Layout }
    return icons[name] || Layout
  }
  const Icon = getIcon(stage.icone)

  // Estados locais para edição rápida (inline)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null)
  const [addingGroupToStage, setAddingGroupToStage] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} id={`stage-${stage.id}`}>
      <Card className={`bg-card border-border border-l-4 ${stage.cor.replace('bg-', 'border-')} hover:border-orange-500/30 transition-colors group/card`}>
        <div className="flex items-center">
            <CollapsibleTrigger className="flex-1 text-left">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage.cor}`}>
                    <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="text-left">
                    <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
                        ETAPA {index}: {stage.nome}
                        {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                        ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                        )}
                    </CardTitle>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{stage.descricao}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                    <div className="text-xs text-neutral-400 font-mono">{progress}%</div>
                    <div className="text-[10px] text-neutral-500">{completedItems}/{totalItems} tarefas</div>
                    </div>
                    <div className="w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden hidden sm:block">
                    <div
                        className={`h-full ${stage.cor} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                    />
                    </div>
                </div>
                </div>
            </CardHeader>
            </CollapsibleTrigger>
            
            {isAdmin && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-4 opacity-0 group-hover/card:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onEdit(stage); }}
                >
                    <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                </Button>
            )}
        </div>

        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-border">
            <div className="grid gap-4 mt-4">
              {stage.groups?.map((group) => (
                <div key={group.id} className="p-4 bg-background rounded-lg border border-border relative group/group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {editingGroup === group.id ? (
                            <div className="flex items-center gap-2">
                                <Input 
                                    autoFocus
                                    className="h-6 text-[10px] w-32 bg-background border-orange-500/50"
                                    value={group.nome}
                                    onChange={(e) => updateGroup(group.id, { nome: e.target.value })}
                                    onBlur={() => setEditingGroup(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingGroup(null)}
                                />
                            </div>
                        ) : (
                            <Badge 
                                className={`text-[10px] ${group.badge_color} text-foreground cursor-pointer hover:brightness-110`}
                                onClick={() => isAdmin && setEditingGroup(group.id)}
                            >
                                {group.nome}
                            </Badge>
                        )}

                        {group.warning_text ? (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 group/warning relative cursor-help">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="max-w-[200px] truncate">{group.warning_text}</span>
                            {isAdmin && (
                                <button onClick={() => updateGroup(group.id, { warning_text: null })} className="ml-1 opacity-0 group-hover/warning:opacity-100">
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                        ) : isAdmin && (
                            <button 
                                onClick={() => {
                                    const warn = prompt("Digite o aviso:");
                                    if(warn) updateGroup(group.id, { warning_text: warn });
                                }}
                                className="opacity-0 group-hover/group:opacity-100 text-yellow-500/50 hover:text-yellow-500 transition-opacity"
                            >
                                <AlertTriangle className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.items?.map((item) => {
                       const finisher = item.concluido_por ? equipe.find(e => e.usuario_id === item.concluido_por) : null;
                       return (
                        <div key={item.id} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3 flex-1">
                                <button 
                                    onClick={() => toggleItem(item.id, !item.concluido)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    {item.concluido ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                    <Circle className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                                    )}
                                </button>
                                
                                {editingItem === item.id ? (
                                    <Input 
                                        autoFocus
                                        className="h-7 text-xs bg-background border-orange-500/50 flex-1"
                                        value={item.titulo}
                                        onChange={(e) => updateItem(item.id, { titulo: e.target.value })}
                                        onBlur={() => setEditingItem(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                                    />
                                ) : (
                                    <span 
                                        className={`text-xs transition-all cursor-text ${item.concluido ? "text-neutral-500 line-through" : "text-foreground"}`}
                                        onDoubleClick={() => isAdmin && setEditingItem(item.id)}
                                        title={item.concluido && finisher ? `Concluído por ${finisher.nome} em ${item.concluido_em ? format(new Date(item.concluido_em), 'dd/MM HH:mm') : '-'}` : ""}
                                    >
                                        {item.titulo}
                                    </span>
                                )}
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem(item.id)}>
                                        <Trash2 className="w-3 h-3 text-red-500/70 hover:text-red-500" />
                                    </Button>
                                </div>
                            )}
                        </div>
                       )
                    })}

                    {addingToGroup === group.id ? (
                        <div className="flex items-center gap-2 pt-1">
                            <Input 
                                autoFocus
                                placeholder="Título da tarefa..."
                                className="h-7 text-xs bg-background border-[#333]"
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        addItem(group.id, projetoId, newItemTitle, (group.items?.length || 0) + 1);
                                        setNewItemTitle("");
                                        setAddingToGroup(null);
                                    }
                                    if(e.key === 'Escape') setAddingToGroup(null);
                                }}
                            />
                        </div>
                    ) : isAdmin && (
                        <button 
                            onClick={() => setAddingToGroup(group.id)}
                            className="text-[10px] text-neutral-500 hover:text-orange-500 flex items-center gap-1.5 pt-1 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Adicionar item
                        </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                {isAdmin && (
                    addingGroupToStage ? (
                        <div className="flex items-center gap-2">
                            <Input 
                                autoFocus
                                placeholder="Nome do grupo..."
                                className="h-8 text-xs bg-background border-orange-500/30"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        addGroup(stage.id, newGroupName, (stage.groups?.length || 0) + 1);
                                        setNewGroupName("");
                                        setAddingGroupToStage(false);
                                    }
                                }}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddingGroupToStage(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] text-neutral-500 hover:text-orange-500"
                            onClick={() => setAddingGroupToStage(true)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Grupo
                        </Button>
                    )
                )}

                <Button className="bg-orange-500 hover:bg-orange-600 text-foreground text-xs ml-auto">
                  Aprovar e Avançar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ─── MAIN TAB COMPONENT ───────────────────────────────────────────────────

export function FluxoTab() {
  const { projects, isLoading: projectsLoading } = useProjetos()
  const [selectedProjeto, setSelectedProjeto] = useState<string>("")
  const [selectedFluxo, setSelectedFluxo] = useState<string>("Software")
  
  const { stages, isLoading: stagesLoading, updateStage, seedFluxo } = useFluxo(selectedProjeto)
  const { isAdmin } = usePermissoes()

  const [expandedStages, setExpandedStages] = useState<string[]>([])
  const [isSeeding, setIsSeeding] = useState(false)

  // Persistência da seleção do projeto
  useEffect(() => {
    const saved = localStorage.getItem("focus_last_project_fluxo")
    if (saved) setSelectedProjeto(saved)
  }, [])

  useEffect(() => {
    if (selectedProjeto) {
      localStorage.setItem("focus_last_project_fluxo", selectedProjeto)
    }
  }, [selectedProjeto])

  // Persistência de expansão
  useEffect(() => {
      const saved = localStorage.getItem(`focus_expanded_stages_${selectedProjeto}`)
      if (saved) setExpandedStages(JSON.parse(saved))
      else if (stages.length > 0) setExpandedStages([stages[0].id])
  }, [selectedProjeto, stages.length > 0])

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => {
        const next = prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
        localStorage.setItem(`focus_expanded_stages_${selectedProjeto}`, JSON.stringify(next))
        return next
    })
  }

  // Modal Edição
  const [editingStage, setEditingStage] = useState<ProjectStage | null>(null)
  const [stageForm, setStageForm] = useState<Partial<ProjectStage>>({})

  const handleSaveStage = async () => {
    if (!editingStage) return
    try {
        await updateStage(editingStage.id, stageForm)
        toast.success("Etapa atualizada!")
        setEditingStage(null)
    } catch (err) {
        toast.error("Erro ao salvar etapa")
    }
  }

  if (projectsLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-neutral-500 font-mono animate-pulse">Carregando Projetos...</p>
    </div>
  )

  return (
    <div className="flex-1 w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Fluxo de Etapas</h1>
              <p className="text-sm text-neutral-500">Acompanhamento de progresso e checklist operacional</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-[200px]">
                <Select value={selectedProjeto} onValueChange={setSelectedProjeto}>
                  <SelectTrigger className="bg-background border-border h-9">
                    <SelectValue placeholder="Selecione o Projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161616] border-[#222]">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[240px]">
                <Select value={selectedFluxo} onValueChange={setSelectedFluxo}>
                  <SelectTrigger className="bg-background border-border h-9">
                    <SelectValue placeholder="Tipo de Processo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161616] border-[#222]">
                    <SelectItem value="Software">Desenvolvimento de Software</SelectItem>
                    <SelectItem value="Design">Design UI/UX</SelectItem>
                    <SelectItem value="Consultoria">Consultoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-border bg-card text-[10px] h-9"
                onClick={() => setExpandedStages(stages.map(s => s.id))}
              >
                Expandir Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border bg-card text-[10px] h-9"
                onClick={() => setExpandedStages([])}
              >
                Recolher Todos
              </Button>
            </div>
          </div>

          {/* Pipeline de Navegação */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-4 no-scrollbar">
            {stages.map((stage, idx) => {
                const all = stage.groups?.flatMap(g => g.items || []) || []
                const comp = all.filter(it => it.concluido).length
                const prog = all.length > 0 ? (comp / all.length) : 0
                const isComplete = prog === 1 && all.length > 0

                const getIcon = (name: string) => {
                  const icons: any = { Layout, Code, Rocket, Shield, HeadphonesIcon, Briefcase: Layout }
                  return icons[name] || Layout
                }
                const Icon = getIcon(stage.icone)

                return (
                    <div key={stage.id} className="flex items-center">
                        <button
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${stage.cor}
                            ${isComplete ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border border-transparent'}
                            hover:scale-105 active:scale-95
                        `}
                        onClick={() => {
                            if(!expandedStages.includes(stage.id)) toggleStage(stage.id);
                            document.getElementById(`stage-${stage.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        >
                        {isComplete ? <Check className="w-3.5 h-3.5 text-white" /> : <Icon className="w-3.5 h-3.5 text-white" />}
                        <span className="text-[10px] text-white font-bold whitespace-nowrap uppercase tracking-tighter">
                            {idx + 1}. {stage.nome.split(" ")[0]}
                        </span>
                        </button>
                        {idx < stages.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-neutral-600 mx-1 flex-shrink-0" />
                        )}
                    </div>
                )
            })}
          </div>

          {/* Stages Content */}
          <div className="space-y-4 min-h-[400px]">
            {stagesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <p className="text-[10px] font-mono">Sincronizando Etapas...</p>
                </div>
            ) : stages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#222] rounded-2xl">
                    <Layout className="w-12 h-12 text-neutral-800 mb-4" />
                    <h3 className="text-lg font-bold text-neutral-400">Nenhum fluxo configurado</h3>
                    <p className="text-sm text-neutral-600 max-w-xs mt-2">Este projeto ainda não possui um pipeline de etapas definido.</p>
                    {isAdmin && (
                        <Button 
                            className="mt-6 bg-orange-500 hover:bg-orange-600"
                            onClick={async () => {
                                try {
                                    setIsSeeding(true)
                                    await seedFluxo(selectedProjeto, selectedFluxo)
                                    toast.success("Fluxo inicializado com sucesso!")
                                } catch (err) {
                                    toast.error("Erro ao inicializar fluxo")
                                } finally {
                                    setIsSeeding(false)
                                }
                            }}
                            disabled={isSeeding}
                        >
                            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Iniciar Fluxo Padrão
                        </Button>
                    )}
                </div>
            ) : (
                stages.map((stage) => (
                    <StageCard
                        key={stage.id}
                        stage={stage}
                        projetoId={selectedProjeto}
                        isExpanded={expandedStages.includes(stage.id)}
                        onToggle={() => toggleStage(stage.id)}
                        isAdmin={isAdmin}
                        index={idx + 1}
                        onEdit={(s) => {
                            setEditingStage(s);
                            setStageForm(s);
                        }}
                    />
                ))
            )}
          </div>

          {/* Modal Editar Etapa */}
          <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
            <DialogContent className="bg-[#161616] border-[#222] text-white">
                <DialogHeader>
                    <DialogTitle>Editar Etapa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500">NOME DA ETAPA</Label>
                        <Input 
                            value={stageForm.nome || ""} 
                            onChange={e => setStageForm({...stageForm, nome: e.target.value})}
                            className="bg-[#0f0f0f] border-[#222]" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-500">DESCRIÇÃO CURTA</Label>
                        <Input 
                            value={stageForm.descricao || ""} 
                            onChange={e => setStageForm({...stageForm, descricao: e.target.value})}
                            className="bg-[#0f0f0f] border-[#222]" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-neutral-500">ORDEM</Label>
                            <Input 
                                type="number"
                                value={stageForm.ordem || 0} 
                                onChange={e => setStageForm({...stageForm, ordem: Number(e.target.value)})}
                                className="bg-[#0f0f0f] border-[#222]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-neutral-500">COR (CSS Class)</Label>
                            <Input 
                                value={stageForm.cor || ""} 
                                onChange={e => setStageForm({...stageForm, cor: e.target.value})}
                                className="bg-[#0f0f0f] border-[#222]" 
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setEditingStage(null)}>Cancelar</Button>
                    <Button onClick={handleSaveStage} className="bg-orange-500 hover:bg-orange-600">Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
  )
}
