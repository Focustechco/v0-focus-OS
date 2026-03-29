"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  formatCurrency, 
  formatDate,
  type CRMDeal 
} from "@/lib/crm-field-mapper"
import {
  Activity,
  ArrowRight,
  MessageSquare,
  Plus,
  DollarSign,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FolderPlus,
  Filter
} from "lucide-react"
import Link from "next/link"

interface AtividadeFeedProps {
  deals: CRMDeal[]
}

type ActivityType = 'all' | 'status_change' | 'created' | 'closed' | 'comment'

interface ActivityItem {
  id: string
  type: 'status_change' | 'created' | 'closed' | 'comment' | 'value_change'
  date: Date
  dealId: string
  dealName: string
  dealUrl: string
  actor: {
    username: string
    color: string
    initials: string
    profilePicture: string | null
  } | null
  details: {
    from?: string
    to?: string
    value?: number
    text?: string
    isClosed?: boolean
  }
}

export function AtividadeFeed({ deals }: AtividadeFeedProps) {
  const [filterType, setFilterType] = useState<ActivityType>('all')

  // Generate activity items from deals
  // In a real app, this would come from ClickUp activity/audit log
  const activities = useMemo(() => {
    const items: ActivityItem[] = []

    deals.forEach(deal => {
      // Created event
      items.push({
        id: `${deal.id}-created`,
        type: 'created',
        date: deal.dateCreated,
        dealId: deal.id,
        dealName: deal.empresa || deal.name,
        dealUrl: deal.url,
        actor: deal.assignees[0] || null,
        details: {}
      })

      // Closed event (if applicable)
      if (deal.dateClosed && 
          (deal.status.status.toLowerCase() === 'fechado' || 
           deal.status.status.toLowerCase() === 'perdido')) {
        items.push({
          id: `${deal.id}-closed`,
          type: 'closed',
          date: deal.dateClosed,
          dealId: deal.id,
          dealName: deal.empresa || deal.name,
          dealUrl: deal.url,
          actor: deal.assignees[0] || null,
          details: {
            isClosed: deal.status.status.toLowerCase() === 'fechado',
            value: deal.valor || undefined
          }
        })
      }

      // Simulate status change based on update date
      if (deal.dateUpdated > deal.dateCreated && !deal.dateClosed) {
        items.push({
          id: `${deal.id}-update`,
          type: 'status_change',
          date: deal.dateUpdated,
          dealId: deal.id,
          dealName: deal.empresa || deal.name,
          dealUrl: deal.url,
          actor: deal.assignees[0] || null,
          details: {
            to: deal.status.status
          }
        })
      }
    })

    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [deals])

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities
    if (filterType === 'closed') return activities.filter(a => a.type === 'closed')
    if (filterType === 'created') return activities.filter(a => a.type === 'created')
    if (filterType === 'status_change') return activities.filter(a => a.type === 'status_change')
    return activities
  }, [activities, filterType])

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups = new Map<string, ActivityItem[]>()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    filteredActivities.forEach(activity => {
      let groupKey: string
      
      if (activity.date.toDateString() === today.toDateString()) {
        groupKey = 'HOJE'
      } else if (activity.date.toDateString() === yesterday.toDateString()) {
        groupKey = 'ONTEM'
      } else {
        groupKey = formatDate(activity.date)
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(activity)
    })

    return groups
  }, [filteredActivities])

  // Get icon for activity type
  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'closed':
        return activity.details.isClosed 
          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
          : <XCircle className="w-4 h-4 text-red-500" />
      case 'status_change':
        return <ArrowRight className="w-4 h-4 text-orange-500" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'value_change':
        return <DollarSign className="w-4 h-4 text-orange-500" />
      default:
        return <Activity className="w-4 h-4 text-neutral-500" />
    }
  }

  // Get activity description
  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'created':
        return (
          <span>
            criou novo deal: <span className="text-white font-medium">{activity.dealName}</span>
            {' '}<Badge variant="outline" className="text-[9px] bg-green-500/10 border-green-500/30 text-green-500">LEAD</Badge>
          </span>
        )
      case 'closed':
        return activity.details.isClosed ? (
          <span>
            <span className="text-green-500 font-bold">FECHOU</span> deal: {' '}
            <span className="text-white font-medium">{activity.dealName}</span>
            {activity.details.value && (
              <span className="text-orange-500 font-mono ml-2">{formatCurrency(activity.details.value)}/mes</span>
            )}
          </span>
        ) : (
          <span>
            <span className="text-red-500 font-bold">PERDEU</span> deal: {' '}
            <span className="text-white font-medium">{activity.dealName}</span>
          </span>
        )
      case 'status_change':
        return (
          <span>
            moveu <span className="text-white font-medium">{activity.dealName}</span>
            {' '}<ArrowRight className="w-3 h-3 inline" />{' '}
            <Badge variant="outline" className="text-[9px] bg-orange-500/10 border-orange-500/30 text-orange-500">
              {activity.details.to}
            </Badge>
          </span>
        )
      case 'comment':
        return (
          <span>
            adicionou comentario em <span className="text-white font-medium">{activity.dealName}</span>:
            <span className="text-neutral-400 block mt-1">"{activity.details.text}"</span>
          </span>
        )
      case 'value_change':
        return (
          <span>
            atualizou valor de <span className="text-white font-medium">{activity.dealName}</span>:
            <span className="text-orange-500 font-mono ml-2">{formatCurrency(activity.details.value!)}</span>
          </span>
        )
      default:
        return <span>atualizou {activity.dealName}</span>
    }
  }

  return (
    <Card className="bg-[#141414] border-[#2A2A2A]">
      <CardHeader className="pb-3 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            ATIVIDADE DO CRM
          </CardTitle>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as ActivityType)}>
            <SelectTrigger className="w-40 bg-[#0A0A0A] border-[#2A2A2A] h-8">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#2A2A2A]">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="status_change">Mudancas de Status</SelectItem>
              <SelectItem value="created">Novos Deals</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groupedActivities.entries()).map(([dateGroup, activities]) => (
              <div key={dateGroup}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-[#2A2A2A]" />
                  <span className="text-[10px] text-neutral-500 font-mono tracking-wider">{dateGroup}</span>
                  <div className="h-px flex-1 bg-[#2A2A2A]" />
                </div>

                {/* Activity Items */}
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex gap-3 p-3 rounded-lg hover:bg-[#1A1A1A] transition-colors group"
                    >
                      {/* Time */}
                      <div className="w-12 flex-shrink-0">
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {activity.date.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-neutral-400">
                          {activity.actor && (
                            <span className="text-orange-500 font-medium mr-1">
                              [{activity.actor.username}]
                            </span>
                          )}
                          {getActivityDescription(activity)}
                        </div>

                        {/* Special actions for closed deals */}
                        {activity.type === 'closed' && activity.details.isClosed && (
                          <Link href="/projetos/novo" className="inline-block mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] border-green-500/30 text-green-500 hover:bg-green-500/10"
                            >
                              <FolderPlus className="w-3 h-3 mr-1" />
                              Criar Projeto no OS
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-neutral-500 hover:text-white"
                          onClick={() => window.open(activity.dealUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
