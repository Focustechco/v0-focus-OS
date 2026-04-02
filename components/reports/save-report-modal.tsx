"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SaveReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportName: string
  onSave: (data: SaveData) => void
}

interface SaveData {
  fileName: string
  version: string
  notes: string
  visibility: "private" | "team" | "client"
}

export function SaveReportModal({ open, onOpenChange, reportName, onSave }: SaveReportModalProps) {
  const [fileName, setFileName] = useState(reportName)
  const [version, setVersion] = useState("v1.0")
  const [notes, setNotes] = useState("")
  const [visibility, setVisibility] = useState<"private" | "team" | "client">("private")

  if (!open) return null

  const handleSave = () => {
    onSave({ fileName, version, notes, visibility })
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-[440px] mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white">Salvar Relatorio</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-neutral-500 font-mono tracking-wider block mb-2">
              NOME DO ARQUIVO
            </label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500 font-mono tracking-wider block mb-2">
              VERSAO
            </label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white w-24"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500 font-mono tracking-wider block mb-2">
              DESCRICAO / NOTAS INTERNAS
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observacoes internas..."
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-neutral-600 min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-500 font-mono tracking-wider block mb-2">
              VISIBILIDADE
            </label>
            <div className="flex gap-2">
              {(["private", "team", "client"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150
                    ${visibility === v 
                      ? "bg-[#ff6b00] text-white" 
                      : "bg-[#1a1a1a] text-neutral-400 border border-[#2a2a2a] hover:border-[#ff6b00]/50"
                    }
                  `}
                >
                  {v === "private" ? "Privado" : v === "team" ? "Equipe" : "Compartilhado com cliente"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-neutral-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
