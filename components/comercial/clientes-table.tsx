"use client"

import { useState, useMemo } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  formatMRR, 
  formatDate, 
  getDealAlertLevel,
  type CRMDeal 
} from "@/lib/crm-field-mapper"
import {
  Search,
  Download,
  Plus,
  Eye,
  ExternalLink,
  ArrowRight,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from "lucide-react"

interface ClientesTableProps {
  deals: CRMDeal[]
  loading: boolean
}

type SortField = 'empresa' | 'status' | 'valor' | 'assignee' | 'dueDate' | 'dateCreated'
type SortOrder = 'asc' | 'desc'

export function ClientesTable({ deals, loading }: ClientesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>('dateCreated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Get unique statuses and assignees
  const uniqueStatuses = useMemo(() => {
    const statuses = new Map<string, { status: string; color: string }>()
    deals.forEach(deal => {
      if (!statuses.has(deal.status.status)) {
        statuses.set(deal.status.status, {
          status: deal.status.status,
          color: deal.status.color
        })
      }
    })
    return Array.from(statuses.values())
  }, [deals])

  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>()
    deals.forEach(deal => {
      deal.assignees.forEach(a => assignees.add(a.username))
    })
    return Array.from(assignees)
  }, [deals])

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let result = [...deals]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(deal => 
        deal.name.toLowerCase().includes(query) ||
        deal.empresa?.toLowerCase().includes(query) ||
        deal.contato?.toLowerCase().includes(query) ||
        deal.email?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter(deal => deal.status.status === filterStatus)
    }

    // Assignee filter
    if (filterAssignee !== "all") {
      result = result.filter(deal => 
        deal.assignees.some(a => a.username === filterAssignee)
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'empresa':
          comparison = (a.empresa || a.name).localeCompare(b.empresa || b.name)
          break
        case 'status':
          comparison = a.status.orderindex - b.status.orderindex
          break
        case 'valor':
          comparison = (a.valor || 0) - (b.valor || 0)
          break
        case 'assignee':
          const aAssignee = a.assignees[0]?.username || ''
          const bAssignee = b.assignees[0]?.username || ''
          comparison = aAssignee.localeCompare(bAssignee)
          break
        case 'dueDate':
          const aDue = a.dueDate?.getTime() || 0
          const bDue = b.dueDate?.getTime() || 0
          comparison = aDue - bDue
          break
        case 'dateCreated':
          comparison = a.dateCreated.getTime() - b.dateCreated.getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [deals, searchQuery, filterStatus, filterAssignee, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage)
  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredDeals.slice(start, start + itemsPerPage)
  }, [filteredDeals, currentPage])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Export to CSV
  const handleExport = () => {
    const headers = ['ID', 'Empresa', 'Contato', 'Email', 'Telefone', 'Status', 'Valor', 'Responsavel', 'Prazo', 'Tipo']
    const rows = filteredDeals.map(deal => [
      deal.customId || deal.id,
      deal.empresa || deal.name,
      deal.contato || '',
      deal.email || '',
      deal.telefone || '',
      deal.status.status,
      deal.valor?.toString() || '',
      deal.assignees[0]?.username || '',
      deal.dueDate ? formatDate(deal.dueDate) : '',
      deal.tipo || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes-crm-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Loading skeleton
  if (loading && deals.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#1A1A1A]" />
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-14 w-full bg-[#1A1A1A]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Buscar por empresa, contato, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-background border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status.status} value={status.status}>
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

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-40 bg-background border-border">
              <SelectValue placeholder="Responsavel" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos</SelectItem>
              {uniqueAssignees.map(assignee => (
                <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Novo Deal
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-neutral-500 font-mono text-xs hidden md:table-cell">ID</TableHead>
              <TableHead 
                className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-foreground"
                onClick={() => handleSort('empresa')}
              >
                <div className="flex items-center gap-1">
                  EMPRESA
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-neutral-500 font-mono text-xs hidden lg:table-cell">CONTATO</TableHead>
              <TableHead 
                className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-foreground"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  STATUS
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-foreground"
                onClick={() => handleSort('valor')}
              >
                <div className="flex items-center gap-1">
                  VALOR
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-foreground"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center gap-1">
                  RESPONSAVEL
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-neutral-500 font-mono text-xs cursor-pointer hover:text-foreground hidden sm:table-cell"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  PRAZO
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-neutral-500 font-mono text-xs text-right">ACOES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <FolderOpen className="w-8 h-8 mb-2" />
                    <span className="text-sm">Nenhum deal encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDeals.map(deal => {
                const alertLevel = getDealAlertLevel(deal)
                
                return (
                  <TableRow 
                    key={deal.id} 
                    className="border-border hover:bg-accent/10 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-neutral-400 hidden md:table-cell">
                      {deal.customId || `CL-${deal.id.slice(-4).toUpperCase()}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {deal.empresa || deal.name}
                        </span>
                        {deal.tipo && (
                          <Badge variant="outline" className="ml-2 text-[9px] border-neutral-700 text-neutral-400">
                            {deal.tipo}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-400 hidden lg:table-cell">
                      {deal.contato || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="text-[10px] font-mono"
                        style={{ 
                          backgroundColor: `${deal.status.color}15`,
                          borderColor: deal.status.color,
                          color: deal.status.color
                        }}
                      >
                        {deal.status.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${deal.valor ? 'text-orange-500' : 'text-neutral-500'}`}>
                        {formatMRR(deal.valor)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {deal.assignees.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={deal.assignees[0].profilePicture || undefined} />
                            <AvatarFallback 
                              className="text-[9px]"
                              style={{ backgroundColor: deal.assignees[0].color }}
                            >
                              {deal.assignees[0].initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-neutral-400">{deal.assignees[0].username}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`text-sm ${
                        alertLevel === 'deadline' ? 'text-blue-500' : 'text-neutral-400'
                      }`}>
                        {deal.dueDate ? formatDate(deal.dueDate) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-neutral-400 hover:text-foreground"
                          onClick={() => window.open(deal.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {deal.status.status.toLowerCase() !== 'fechado' && 
                         deal.status.status.toLowerCase() !== 'perdido' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                        {deal.status.status.toLowerCase() === 'fechado' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10">
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-neutral-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDeals.length)} de {filteredDeals.length}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-neutral-400">
                {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
