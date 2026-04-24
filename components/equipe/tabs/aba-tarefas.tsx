"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Plus, Loader2, CheckCircle2, UserPlus, Calendar, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AbaTarefas({ userType }: { userType: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentEquipeId, setCurrentEquipeId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    atribuido_para: [] as string[],
    data: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Carregar todo o time primeiro (essencial para o modal de atribuição)
      const { data: members } = await supabase
        .from("equipe")
        .select("id, nome, tipo")
      setTeam(members || [])

      // 2. Identificar o ID do membro atual
      const { data: equipeMember } = await supabase
        .from("equipe")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle()
      
      const memberId = equipeMember?.id
      if (memberId) setCurrentEquipeId(memberId)

      // 3. Carregar tarefas de hoje
      const today = new Date().toISOString().split('T')[0]
      let query = supabase.from("tarefas_dia").select("*, atribuido_para(nome)")
      
      if (userType !== 'admin' && memberId) {
          query = query.eq("atribuido_para", memberId)
      }
      
      const { data: taskData } = await query.eq("data", today).order("created_at", { ascending: true })
      setTasks(taskData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tarefas_dia")
        .update({ concluida: !currentStatus })
        .eq("id", taskId)
      
      if (error) throw error

      setTasks(tasks.map(t => t.id === taskId ? {...t, concluida: !currentStatus} : t))
      
      if (!currentStatus) {
          const myTasks = tasks.map(t => t.id === taskId ? {...t, concluida: true} : t)
          if (myTasks.every(t => t.concluida)) {
              toast.success("👏 Parabéns! Todas as tarefas concluídas!", { 
                  description: "Você finalizou sua pauta do dia com sucesso.",
                  duration: 5000
              })
          }
      }
    } catch (error) {
      toast.error("Erro ao atualizar tarefa")
    }
  }

  const handleAddTasks = async () => {
    if (!formData.titulo || formData.atribuido_para.length === 0) {
      toast.error("Preencha o título e selecione pelo menos um membro")
      return
    }

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newTasks = formData.atribuido_para.map(userId => ({
        titulo: formData.titulo,
        descricao: formData.descricao,
        atribuido_para: userId,
        atribuido_por: currentEquipeId,
        data: formData.data
      }))

      const { error } = await supabase.from("tarefas_dia").insert(newTasks)
      if (error) throw error

      // Notificações (Simulado via Toast para o admin, mas gravado no banco conforme pedido)
      for (const userId of formData.atribuido_para) {
          await supabase.from("notificacoes").insert({
              usuario_id: userId, // Nota: id da equipe
              titulo: "Nova tarefa atribuída",
              descricao: `${formData.titulo} foi atribuída a você para hoje`,
              tipo: "tarefa"
          })
      }

      toast.success("Tarefas atribuídas com sucesso!")
      setIsAddModalOpen(false)
      setFormData({
        titulo: "",
        descricao: "",
        atribuido_para: [],
        data: new Date().toISOString().split('T')[0]
      })
      loadInitialData()
    } catch (error) {
      toast.error("Erro ao atribuir tarefas")
    } finally {
      setSaving(false)
    }
  }

  const myTasks = tasks.filter(t => t.atribuido_para === currentEquipeId || (typeof t.atribuido_para === 'object' && (t.atribuido_para as any).id === currentEquipeId))
  const completedCount = myTasks.filter(t => t.concluida).length
  const progress = myTasks.length > 0 ? (completedCount / myTasks.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Container Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 order-1 lg:order-1">
            <Card className="bg-card border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[8px] text-orange-500/20 uppercase tracking-widest leading-none">
                    Dailies
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Minha Pauta do Dia</CardTitle>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase">
                        {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-neutral-500">
                            <span>{completedCount} DE {myTasks.length} CONCLUÍDAS</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-orange-500/10 [&>div]:bg-orange-500" />
                    </div>

                    <div className="space-y-3 pt-2">
                        {myTasks.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-border rounded-xl">
                                <p className="text-xs text-neutral-600 italic">Sem tarefas para hoje.</p>
                            </div>
                        ) : (
                            myTasks.map(t => (
                                <div key={t.id} className="flex items-start gap-3 p-3 bg-background border border-border rounded-xl group hover:border-orange-500/30 transition-all">
                                    <Checkbox 
                                        checked={t.concluida} 
                                        onCheckedChange={() => toggleTask(t.id, t.concluida)}
                                        className="mt-0.5 border-neutral-700 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" 
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-xs font-medium transition-all ${t.concluida ? 'text-neutral-600 line-through' : 'text-foreground'}`}>
                                            {t.titulo}
                                        </p>
                                        {t.descricao && <p className="text-[10px] text-neutral-500 line-clamp-1">{t.descricao}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {progress === 100 && myTasks.length > 0 && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="text-[10px] font-mono font-bold leading-tight uppercase">Todas as tarefas concluídas!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* View Admin: Todos os Membros */}
        <div className="lg:col-span-8 space-y-4 order-2 lg:order-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-[0.2em]">Dinâmica da Equipe</h3>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto h-8 px-4 bg-background border-border text-foreground hover:bg-orange-500 hover:border-orange-500 transition-all font-mono text-[10px] tracking-widest rounded-sm"
                >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    NOVA TAREFA / ATRIBUIR
                </Button>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.filter(m => m.id !== currentEquipeId).map(member => {
                        const memberTasks = tasks.filter(t => t.atribuido_para === member.id || (typeof t.atribuido_para === 'object' && (t.atribuido_para as any).id === member.id))
                        const comp = memberTasks.filter(t => t.concluida).length
                        const perc = memberTasks.length > 0 ? (comp / memberTasks.length) * 100 : 0
                        
                        return
                            <Card key={member.id} className="bg-card border-border hover:bg-white/5 transition-colors">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-foreground">{member.nome}</p>
                                            <p className="text-[10px] font-mono text-neutral-500 uppercase">{member.tipo}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-mono border-orange-500/20 text-orange-500">
                                            {comp}/{memberTasks.length}
                                        </Badge>
                                    </div>
                                    <Progress value={perc} className="h-1 bg-white/5 [&>div]:bg-orange-500" />
                                    
                                    <div className="space-y-1.5 opacity-60">
                                        {memberTasks.slice(0, 3).map(mt => (
                                            <div key={mt.id} className="flex items-center gap-2 text-[10px]">
                                                {mt.concluida ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-neutral-700" />}
                                                <span className={`truncate ${mt.concluida ? 'text-neutral-500 line-through' : 'text-neutral-400'}`}>{mt.titulo}</span>
                                            </div>
                                        ))}
                                        {memberTasks.length > 3 && (
                                            <p className="text-[9px] font-mono text-neutral-600 pl-5">+ {memberTasks.length - 3} tarefas</p>
                                        )}
                                        {memberTasks.length === 0 && <p className="text-[9px] font-mono text-neutral-700 italic">Sem tarefas hoje.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }}
                </div>
            </div>
      </div>

      {/* Modal Atribuir Tarefa */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              Atribuir Nova Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Título da Tarefa</Label>
              <Input 
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ex: Atualizar relatório mensal"
                className="bg-background border-border text-foreground" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Membro(s) da Equipe</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-background border border-border rounded-xl">
                  {team.map(m => (
                      <div key={m.id} className="flex items-center gap-2 p-1.5">
                          <Checkbox 
                            id={`member-${m.id}`}
                            checked={formData.atribuido_para.includes(m.id)}
                            onCheckedChange={(checked) => {
                                const list = checked 
                                    ? [...formData.atribuido_para, m.id] 
                                    : formData.atribuido_para.filter(id => id !== m.id)
                                setFormData({...formData, atribuido_para: list})
                            }}
                            className="border-neutral-700 data-[state=checked]:bg-orange-500"
                          />
                          <label htmlFor={`member-${m.id}`} className="text-xs text-neutral-400 cursor-pointer">{m.nome}</label>
                      </div>
                  ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Data</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                        <Input 
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({...formData, data: e.target.value})}
                            className="bg-background border-border text-foreground pl-9 text-xs" 
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Descrição Opcional</Label>
              <Textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="bg-background border-border text-foreground h-20" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
                variant="ghost" 
                onClick={() => setIsAddModalOpen(false)}
                className="font-mono text-[10px] tracking-widest uppercase hover:bg-white/5"
            >
                Cancelar
            </Button>
            <Button 
                onClick={handleAddTasks} 
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-[10px] tracking-widest uppercase px-6 rounded-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atribuir Tarefa(s)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
