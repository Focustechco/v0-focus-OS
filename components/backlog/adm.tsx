"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FileSpreadsheet,
  ExternalLink,
  Download,
  FileText,
  GripVertical,
  Clock,
} from "lucide-react"

const sheets = [
  { name: "Fluxo de Caixa", url: "#", updatedAt: "2 horas atras", recent: true },
  { name: "Controle de Horas", url: "#", updatedAt: "5 horas atras", recent: true },
  { name: "OKRs Q1 2026", url: "#", updatedAt: "1 dia atras", recent: false },
  { name: "Budget 2026", url: "#", updatedAt: "2 dias atras", recent: false },
  { name: "Payroll", url: "#", updatedAt: "3 dias atras", recent: false },
  { name: "Inventario TI", url: "#", updatedAt: "1 semana atras", recent: false },
  { name: "KPIs Mensais", url: "#", updatedAt: "1 semana atras", recent: false },
  { name: "Relatorio Fiscal", url: "#", updatedAt: "2 semanas atras", recent: false },
]

const kanbanTasks = {
  "A FAZER": [
    { title: "Revisar contratos Q2", assignee: "CS", dueDate: "30/03", priority: "alta", tag: "JURIDICO" },
    { title: "Organizar arquivo morto", assignee: "ML", dueDate: "05/04", priority: "baixa", tag: "ADM" },
    { title: "Cotacao fornecedores", assignee: "PR", dueDate: "02/04", priority: "media", tag: "COMPRAS" },
  ],
  "EM ANDAMENTO": [
    { title: "Fechamento fiscal marco", assignee: "JA", dueDate: "31/03", priority: "alta", tag: "FISCAL" },
    { title: "Atualizacao cadastros", assignee: "CS", dueDate: "28/03", priority: "media", tag: "ADM" },
  ],
  "CONCLUIDO": [
    { title: "Pagamento fornecedores", assignee: "ML", dueDate: "25/03", priority: "alta", tag: "FINANCEIRO" },
    { title: "Backup mensal", assignee: "TI", dueDate: "26/03", priority: "baixa", tag: "TI" },
  ],
}

const documents = [
  { name: "Manual de Processos v2.pdf", type: "PDF", size: "2.4 MB", uploadedBy: "Carlos S.", date: "25/03/2026" },
  { name: "Politica de Seguranca.docx", type: "DOCX", size: "890 KB", uploadedBy: "Ana M.", date: "22/03/2026" },
  { name: "Organograma_2026.xlsx", type: "XLSX", size: "156 KB", uploadedBy: "Pedro L.", date: "20/03/2026" },
  { name: "Contrato_Modelo.pdf", type: "PDF", size: "1.2 MB", uploadedBy: "Julia A.", date: "18/03/2026" },
  { name: "Checklist_Onboarding.pdf", type: "PDF", size: "450 KB", uploadedBy: "Mariana C.", date: "15/03/2026" },
]

const priorityColors: Record<string, string> = {
  alta: "bg-red-500",
  media: "bg-yellow-500",
  baixa: "bg-neutral-500",
}

const columnColors: Record<string, string> = {
  "A FAZER": "border-neutral-500",
  "EM ANDAMENTO": "border-orange-500",
  "CONCLUIDO": "border-green-500",
}

export function Adm() {
  return (
    <div className="space-y-6">
      {/* Quick Links Section */}
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-4 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Links Rapidos — Planilhas & Ferramentas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sheets.map((sheet) => (
            <Card
              key={sheet.name}
              className="bg-[#141414] border-[#2a2a2a] hover:border-orange-500/30 transition-all group cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                  </div>
                  {sheet.recent && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                  )}
                </div>
                <h3 className="text-white font-medium text-sm mb-1">{sheet.name}</h3>
                <p className="text-neutral-600 text-xs font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {sheet.updatedAt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 bg-transparent text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 font-mono text-xs tracking-widest uppercase"
                >
                  Abrir
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Kanban Section */}
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-4 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Tarefas Administrativas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries(kanbanTasks).map(([column, tasks]) => (
            <Card key={column} className={`bg-[#141414] border-[#2a2a2a] border-t-2 ${columnColors[column]}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center justify-between">
                  {column}
                  <Badge variant="secondary" className="bg-[#1a1a1a] text-neutral-400 text-[10px]">
                    {tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a] hover:border-orange-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium mb-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-orange-500/20 text-orange-500 text-[9px]">
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-neutral-500 text-xs font-mono">{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                            <Badge className="bg-[#222] text-neutral-400 text-[9px] font-mono">
                              {task.tag}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-4 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Documentos Internos
        </h2>
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Nome</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Tipo</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Tamanho</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Enviado Por</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Data</th>
                    <th className="text-right p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-l-2 hover:border-l-orange-500 transition-all"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span className="text-white text-sm">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-[#1a1a1a] text-neutral-400 text-[10px] font-mono">
                          {doc.type}
                        </Badge>
                      </td>
                      <td className="p-4 text-neutral-400 font-mono text-sm">{doc.size}</td>
                      <td className="p-4 text-neutral-300 text-sm">{doc.uploadedBy}</td>
                      <td className="p-4 text-neutral-400 font-mono text-sm">{doc.date}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-orange-500 hover:bg-orange-500/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
