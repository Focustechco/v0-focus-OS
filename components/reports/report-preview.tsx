"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, FileDown, Printer } from "lucide-react"

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
    incluirLogoFocus?: boolean
    incluirLogoCliente?: boolean
    logoClienteFile?: string | null
  }
  onClose: () => void
}

const SAUDE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  verde:    { label: "NO PRAZO",  color: "#0F5132", bg: "#D1E7DD" },
  amarelo:  { label: "EM RISCO",  color: "#856404", bg: "#FFF3CD" },
  vermelho: { label: "ATRASADO",  color: "#842029", bg: "#F8D7DA" },
}

export function ReportPreview({ report, editorData, onClose }: PreviewProps) {
  const docRef = useRef<HTMLDivElement>(null)
  const proj = report?.projetos
  const [isExporting, setIsExporting] = useState(false)

  const dateAll = new Date().toLocaleDateString("pt-BR")
  const saude = SAUDE_MAP[editorData.statusSaude] ?? SAUDE_MAP.amarelo

  // Compute metrics
  const progresso = editorData.statusProgresso ?? 0
  const totalTarefas = editorData.sprintGrupos.reduce((acc: number, g: any) => acc + (g.tarefas?.length || 0), 0)
  const tarefasConcluidas = editorData.sprintGrupos.reduce((acc: number, g: any) => {
    return acc + (g.tarefas?.filter((t: any) => t.status === "concluida")?.length || 0)
  }, 0)
  const sprintAtual = editorData.sprintGrupos.length > 0
    ? editorData.sprintGrupos[editorData.sprintGrupos.length - 1]?.sprint || `Sprint ${editorData.sprintGrupos.length}`
    : "Sprint 1"
  const totalSprints = editorData.sprintGrupos.length || 1

  // Risk count
  const tarefasBloqueadas = editorData.sprintGrupos.reduce((acc: number, g: any) => {
    return acc + (g.tarefas?.filter((t: any) => t.status === "bloqueada")?.length || 0)
  }, 0)
  const riscoAlto = tarefasBloqueadas
  const riscoMedio = editorData.statusSaude === "amarelo" ? 1 : 0

  async function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    if (!docRef.current) return
    setIsExporting(true)

    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      const element = docRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const canvasRatio   = canvas.height / canvas.width
      const imgHeightOnA4 = pageWidth * canvasRatio

      let yOffset = 0
      let remainingHeight = imgHeightOnA4

      while (remainingHeight > 0) {
        const sliceCanvas = document.createElement("canvas")
        const dpr = 2
        const slicePx = Math.min(pageHeight * (canvas.width / pageWidth), canvas.height - yOffset * dpr)

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

        yOffset         += pageHeight * (canvas.width / pageWidth) / dpr
        remainingHeight -= pageHeight
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

          {/* ══════════════════════════════════════════════ */}
          {/* HEADER BRANCO — Logo Focus OS + Subtítulo      */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 48px 16px 48px",
            backgroundColor: "#ffffff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.svg" alt="Focus OS" style={{ width: 38, height: 38 }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.06em", color: "#1a1a1a", margin: 0, lineHeight: 1.2 }}>
                  Focus Os
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#FF6B00", margin: 0, lineHeight: 1.4 }}>
                  Sistema de Gestão de Projetos
                </p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
              {dateAll}
            </p>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* BARRA DE ACENTO LARANJA                        */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{ height: 3, backgroundColor: "#FF6B00" }} />

          {/* ══════════════════════════════════════════════ */}
          {/* SEÇÃO DO PROJETO — Nome, badges, status        */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{ padding: "28px 48px 20px 48px", backgroundColor: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
              {proj?.nome ?? "Projeto"}
            </h1>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 14px 0" }}>
              {proj?.codigo ?? report?.titulo ?? "Relatório de Progresso"} — Status Consolidado
            </p>

            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Sprint badge */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: "#F0F0F0",
                color: "#555",
              }}>
                🏃 {sprintAtual}
              </span>

              {/* Date badge */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: "#F0F0F0",
                color: "#555",
              }}>
                📅 {dateAll}
              </span>

              {/* Delivery date badge */}
              {editorData.statusEntrega && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: "#F0F0F0",
                  color: "#555",
                }}>
                  🎯 Entrega: {new Date(editorData.statusEntrega).toLocaleDateString("pt-BR")}
                </span>
              )}

              {/* Status badge */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: saude.bg,
                color: saude.color,
              }}>
                ● {saude.label}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* 4 CARDS DE MÉTRICAS LADO A LADO                */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{ padding: "24px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {/* Card: Progresso */}
            <MetricCard
              label="Progresso"
              value={`${progresso}%`}
              accent="#FF6B00"
              extra={
                <div style={{ marginTop: 6, height: 5, backgroundColor: "#EFEFEF", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${progresso}%`, height: "100%", backgroundColor: "#FF6B00", borderRadius: 3 }} />
                </div>
              }
            />
            {/* Card: Entregas */}
            <MetricCard
              label="Entregas"
              value={`${tarefasConcluidas}/${totalTarefas}`}
              accent="#22C55E"
              sub="concluídas"
            />
            {/* Card: Sprint */}
            <MetricCard
              label="Sprint Atual"
              value={`${editorData.sprintGrupos.length > 0 ? editorData.sprintGrupos.length : 1}`}
              accent="#3B82F6"
              sub={`de ${totalSprints} sprints`}
            />
            {/* Card: Riscos */}
            <MetricCard
              label="Riscos"
              value={`${riscoAlto + riscoMedio}`}
              accent="#EF4444"
              sub={`${riscoAlto} alto, ${riscoMedio} médio`}
            />
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* SEÇÕES DE CONTEÚDO                              */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{ padding: "0 48px 32px 48px" }}>

            {/* ── RESUMO EXECUTIVO ──────────────────────── */}
            <SectionBlock title="Resumo Executivo">
              <div style={{
                borderLeft: "3px solid #FF6B00",
                paddingLeft: 16,
                backgroundColor: "#FFFAF5",
                padding: "14px 16px 14px 16px",
                borderRadius: "0 6px 6px 0",
              }}>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: "#333", margin: 0 }}>
                  {editorData.resumoTexto}
                </p>
                {editorData.resumoTags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {editorData.resumoTags.map((tag) => (
                      <span key={tag} style={{
                        padding: "2px 8px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 100,
                        fontSize: 10,
                        color: "#666",
                        backgroundColor: "#fff",
                      }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </SectionBlock>

            {/* ── PRÓXIMOS MARCOS ───────────────────────── */}
            {editorData.proximosPassos.length > 0 && (
              <SectionBlock title="Próximos Marcos">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {editorData.proximosPassos.map((t, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      backgroundColor: "#FAFAFA",
                      borderRadius: 6,
                      border: "1px solid #F0F0F0",
                    }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: "#FF6B00",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{t.titulo}</p>
                        {(t.responsavel || t.prazo) && (
                          <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0 0" }}>
                            {t.responsavel && <span>Responsável: {t.responsavel}</span>}
                            {t.responsavel && t.prazo && <span> · </span>}
                            {t.prazo && <span>Prazo: {new Date(t.prazo).toLocaleDateString("pt-BR")}</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            )}

            {/* ── ENTREGAS DO PERÍODO ──────────────────── */}
            {editorData.sprintGrupos.length > 0 && (
              <SectionBlock title="Entregas do Período">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {editorData.sprintGrupos.map((grupo: any, i: number) => (
                    <div key={i}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}>
                        <div style={{
                          width: 4,
                          height: 18,
                          borderRadius: 2,
                          backgroundColor: "#FF6B00",
                        }} />
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", margin: 0 }}>
                          {grupo.sprint}
                        </h4>
                      </div>
                      <div style={{
                        border: "1px solid #F0F0F0",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}>
                        {grupo.tarefas.map((t: any, j: number) => {
                          const statusColors: Record<string, { bg: string; text: string }> = {
                            concluida: { bg: "#DCFCE7", text: "#166534" },
                            em_andamento: { bg: "#DBEAFE", text: "#1E40AF" },
                            bloqueada: { bg: "#FEE2E2", text: "#991B1B" },
                          }
                          const sc = statusColors[t.status] ?? { bg: "#F3F4F6", text: "#4B5563" }

                          return (
                            <div key={j} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "8px 14px",
                              backgroundColor: j % 2 === 0 ? "#FAFAFA" : "#fff",
                              borderBottom: j < grupo.tarefas.length - 1 ? "1px solid #F0F0F0" : "none",
                            }}>
                              {t.data && (
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#FF6B00",
                                  width: 42,
                                  flexShrink: 0,
                                }}>
                                  {new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                                </span>
                              )}
                              <span style={{ flex: 1, fontSize: 12, color: "#333" }}>{t.titulo}</span>
                              {t.status && (
                                <span style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  textTransform: "uppercase",
                                  backgroundColor: sc.bg,
                                  color: sc.text,
                                  letterSpacing: "0.03em",
                                }}>
                                  {t.status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            )}

            {/* ── OBSERVAÇÕES (se tiver) ───────────────── */}
            {editorData.observacoes && (
              <SectionBlock title="Observações">
                <div style={{
                  borderLeft: "3px solid #FF6B00",
                  paddingLeft: 16,
                  backgroundColor: "#FFFAF5",
                  padding: "14px 16px",
                  borderRadius: "0 6px 6px 0",
                }}>
                  <p style={{ fontSize: 12, lineHeight: 1.75, color: "#555", margin: 0, fontStyle: "italic" }}>
                    {editorData.observacoes}
                  </p>
                </div>
              </SectionBlock>
            )}
          </div>

          {/* ══════════════════════════════════════════════ */}
          {/* RODAPÉ BRANCO — Marca + Paginação laranja       */}
          {/* ══════════════════════════════════════════════ */}
          <div style={{
            borderTop: "2px solid #FF6B00",
            margin: "0 48px",
            padding: "16px 0 28px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <img src="/logo.svg" alt="Focus OS" style={{ width: 16, height: 16, opacity: 0.6 }} />
              <span style={{ fontSize: 10, color: "#999", fontWeight: 500 }}>
                Focus Tecnologia — focustecnologia.com.br
              </span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6B00" }}>
              Página 1
            </span>
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

/* ─── Metric Card ─────────────────────────────────── */
function MetricCard({
  label,
  value,
  accent,
  sub,
  extra,
}: {
  label: string
  value: string
  accent: string
  sub?: string
  extra?: React.ReactNode
}) {
  return (
    <div style={{
      border: "1px solid #F0F0F0",
      borderRadius: 8,
      padding: "14px 14px 12px 14px",
      borderTop: `3px solid ${accent}`,
      backgroundColor: "#FAFAFA",
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 10, color: "#999", margin: "4px 0 0 0" }}>{sub}</p>
      )}
      {extra}
    </div>
  )
}

/* ─── Section Block with orange left marker ─────── */
function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 20, backgroundColor: "#FF6B00", borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: "#1a1a1a", textTransform: "uppercase", margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
