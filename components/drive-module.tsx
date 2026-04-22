"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Folder, FileText, FileImage, FileCode, FileSpreadsheet, 
  Upload, Search, LayoutGrid, LayoutList, Download, 
  File as FileGeneric, HardDrive, RefreshCw, FolderPlus
} from "lucide-react"

type DriveFile = {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  webViewLink?: string
}

type UploadProgress = {
  fileName: string
  progress: number
}

export function DriveModule() {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([{ id: "", name: "Documentos" }])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [search, setSearch] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id

  useEffect(() => {
    fetchFiles(currentFolderId)
  }, [currentFolderId])

  const fetchFiles = async (folderId: string) => {
    setFilesLoading(true)
    try {
      const res = await fetch(`/api/storage/files?folderId=${encodeURIComponent(folderId)}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files)
        setSelectedFiles(new Set())
      }
    } catch (e) {
      console.error(e)
    }
    setFilesLoading(false)
  }

  const handleNavigate = (folderId: string, folderName: string) => {
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }])
  }

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1))
  }

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedFiles)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedFiles(newSet)
  }

  const getFileIcon = (mimeType: string) => {
    if (!mimeType) return <FileGeneric className="w-5 h-5 text-neutral-400" />
    if (mimeType.includes("folder")) return <Folder className="w-5 h-5 text-[#FF6B00]" />
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />
    if (mimeType.includes("document") || mimeType.includes("word")) return <FileText className="w-5 h-5 text-blue-500" />
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-purple-500" />
    if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("code")) return <FileCode className="w-5 h-5 text-yellow-500" />
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <FileText className="w-5 h-5 text-orange-400" />
    return <FileGeneric className="w-5 h-5 text-neutral-400" />
  }

  const formatSize = (bytes?: string) => {
    if (!bytes) return "--"
    const b = parseInt(bytes)
    if (b === 0) return "--"
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
    return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHrs = diffMs / (1000 * 60 * 60)
    
    if (diffHrs < 24) {
      return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    }
    if (diffHrs < 48) {
      return `Ontem, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleUpload = (file: File) => {
    setUploadProgress({ fileName: file.name, progress: 0 })
    
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/storage/upload", true)
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress({ fileName: file.name, progress: (e.loaded / e.total) * 100 })
      }
    }
    
    xhr.onload = () => {
      setUploadProgress(null)
      if (xhr.status === 201) {
        fetchFiles(currentFolderId)
      } else {
        console.error("Upload falhou")
      }
    }
    
    xhr.onerror = () => {
      setUploadProgress(null)
    }
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folderId", currentFolderId)
    xhr.send(formData)
  }

  const handleCreateFolder = async () => {
    const folderName = prompt("Nome da nova pasta:")
    if (!folderName) return

    // Supabase needs a dummy file to keep the folder
    const file = new File([""], ".emptyFolderPlaceholder", { type: "text/plain" })
    const formData = new FormData()
    formData.append("file", file)
    const newPath = currentFolderId ? `${currentFolderId}/${folderName}` : folderName
    formData.append("folderId", newPath)

    try {
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData
      })
      if (res.ok) fetchFiles(currentFolderId)
    } catch (e) {
      console.error("Erro ao criar pasta:", e)
    }
  }

  const handleDownload = async (fileId: string, mimeType: string) => {
    if (mimeType.includes("folder")) return
    try {
      const res = await fetch(`/api/storage/download?fileId=${encodeURIComponent(fileId)}`)
      if (res.ok) {
        const data = await res.json()
        window.open(data.downloadUrl, "_blank")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div 
      className={`flex flex-col h-full bg-[#080808] font-mono text-sm transition-all ${isDragging ? "ring-2 ring-[#FF6B00] ring-inset" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center">
              {idx > 0 && <span className="text-neutral-600 mx-1">/</span>}
              <button 
                onClick={() => handleBreadcrumbClick(idx)}
                className={`hover:text-[#FF6B00] transition-colors ${idx === breadcrumbs.length - 1 ? "text-[#FF6B00] font-bold" : "text-neutral-400"}`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input 
              type="text" 
              placeholder="Buscar arquivos..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#111] border border-neutral-800 text-neutral-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6B00]/50 w-56 placeholder:text-neutral-600"
            />
          </div>
          
          <div className="flex bg-[#111] border border-neutral-800 rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-[#FF6B00]/20 text-[#FF6B00]" : "text-neutral-600 hover:text-neutral-400"}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-[#FF6B00]/20 text-[#FF6B00]" : "text-neutral-600 hover:text-neutral-400"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={handleCreateFolder}
            className="bg-[#111] border border-neutral-800 text-neutral-300 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:border-[#FF6B00]/50 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#FF6B00]" /> Nova Pasta
          </button>

          <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#FF6B00] text-black font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-[#ff8533] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> UPLOAD
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone Banner */}
      {!isDragging && files.length > 0 && (
        <div className="px-4 py-2 border-b border-neutral-800/50 text-center">
          <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
            Arraste arquivos aqui · ou clique em Upload
          </span>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="px-4 py-2.5 bg-[#0D0800] border-b border-[#FF6B00]/20 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-[#FF6B00] mb-1 font-mono">
              <span>Enviando: {uploadProgress.fileName}</span>
              <span>{Math.round(uploadProgress.progress)}%</span>
            </div>
            <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF6B00] rounded-full transition-all duration-300" style={{ width: `${uploadProgress.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {isDragging && (
          <div className="absolute inset-0 bg-[#FF6B00]/5 border-2 border-dashed border-[#FF6B00]/40 z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-[#080808] border border-[#FF6B00]/30 rounded-xl px-8 py-4">
              <span className="text-[#FF6B00] text-sm font-bold font-mono">SOLTE O ARQUIVO PARA UPLOAD</span>
            </div>
          </div>
        )}

        {filesLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-5 h-5 text-[#FF6B00] animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <Folder className="w-10 h-10 text-neutral-800 mx-auto mb-3" />
            <p className="text-neutral-600 text-xs font-mono">Nenhum arquivo encontrado</p>
            <p className="text-neutral-700 text-[10px] font-mono mt-1">Arraste arquivos ou crie uma pasta</p>
          </div>
        ) : viewMode === "list" ? (
          <table className="w-full text-left">
            <thead className="bg-[#0A0A0A] text-neutral-600 text-[10px] font-mono uppercase tracking-widest sticky top-0 z-[5]">
              <tr className="border-b border-neutral-800">
                <th className="p-3 w-10"></th>
                <th className="p-3">Nome</th>
                <th className="p-3 w-28">Tamanho</th>
                <th className="p-3 w-40">Modificado</th>
                <th className="p-3 w-14 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/30">
              {filteredFiles.map(file => {
                const isFolder = file.mimeType.includes("folder")
                const isSelected = selectedFiles.has(file.id)
                return (
                  <tr key={file.id} className={`group hover:bg-[#0D0D0D] transition-colors ${isSelected ? "bg-[#1A0E00]" : ""}`}>
                    <td className="p-3 text-center">
                      <input 
                        type="checkbox" checked={isSelected} onChange={() => toggleSelection(file.id)}
                        className="w-3.5 h-3.5 accent-[#FF6B00] cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <button 
                        className="flex items-center gap-3 hover:text-[#FF6B00] transition-colors text-left"
                        onClick={() => isFolder ? handleNavigate(file.id, file.name) : handleDownload(file.id, file.mimeType)}
                      >
                        {getFileIcon(file.mimeType)}
                        <span className={`text-neutral-200 truncate max-w-[350px] ${isFolder ? "font-bold" : ""}`}>{file.name}</span>
                        {isFolder && <span className="text-[9px] text-neutral-600 bg-neutral-800/50 px-1.5 py-0.5 rounded">pasta</span>}
                      </button>
                    </td>
                    <td className="p-3 text-neutral-500 text-xs">{formatSize(file.size)}</td>
                    <td className="p-3 text-neutral-500 text-xs">{formatDate(file.modifiedTime)}</td>
                    <td className="p-3 text-center">
                      {!isFolder && (
                        <button 
                          onClick={() => handleDownload(file.id, file.mimeType)}
                          className="text-neutral-700 hover:text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
            {filteredFiles.map(file => {
              const isFolder = file.mimeType.includes("folder")
              const isSelected = selectedFiles.has(file.id)
              return (
                <div 
                  key={file.id}
                  className={`relative group border rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all hover:border-neutral-600
                    ${isSelected ? "border-[#FF6B00]/50 bg-[#1A0E00]" : "border-neutral-800/50 bg-[#0A0A0A] hover:bg-[#0D0D0D]"}
                  `}
                  onClick={() => isFolder ? handleNavigate(file.id, file.name) : handleDownload(file.id, file.mimeType)}
                >
                  <input 
                    type="checkbox" checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); toggleSelection(file.id) }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 left-2 w-3 h-3 accent-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ opacity: isSelected ? 1 : undefined }}
                  />
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-neutral-800/50 flex items-center justify-center">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <span className="text-neutral-300 text-[11px] line-clamp-2 text-center w-full leading-tight">{file.name}</span>
                  {!isFolder && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownload(file.id, file.mimeType) }}
                      className="absolute top-2 right-2 text-neutral-700 hover:text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-600 font-mono flex-shrink-0">
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{filteredFiles.length} itens · Supabase Storage</span>
        </div>
      </div>
    </div>
  )
}
