"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useClickUpCRM, useDealComments } from "@/hooks/use-clickup"
import { 
  formatMRR, 
  formatDate, 
  formatRelativeDate, 
  getDealAlertLevel,
  type CRMDeal 
} from "@/lib/crm-field-mapper"
import type { ClickUpStatus } from "@/lib/clickup-api"
import {
  Search,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Calendar,
  User,
  Mail,
  Phone,
  Tag,
  DollarSign,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Plus,
  GripVertical
} from "lucide-react"

interface PipelineKanbanProps {
  deals: CRMDeal[]
  statuses: ClickUpStatus[]
  loading: boolean
}

export function PipelineKanban({ deals, statuses, loading }: PipelineKanbanProps) {
  const { updateDealStatus, members } = useClickUpCRM()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedDeal, setSelectedDeal] = useState<CRMDeal | null>(null)
  const [draggingDeal, setDraggingDeal] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Get unique assignees and types for filters
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>()
    deals.forEach(deal => {
      deal.assignees.forEach(a => assignees.add(a.username))
    })
    return Array.from(assignees)
  }, [deals])

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>()
    deals.forEach(deal => {
      if (deal.tipo) types.add(deal.tipo)
    })
    return Array.from(types)
  }, [deals])

  // Filter deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          deal.name.toLowerCase().includes(query) ||
          deal.empresa?.toLowerCase().includes(query) ||
          deal.contato?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Assignee filter
      if (filterAssignee !== "all") {
        const hasAssignee = deal.assignees.some(a => a.username === filterAssignee)
        if (!hasAssignee) return false
      }

      // Type filter
      if (filterType !== "all") {
        if (deal.tipo !== filterType) return false
      }

      return true
    })
  }, [deals, searchQuery, filterAssignee, filterType])

  // Group deals by status
  const dealsByStatus = useMemo(() => {
    const grouped = new Map<string, CRMDeal[]>()
    
    // Initialize with empty arrays for each status
    statuses.forEach(status => {
      grouped.set(status.status, [])
    })
    
    // Add deals to their status groups
    filteredDeals.forEach(deal => {
      const statusName = deal.status.status
      if (grouped.has(statusName)) {
        grouped.get(statusName)!.push(deal)
      } else {
        // Handle unknown statuses
        grouped.set(statusName, [deal])
      }
    })
    
    return grouped
  }, [filteredDeals, statuses])

  // Sort statuses by orderindex
  const sortedStatuses = useMemo(() => {
    return [...statuses].sort((a, b) => a.orderindex - b.orderindex)
  }, [statuses])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingDeal(dealId)
    e.dataTransfer.setData("dealId", dealId)
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drop
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    
    if (dealId && draggingDeal) {
      setUpdatingStatus(dealId)
      try {
        await updateDealStatus(dealId, newStatus)
      } finally {
        setUpdatingStatus(null)
        setDraggingDeal(null)
      }
    }
  }

  // Handle advance to next status
  const handleAdvance = async (deal: CRMDeal) => {
    const currentIndex = sortedStatuses.findIndex(s => s.status === deal.status.status)
    if (currentIndex < sortedStatuses.length - 1) {
      const nextStatus = sortedStatuses[currentIndex + 1]
      setUpdatingStatus(deal.id)
      try {
        await updateDealStatus(deal.id, nextStatus.status)
      } finally {
        setUpdatingStatus(null)
      }
    }
  }

  // Loading skeleton
  if (loading && deals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-72">
              <Skeleton className="h-10 w-full bg-[#1A1A1A] mb-3" />
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-40 w-full bg-[#1A1A1A]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border border-border">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border text-sm"
          />
        </div>
        
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-40 bg-background border-border">
            <User className="w-4 h-4 mr-2 text-neutral-500" />
            <SelectValue placeholder="Responsavel" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            {uniqueAssignees.map(assignee => (
              <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44 bg-background border-border">
            <Tag className="w-4 h-4 mr-2 text-neutral-500" />
            <SelectValue placeholder="Tipo de Servico" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="bg-orange-500 hover:bg-orange-600 text-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Novo Deal
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="kanban-container pb-4">
        {sortedStatuses.map(status => {
          const statusDeals = dealsByStatus.get(status.status) || []
          const totalValue = statusDeals.reduce((sum, d) => sum + (d.valor || 0), 0)

          return (
            <div
              key={status.id}
              className="kanban-column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, status.status)}
            >
              {/* Column Header */}
              <div 
                className="flex items-center justify-between mb-3 p-3 rounded-lg bg-[#0D0D0D] border border-[#1F1F1F]"
                style={{ borderLeftColor: status.color, borderLeftWidth: 3 }}
              >
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    {status.status}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    {statusDeals.length} deals
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-card border-border">
                  {formatMRR(totalValue).replace('/mes', '')}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-96">
                {statusDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    status={status}
                    isUpdating={updatingStatus === deal.id}
                    isDragging={draggingDeal === deal.id}
                    onDragStart={handleDragStart}
                    onClick={() => setSelectedDeal(deal)}
                    onAdvance={() => handleAdvance(deal)}
                    canAdvance={sortedStatuses.findIndex(s => s.status === deal.status.status) < sortedStatuses.length - 1}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Deal Drawer */}
      <DealDrawer
        deal={selectedDeal}
        statuses={sortedStatuses}
        onClose={() => setSelectedDeal(null)}
        onStatusChange={async (newStatus) => {
          if (selectedDeal) {
            setUpdatingStatus(selectedDeal.id)
            try {
              await updateDealStatus(selectedDeal.id, newStatus)
            } finally {
              setUpdatingStatus(null)
            }
          }
        }}
        isUpdating={Boolean(selectedDeal && updatingStatus === selectedDeal.id)}
      />
    </div>
  )
}

// Deal Card Component
interface DealCardProps {
  deal: CRMDeal
  status: ClickUpStatus
  isUpdating: boolean
  isDragging: boolean
  onDragStart: (e: React.DragEvent, dealId: string) => void
  onClick: () => void
  onAdvance: () => void
  canAdvance: boolean
}

function DealCard({ deal, status, isUpdating, isDragging, onDragStart, onClick, onAdvance, canAdvance }: DealCardProps) {
  const alertLevel = getDealAlertLevel(deal)

  return (
    <Card
      className={`bg-card border-border cursor-pointer transition-all duration-150 hover:border-orange-500/50 hover:bg-accent/10 hover:-translate-y-0.5 ${
        isDragging ? 'opacity-50' : ''
      } ${isUpdating ? 'animate-pulse' : ''}`}
      style={{ borderLeftColor: status.color, borderLeftWidth: 3 }}
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          {deal.tags.length > 0 && (
            <Badge 
              variant="outline" 
              className="text-[9px] font-mono"
              style={{ 
                backgroundColor: `${deal.tags[0].bgColor}20`,
                borderColor: deal.tags[0].bgColor,
                color: deal.tags[0].color || deal.tags[0].bgColor
              }}
            >
              {deal.tags[0].name}
            </Badge>
          )}
          {deal.priority && (
            <Badge 
              variant="outline" 
              className="text-[9px]"
              style={{ borderColor: deal.priority.color, color: deal.priority.color }}
            >
              {deal.priority.priority === 'urgent' ? 'URGENTE' : 
               deal.priority.priority === 'high' ? 'ALTA' : 
               deal.priority.priority === 'normal' ? 'NORMAL' : 'BAIXA'}
            </Badge>
          )}
        </div>

        {/* Company Name */}
        <div>
          <h4 className="text-sm font-display font-bold text-foreground line-clamp-1">
            {deal.empresa || deal.name}
          </h4>
          {deal.contato && (
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Contato: {deal.contato}
            </p>
          )}
        </div>

        {/* Value */}
        {deal.valor && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-sm font-mono text-orange-500 font-semibold">
              {formatMRR(deal.valor)}
            </span>
          </div>
        )}

        {/* Assignee & Due Date */}
        <div className="flex items-center justify-between text-[10px] text-neutral-500">
          {deal.assignees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarImage src={deal.assignees[0].profilePicture || undefined} />
                <AvatarFallback 
                  className="text-[8px]"
                  style={{ backgroundColor: deal.assignees[0].color }}
                >
                  {deal.assignees[0].initials}
                </AvatarFallback>
              </Avatar>
              <span>{deal.assignees[0].username}</span>
            </div>
          )}
          {deal.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(deal.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Alert */}
        {alertLevel && (
          <div className={`flex items-center gap-1.5 text-[10px] ${
            alertLevel === 'danger' ? 'text-red-500' : 
            alertLevel === 'warning' ? 'text-yellow-500' : 'text-blue-500'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            <span>
              {alertLevel === 'danger' ? `Parado ha ${formatRelativeDate(deal.dateUpdated)}` :
               alertLevel === 'warning' ? `Sem atualizacao ${formatRelativeDate(deal.dateUpdated)}` :
               `Prazo em ${Math.ceil((deal.dueDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[10px] text-neutral-400 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              window.open(deal.url, '_blank')
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            ClickUp
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-[10px] text-neutral-400 hover:text-foreground"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            {/* TODO: fetch comment count */}
            0
          </Button>
          {canAdvance && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px] text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 ml-auto"
              onClick={(e) => {
                e.stopPropagation()
                onAdvance()
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Avancar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Deal Drawer Component
interface DealDrawerProps {
  deal: CRMDeal | null
  statuses: ClickUpStatus[]
  onClose: () => void
  onStatusChange: (newStatus: string) => void
  isUpdating: boolean
}

function DealDrawer({ deal, statuses, onClose, onStatusChange, isUpdating }: DealDrawerProps) {
  const { comments, loading: commentsLoading, postComment } = useDealComments(deal?.id || null)
  const [newComment, setNewComment] = useState("")
  const [postingComment, setPostingComment] = useState(false)

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    setPostingComment(true)
    try {
      await postComment(newComment)
      setNewComment("")
    } finally {
      setPostingComment(false)
    }
  }

  if (!deal) return null

  return (
    <Sheet open={Boolean(deal)} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:w-[540px] bg-background border-border overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-foreground font-display text-xl">
            {deal.empresa || deal.name}
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Status Selector */}
          <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase tracking-wider">Status</label>
            <Select 
              value={deal.status.status} 
              onValueChange={onStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="bg-card border-border">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: deal.status.color }}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.status}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      {status.status}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Information */}
          <div className="space-y-3">
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Informacoes
            </h3>
            <div className="grid gap-3 bg-card p-4 rounded-lg border border-border">
              {deal.contato && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Contato</span>
                  <span className="text-sm text-foreground">{deal.contato}</span>
                </div>
              )}
              {deal.email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Email</span>
                  <a href={`mailto:${deal.email}`} className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                    {deal.email}
                    <Mail className="w-3 h-3" />
                  </a>
                </div>
              )}
              {deal.telefone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">WhatsApp</span>
                  <a href={`https://wa.me/${deal.telefone.replace(/\D/g, '')}`} target="_blank" className="text-sm text-green-500 hover:underline flex items-center gap-1">
                    {deal.telefone}
                    <Phone className="w-3 h-3" />
                  </a>
                </div>
              )}
              {deal.origem && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Origem</span>
                  <span className="text-sm text-foreground">{deal.origem}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-3">
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              Financeiro
            </h3>
            <div className="grid gap-3 bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Valor</span>
                <span className="text-lg font-mono text-orange-500 font-bold">
                  {formatMRR(deal.valor)}
                </span>
              </div>
              {deal.tipo && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Tipo</span>
                  <span className="text-sm text-foreground">{deal.tipo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Datas
            </h3>
            <div className="grid gap-3 bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Criado</span>
                <span className="text-sm text-foreground">{formatDate(deal.dateCreated)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Atualizado</span>
                <span className="text-sm text-foreground">{formatRelativeDate(deal.dateUpdated)}</span>
              </div>
              {deal.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Prazo</span>
                  <span className="text-sm text-foreground">{formatDate(deal.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignees */}
          {deal.assignees.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Responsavel
              </h3>
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={deal.assignees[0].profilePicture || undefined} />
                  <AvatarFallback style={{ backgroundColor: deal.assignees[0].color }}>
                    {deal.assignees[0].initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm text-foreground font-medium">{deal.assignees[0].username}</div>
                  <div className="text-xs text-neutral-500">Comercial</div>
                </div>
              </div>
            </div>
          )}

          {/* Next Action */}
          {deal.proximaAcao && (
            <div className="space-y-3">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                Proxima Acao
              </h3>
              <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                <p className="text-sm text-orange-400">"{deal.proximaAcao}"</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Comentarios
            </h3>
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">Nenhum comentario ainda</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="border-l-2 border-orange-500/30 pl-3 py-1">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                        <span className="text-orange-500 font-medium">{comment.user.username}</span>
                        <span>·</span>
                        <span>{new Date(parseInt(comment.date)).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-xs text-foreground mt-1">{comment.comment_text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Comment */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <Input
                  placeholder="Adicionar comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-background border-border text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <Button 
                  size="sm"
                  onClick={handlePostComment}
                  disabled={postingComment || !newComment.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {postingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              className="flex-1 border-border hover:border-orange-500"
              onClick={() => window.open(deal.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir no ClickUp
            </Button>
            <Button 
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                const currentIndex = statuses.findIndex(s => s.status === deal.status.status)
                if (currentIndex < statuses.length - 1) {
                  onStatusChange(statuses[currentIndex + 1].status)
                }
              }}
              disabled={isUpdating || statuses.findIndex(s => s.status === deal.status.status) >= statuses.length - 1}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2" />
              )}
              AVANCAR
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
