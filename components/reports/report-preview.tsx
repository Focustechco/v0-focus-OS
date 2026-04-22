"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Printer, FileDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface PreviewProps {
  report: any
  editorData: {
    resumoTexto: string
    resumoTags: string[]
    statusEtapa: string
    statusProgresso: number
    statusSaude: string
    statusEntrega: string
    sprintGrupos: any[]
    proximosPassos: any[]
    observacoes: string
  }
  onClose: () => void
}

const SAUDE_MAP: Record<string, { label: string; color: string }> = {
  verde:   { label: "No prazo", color: "#22c55e" },
  amarelo: { label: "Em risco", color: "#eab308" },
  vermelho:{ label: "Atrasado", color: "#ef4444" },
}

export function ReportPreview({ report, editorData, onClose }: PreviewProps) {
  const docRef = useRef<HTMLDivElement>(null)
  const proj = report?.projetos
  const conteudo = report?.conteudo ?? report?.conteudo_json ?? {}
  const cfg = conteudo.configuracao ?? {}

  const finalIncluirLogoFocus = editorData?.incluirLogoFocus ?? cfg.incluirLogoFocus ?? true
  const finalIncluirLogoCliente = editorData?.incluirLogoCliente ?? cfg.incluirLogoCliente ?? false
  const finalLogoClienteFile = editorData?.logoClienteFile ?? cfg.logoClienteFile ?? null

  const dateS = report?.periodo_inicio
    ? new Date(report.periodo_inicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : "—"
  const dateE = report?.periodo_fim
    ? new Date(report.periodo_fim).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    : "—"
  const dateAll = new Date().toLocaleDateString("pt-BR")

  const saude = SAUDE_MAP[editorData.statusSaude] ?? SAUDE_MAP.amarelo

  const [isExporting, setIsExporting] = useState(false)

  async function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    if (!docRef.current) return
    setIsExporting(true)

    try {
      // Importações dinâmicas via npm — sem dependência de CDN
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      const element = docRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.98)

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Calcula altura proporcional ao canvas para multi-página
      const canvasRatio   = canvas.height / canvas.width
      const imgHeightOnA4 = pageWidth * canvasRatio

      let yOffset = 0
      let remainingHeight = imgHeightOnA4

      while (remainingHeight > 0) {
        // slice de canvas equivalente a 1 página
        const sliceCanvas   = document.createElement("canvas")
        const dpr           = 2 // deve bater com scale do html2canvas
        const slicePx       = Math.min(pageHeight * (canvas.width / pageWidth), canvas.height - yOffset * dpr)

        sliceCanvas.width  = canvas.width
        sliceCanvas.height = Math.ceil(slicePx)

        sliceCanvas.getContext("2d")?.drawImage(
          canvas,
          0, yOffset * dpr,
          canvas.width, sliceCanvas.height,
          0, 0,
          canvas.width, sliceCanvas.height
        )

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98)
        const sliceH    = (sliceCanvas.height / canvas.width) * pageWidth

        if (yOffset > 0) pdf.addPage()
        pdf.addImage(sliceData, "JPEG", 0, 0, pageWidth, sliceH)

        yOffset          += pageHeight * (canvas.width / pageWidth) / dpr
        remainingHeight  -= pageHeight
      }

      pdf.save(`relatorio-${proj?.nome || "focustec"}-${dateAll.replace(/\//g, "-")}.pdf`)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      window.print()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1A1A1A] border-b border-border flex-shrink-0">
        <h3 className="text-sm font-mono font-bold text-foreground tracking-wider">PREVIEW DO RELATÓRIO</h3>
        <div className="flex items-center gap-2">
          {/* Download button for mobile/ios */}
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isExporting}
            className="bg-orange-500 hover:bg-orange-600 text-foreground gap-2 text-xs h-8 sm:flex"
          >
            {isExporting ? (
              <span className="animate-pulse">GERANDO...</span>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" /> 
                <span className="hidden sm:inline">BAIXAR PDF</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="border-border hover:bg-[#2A2A2A] text-foreground gap-2 text-xs h-8 hidden sm:flex"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral-400 hover:text-foreground h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document area */}
      <div className="flex-1 overflow-y-auto bg-neutral-200 flex items-start justify-center py-8 px-4">
        <div
          ref={docRef}
          data-preview-doc
          className="bg-white w-full max-w-[760px] min-h-[1000px] shadow-2xl print:shadow-none"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", color: "#1a1a1a" }}
        >
          {/* ── Document Header ───────────────────────── */}
          <div className="flex items-start justify-between px-12 pt-10 pb-6">
            {/* Logo Focus */}
            {finalIncluirLogoFocus ? (
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="Focus OS" style={{ width: 36, height: 36 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#1a1a1a" }}>FOCUS OS</p>
                  <p style={{ fontSize: 10, color: "#888" }}>Sistema de Gestão</p>
                </div>
              </div>
            ) : <div />}
            <p style={{ fontSize: 11, color: "#666" }}>Data: {dateAll}</p>
          </div>

          {/* ── Title block ───────────────────────────── */}
          <div className="px-12 pb-4">
            {finalIncluirLogoCliente && finalLogoClienteFile && (
              <img 
                src={finalLogoClienteFile} 
                alt="Logo Cliente" 
                style={{ maxHeight: 48, objectFit: "contain", marginBottom: 20 }} 
              />
            )}
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.02em", color: "#1a1a1a", marginBottom: 4 }}>
              RELATÓRIO DE PROGRESSO
            </h1>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
              {proj?.nome ?? "Projeto"} – Status Consolidado
            </p>
            {cfg.preparadoPor && (
              <p style={{ fontSize: 12, color: "#888" }}>Preparado por: {cfg.preparadoPor}</p>
            )}
            {/* Orange divider */}
            <div style={{ height: 2, backgroundColor: "#FF6B00", marginTop: 16, borderRadius: 1 }} />
          </div>

          {/* ── Sections ──────────────────────────────── */}
          <div className="px-12 pb-12 space-y-8 mt-2">

            {/* 1. Resumo Executivo */}
            <PreviewSection number={1} title="RESUMO EXECUTIVO">
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "#333" }}>{editorData.resumoTexto}</p>
              {editorData.resumoTags.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  {editorData.resumoTags.map((tag) => (
                    <span key={tag} style={{
                      padding: "2px 10px", border: "1px solid #ddd",
                      borderRadius: 100, fontSize: 11, color: "#555"
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </PreviewSection>

            {/* 2. Status Atual */}
            <PreviewSection number={2} title="STATUS ATUAL">
              <div style={{
                border: "1px solid #eee", borderRadius: 8, overflow: "hidden"
              }}>
                {[
                  {
                    label: "Etapa:", value: (
                      <span style={{ color: "#FF6B00", fontWeight: 700, fontSize: 12 }}>
                        {editorData.statusEtapa?.charAt(0).toUpperCase()}{editorData.statusEtapa?.slice(1)}
                      </span>
                    )
                  },
                  {
                    label: "Progresso:", value: (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div style={{ flex: 1, height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${editorData.statusProgresso}%`, height: "100%", backgroundColor: "#FF6B00", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", minWidth: 32 }}>
                          {editorData.statusProgresso}%
                        </span>
                      </div>
                    )
                  },
                  {
                    label: "Status:", value: (
                      <span style={{ color: saude.color, fontWeight: 600, fontSize: 12 }}>
                        ● {saude.label}
                      </span>
                    )
                  },
                ].map(({ label, value }, i) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "10px 16px",
                    backgroundColor: i % 2 === 0 ? "#fafafa" : "white",
                    borderBottom: i < 2 ? "1px solid #eee" : "none"
                  }}>
                    <span style={{ fontSize: 12, color: "#666", width: 100, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>{value}</div>
                  </div>
                ))}
              </div>
            </PreviewSection>

            {/* 3. Atividades do Período */}
            {editorData.sprintGrupos.length > 0 && (
              <PreviewSection number={3} title="SPRINTS & ATIVIDADES">
                <div className="space-y-6">
                  {editorData.sprintGrupos.map((grupo: any, i: number) => (
                    <div key={i}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", marginBottom: 6 }}>{grupo.sprint}</h4>
                      <div className="space-y-1">
                        {grupo.tarefas.map((t: any, j: number) => (
                          <div key={j} style={{ display: "flex", gap: 16, padding: "5px 0", borderBottom: "1px solid #f0f0f0", alignItems: "baseline" }}>
                            {t.data && (
                              <span style={{ fontSize: 11, color: "#FF6B00", fontWeight: 700, width: 42, flexShrink: 0 }}>
                                {new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </span>
                            )}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 13, color: "#333" }}>{t.titulo}</span>
                              {t.status && (
                                <span style={{
                                  fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase",
                                  backgroundColor: t.status === "concluida" ? "#dcfce7" : t.status === "em_andamento" ? "#dbeafe" : t.status === "bloqueada" ? "#fee2e2" : "#f3f4f6",
                                  color: t.status === "concluida" ? "#166534" : t.status === "em_andamento" ? "#1e40af" : t.status === "bloqueada" ? "#991b1b" : "#4b5563"
                                }}>
                                  {t.status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}

            {/* 4. Próximos Passos */}
            {editorData.proximosPassos.length > 0 && (
              <PreviewSection number={4} title="PRÓXIMOS PASSOS">
                <div className="space-y-1.5">
                  {editorData.proximosPassos.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ fontSize: 13, color: "#FF6B00", fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{t.titulo}</span>
                      {t.responsavel && (
                        <span style={{ fontSize: 11, color: "#FF6B00", flexShrink: 0 }}>– {t.responsavel}</span>
                      )}
                      {t.prazo && (
                        <span style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>
                          até {new Date(t.prazo).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}
          </div>

          {/* ── Footer ───────────────────────────────── */}
          <div style={{ borderTop: "1px solid #eee", margin: "0 48px", paddingTop: 16, paddingBottom: 32 }}>
            <p style={{ textAlign: "center", fontSize: 10, color: "#bbb" }}>
              Gerado por Focus OS · {dateAll}
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-preview-doc], [data-preview-doc] * { visibility: visible; }
          [data-preview-doc] { position: fixed; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}

function PreviewSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 3, height: 20, backgroundColor: "#FF6B00", borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", color: "#FF6B00" }}>
          {number}. {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
