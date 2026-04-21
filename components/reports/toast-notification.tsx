"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { X, Check, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, action?: { label: string; onClick: () => void }) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, action?: { label: string; onClick: () => void }) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, type, message, action }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const borderColor = {
    success: "#22c55e",
    error: "#ef4444",
    info: "#ff6b00",
  }[toast.type]

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: Info,
  }[toast.type]

  return (
    <div
      className={`
        min-w-[280px] bg-[#1e1e1e] rounded-[10px] p-[14px_16px] shadow-lg
        flex items-center gap-3 transition-all duration-300
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
      `}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: borderColor }} />
      <span className="text-sm text-foreground flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="text-sm text-[#ff6b00] hover:underline"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={handleClose}
        className="text-neutral-500 hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
