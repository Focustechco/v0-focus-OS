"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { useClientes } from "@/lib/hooks/use-clientes"
import { useProjects } from "@/lib/hooks/use-projetos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, 
  Search, 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink
} from "lucide-react"
import { NovoClienteModal } from "@/components/clientes/novo-cliente-modal"
import { ClienteCard } from "@/components/clientes/cliente-card"
import { ClienteDetalhesDrawer } from "@/components/clientes/cliente-detalhes-drawer"

export default function ClientesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { clientes, isLoading, refetch } = useClientes()
  const { projects } = useProjects()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [novoClienteOpen, setNovoClienteOpen] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)
  const [detalhesOpen, setDetalhesOpen] = useState(false)

  const filteredClientes = clientes.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProjectCount = (clienteId: string) => {
    return projects.filter(p => p.cliente_id === clienteId).length
  }

  const handleOpenDetalhes = (id: string) => {
    setSelectedClienteId(id)
    setDetalhesOpen(true)
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="CLIENTES" />

        <main className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight">Clientes</h1>
              <p className="text-sm text-neutral-500">Gerencie os clientes da Focus Tecnologia</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <Input 
                  placeholder="Buscar clientes..." 
                  className="pl-9 bg-[#141414] border-[#2A2A2A] text-white w-[250px] focus:border-orange-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setNovoClienteOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[200px] bg-[#141414] border border-[#2A2A2A] rounded-xl animate-pulse" />
                ))}
             </div>
          ) : filteredClientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div className="w-16 h-16 bg-[#141414] border border-[#2A2A2A] rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-neutral-700" />
              </div>
              <h3 className="text-white font-medium">Nenhum cliente encontrado</h3>
              <p className="text-neutral-500 text-sm max-w-xs mt-1">
                {searchTerm ? "Tente ajustar os termos da sua busca." : "Comece cadastrando seu primeiro cliente tecnológico."}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setNovoClienteOpen(true)}
                  variant="outline" 
                  className="mt-6 border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
                >
                  Cadastrar Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClientes.map(cliente => (
                <ClienteCard 
                  key={cliente.id} 
                  cliente={cliente} 
                  projectCount={getProjectCount(cliente.id)}
                  onViewDetails={() => handleOpenDetalhes(cliente.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <NovoClienteModal 
        open={novoClienteOpen} 
        onOpenChange={setNovoClienteOpen} 
        onSuccess={refetch}
      />

      <ClienteDetalhesDrawer 
        clienteId={selectedClienteId}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
        onUpdate={refetch}
      />
    </div>
  )
}
