"use client"

import { useState, useRef, useEffect } from "react"
import { X, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClientLogoPopoverProps {
  logo: string | null
  onSave: (logo: string | null) => void
  onClose: () => void
}

export function ClientLogoPopover({ logo, onSave, onClose }: ClientLogoPopoverProps) {
  const [previewLogo, setPreviewLogo] = useState<string | null>(logo)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml|webp)$/)) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewLogo(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-2 z-50 bg-[#1e1e1e] border border-[#333] rounded-[10px] p-4 shadow-xl w-[200px]"
      style={{ transition: "all 0.15s ease" }}
    >
      <p className="text-xs font-medium text-white mb-3">Logo do Cliente</p>
      
      {previewLogo ? (
        <div className="relative w-[120px] h-[80px] mx-auto mb-3 bg-white rounded-lg overflow-hidden">
          <img
            src={previewLogo}
            alt="Logo preview"
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => setPreviewLogo(null)}
            className="absolute top-1 right-1 w-5 h-5 bg-[#1e1e1e] rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-[120px] h-[80px] mx-auto mb-3 rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center transition-all duration-150
            ${isDragging ? "border-[#ff6b00] bg-[#ff6b00]/10" : "border-[#ff6b00]/50 hover:border-[#ff6b00]"}
          `}
        >
          <Building2 className="w-5 h-5 text-[#666] mb-1" />
          <span className="text-[10px] text-[#666]">Arraste ou clique</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,.webp"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-1 h-7 text-xs text-neutral-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            onSave(previewLogo)
            onClose()
          }}
          className="flex-1 h-7 text-xs bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white"
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
