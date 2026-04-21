"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/reports/toast-notification"
import { Upload, FileIcon, X, CheckCircle2, FileText, Loader2 } from "lucide-react"

interface ContratoTabProps {
  projectId: string
}

export function ContratoTab({ projectId }: ContratoTabProps) {
  const [files, setFiles] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [projectId])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/projetos/${projectId}/documentos`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data)
      }
    } catch (error) {
      console.error("Failed to fetch documents", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    const validFiles = selectedFiles.filter(file => {
      if (file.type !== 'application/pdf') {
        showToast("error", `O arquivo ${file.name} não é um PDF válido.`)
        return false
      }
      if (file.size > 20 * 1024 * 1024) {
        showToast("error", `O arquivo ${file.name} excede o limite de 20MB.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const formData = new FormData()
    validFiles.forEach(file => {
      formData.append("file", file)
    })

    try {
      setIsUploading(true)
      const res = await fetch(`/api/projetos/${projectId}/documentos`, {
        method: "POST",
        body: formData
      })
      
      if (!res.ok) throw new Error("Upload failed")
        
      showToast("success", "Documento(s) anexado(s) com sucesso!")
      fetchDocuments()
      
    } catch (error) {
      showToast("error", "Erro ao fazer upload dos documentos.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (fileName: string) => {
    try {
      setFiles(prev => prev.filter(f => f.name !== fileName)) // optimistic UI
      const res = await fetch(`/api/projetos/${projectId}/documentos/${encodeURIComponent(fileName)}`, {
        method: "DELETE"
      })
      
      if (!res.ok) throw new Error("Delete failed")
      showToast("success", "Documento removido.")
    } catch (error) {
      showToast("error", "Erro ao remover o documento.")
      fetchDocuments() // revert optimistic
    }
  }

  return (
    <div className="space-y-4">
      {/* Zona de Upload */}
      <div 
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${isUploading ? 'border-orange-500/50 bg-orange-500/5' : 'border-border bg-card hover:border-orange-500 hover:bg-accent/10'}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="application/pdf"
          multiple 
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-orange-500 mb-3 animate-spin" />
            <p className="text-sm font-medium text-orange-500">Fazendo upload...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] group-hover:bg-orange-500/10 flex items-center justify-center transition-colors mb-3">
              <Upload className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Clique para fazer upload</p>
            <p className="text-xs text-neutral-500">Apenas PDF · Máx. 20 MB</p>
          </>
        )}
      </div>

      {/* Lista de Arquivos */}
      <div className="space-y-3 mt-6">
        <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest px-1">Documentos vinculados</h4>
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="p-6 border border-dashed border-border rounded-xl text-center flex flex-col items-center bg-card">
            <FileText className="w-6 h-6 text-neutral-600 mb-2 opacity-50" />
            <p className="text-xs text-neutral-500">Nenhum documento encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {files.map((file: any) => (
              <div 
                key={file.name} 
                className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-border rounded-lg group hover:border-[#3A3A3A] transition-colors"
              >
                <div 
                  className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center shrink-0">
                    <FileIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-orange-400 transition-colors">
                      {file.name.replace(/^\d+-/, '')} {/* remove o timestamp do nome se quiser, ou deixa original */}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] uppercase h-5 font-bold tracking-widest hidden sm:flex">
                    OK
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    onClick={() => handleDelete(file.name)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
