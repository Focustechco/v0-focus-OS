import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function SprintCard({ sprint, onView }: { sprint: any, onView?: () => void }) {
  // Cálculo temporário de dias restantes
  const endDate = new Date(sprint.data_fim)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${sprint.status === "ativa" ? "border-l-4 border-l-orange-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-white font-mono">{sprint.nome?.toUpperCase()}</span>
              <Badge className={sprint.status === "ativa" ? "bg-orange-500" : "bg-neutral-600"}>
                {sprint.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 truncate">{sprint.projetos?.nome || "Projeto"}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-neutral-500">Período</div>
            <div className="text-[10px] sm:text-xs text-neutral-300 font-mono">
              {new Date(sprint.data_inicio).toLocaleDateString("pt-BR")} - {new Date(sprint.data_fim).toLocaleDateString("pt-BR")}
            </div>
            {daysLeft > 0 && sprint.status === "ativa" && (
              <div className={`text-xs font-mono mt-1 ${daysLeft <= 2 ? "text-red-500" : "text-orange-500"}`}>
                {daysLeft} dias restantes
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-neutral-400 border-t border-[#2A2A2A] pt-3 line-clamp-2">
            Objetivo: <span className="text-white">{sprint.objetivo || "N/A"}</span>
          </div>
          {onView && (
            <div className="flex items-center justify-end pt-2">
              <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600 outline-none" onClick={onView}>
                Ver Sprint
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
