
export interface ReportPDFData {
  projeto:       string;
  sprint:        string;
  periodo:       string;
  status:        string;
  progresso:     number;
  entregas:      { feitas: number, total: number };
  resumo:        string;
  preparadoPor:  string;
  marcos:        string[];
  observacoes:   string;
  alertas?:      string;
  sprintAtual?:  number;
  totalSprints?: number;
  riscosAlto?:   number;
  riscosMedio?:  number;
  entregaPrevista?: string;
  atividades?:   { titulo: string; data?: string; status?: string }[];
}

export async function gerarPDF(dados: ReportPDFData) {
  // Importação dinâmica para garantir execução apenas no cliente (browser)
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = 14;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  const ORANGE = [255, 107, 0] as [number, number, number];
  const BLACK = [10, 10, 10] as [number, number, number];
  const GRAY = [120, 120, 120] as [number, number, number];
  const LIGHT_GRAY = [153, 153, 153] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  let currentY = 8;

  // ══════════════════════════════════════════
  // HEADER BRANCO — Logo Focus OS + Subtítulo
  // ══════════════════════════════════════════

  // Tenta carregar o logo; usa fallback visual se falhar
  const logoUrl = "https://drive.google.com/uc?export=download&id=13Rfnef1LKg_6tsazNyJ7d1R8V15RuY6f";
  let logoLoaded = false;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoUrl;
    await new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 3000); // timeout de segurança
    });

    if (img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL("image/png");
      doc.addImage(base64, "PNG", MARGIN, currentY, 18, 18);
      logoLoaded = true;
    }
  } catch {
    // silencia erro de CORS/rede
  }

  if (!logoLoaded) {
    doc.setFillColor(...ORANGE);
    doc.circle(23, 17, 8, "F");
    doc.setFillColor(255, 255, 255);
    doc.circle(23, 17, 5, "F");
    doc.setFillColor(...ORANGE);
    doc.circle(23, 17, 2.5, "F");
  }

  // Focus Os name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BLACK);
  doc.text("Focus Os", 36, 15);

  // Orange subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ORANGE);
  doc.text("Sistema de Gestão de Projetos", 36, 20);

  // Date on the right
  const dateStr = new Intl.DateTimeFormat('pt-BR').format(new Date());
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(dateStr, PAGE_WIDTH - MARGIN, 15, { align: "right" });

  // ══════════════════════════════════════════
  // BARRA DE ACENTO LARANJA
  // ══════════════════════════════════════════
  currentY = 28;
  doc.setFillColor(...ORANGE);
  doc.rect(MARGIN, currentY, CONTENT_WIDTH, 1.2, "F");

  // ══════════════════════════════════════════
  // SEÇÃO DO PROJETO — Nome, badges, status
  // ══════════════════════════════════════════
  currentY = 34;

  // Light gray background for project section
  doc.setFillColor(...hexToRgb("#FAFAFA"));
  doc.rect(MARGIN, currentY - 2, CONTENT_WIDTH, 28, "F");

  // Project name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BLACK);
  doc.text(dados.projeto || "Projeto", MARGIN + 4, currentY + 4);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Status Consolidado", MARGIN + 4, currentY + 10);

  // Badges row
  currentY += 17;
  let badgeX = MARGIN + 4;

  const drawBadge = (texto: string, bgHex: string, textHex: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const textWidth = doc.getTextWidth(texto);
    const boxW = textWidth + 6;
    const boxH = 5;

    doc.setFillColor(...hexToRgb(bgHex));
    doc.roundedRect(badgeX, currentY - 3.5, boxW, boxH, 1, 1, "F");

    doc.setTextColor(...hexToRgb(textHex));
    doc.text(texto, badgeX + 3, currentY);

    badgeX += boxW + 4;
  };

  if (dados.sprint) drawBadge(dados.sprint, "#EEEEEE", "#555555");
  if (dados.periodo) drawBadge(dados.periodo, "#EEEEEE", "#555555");
  if (dados.entregaPrevista) drawBadge(`Entrega: ${dados.entregaPrevista}`, "#EEEEEE", "#555555");

  // Status badge
  if (dados.status) {
    let bg = "#F8F8F8";
    let text = "#787878";
    const statusLower = dados.status.toLowerCase();

    if (statusLower.includes("risco")) {
      bg = "#FFF3CD"; text = "#856404";
    } else if (statusLower.includes("prazo")) {
      bg = "#D1E7DD"; text = "#0F5132";
    } else if (statusLower.includes("atrasado")) {
      bg = "#F8D7DA"; text = "#842029";
    }

    drawBadge(dados.status, bg, text);
  }

  // Thin separator
  currentY += 6;
  doc.setDrawColor(...hexToRgb("#F0F0F0"));
  doc.setLineWidth(0.3);
  doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);

  // ══════════════════════════════════════════
  // 4 CARDS DE MÉTRICAS LADO A LADO
  // ══════════════════════════════════════════
  currentY += 6;

  const cardGap = 3;
  const numCards = 4;
  const cardWidth = (CONTENT_WIDTH - (cardGap * (numCards - 1))) / numCards;
  const cardHeight = 22;

  const progressoStr = (dados.progresso !== undefined ? dados.progresso : 0) + "%";
  const numFeitas = dados.entregas?.feitas ?? 0;
  const numTotal = dados.entregas?.total ?? 0;
  const entregasStr = `${numFeitas}/${numTotal}`;
  const sprintStr = `${dados.sprintAtual ?? 1}`;
  const sprintSub = `de ${dados.totalSprints ?? 1} sprints`;
  const riscosAlto = dados.riscosAlto ?? 0;
  const riscosMedio = dados.riscosMedio ?? 0;
  const riscosStr = `${riscosAlto + riscosMedio}`;
  const riscosSub = `${riscosAlto} alto, ${riscosMedio} médio`;

  const cardsData = [
    { label: "PROGRESSO", val: progressoStr, accent: "#FF6B00", sub: undefined, hasBar: true },
    { label: "ENTREGAS", val: entregasStr, accent: "#22C55E", sub: "concluídas", hasBar: false },
    { label: "SPRINT ATUAL", val: sprintStr, accent: "#3B82F6", sub: sprintSub, hasBar: false },
    { label: "RISCOS", val: riscosStr, accent: "#EF4444", sub: riscosSub, hasBar: false },
  ];

  let cx = MARGIN;
  cardsData.forEach((c) => {
    // Card background
    doc.setFillColor(...hexToRgb("#FAFAFA"));
    doc.roundedRect(cx, currentY, cardWidth, cardHeight, 1.5, 1.5, "F");

    // Top accent line
    doc.setFillColor(...hexToRgb(c.accent));
    doc.rect(cx, currentY, cardWidth, 1.2, "F");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text(c.label, cx + 3, currentY + 6);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...BLACK);
    doc.text(c.val, cx + 3, currentY + 14);

    // Sub text
    if (c.sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...LIGHT_GRAY);
      doc.text(c.sub, cx + 3, currentY + 18);
    }

    // Progress bar for progresso card
    if (c.hasBar) {
      const barY = currentY + 18;
      const barW = cardWidth - 6;
      doc.setFillColor(...hexToRgb("#EFEFEF"));
      doc.roundedRect(cx + 3, barY, barW, 2, 1, 1, "F");
      let p = dados.progresso;
      if (p > 100) p = 100;
      if (p < 0) p = 0;
      const fillW = (p / 100) * barW;
      if (fillW > 0) {
        doc.setFillColor(...ORANGE);
        doc.roundedRect(cx + 3, barY, fillW, 2, 1, 1, "F");
      }
    }

    cx += cardWidth + cardGap;
  });

  currentY += cardHeight + 10;

  // Helper functions
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > PAGE_HEIGHT - 30) {
      doc.addPage();
      currentY = 20;
    }
  };

  const drawSectionTitle = (title: string, y: number) => {
    doc.setFillColor(...ORANGE);
    doc.rect(MARGIN, y - 4, 1.5, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BLACK);
    doc.text(title.toUpperCase(), MARGIN + 5, y);
    return y + 8;
  };

  // ══════════════════════════════════════════
  // RESUMO EXECUTIVO — borda esquerda laranja
  // ══════════════════════════════════════════
  checkPageBreak(40);
  currentY = drawSectionTitle("Resumo Executivo", currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb("#333333"));

  const resumoLines = doc.splitTextToSize(dados.resumo || "", CONTENT_WIDTH - 10);
  const resumoH = (resumoLines.length * 4.5) + 8;

  // Orange left border background
  doc.setFillColor(...hexToRgb("#FFFAF5"));
  doc.rect(MARGIN, currentY - 2, CONTENT_WIDTH, resumoH, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(MARGIN, currentY - 2, 1.2, resumoH, "F");

  doc.text(resumoLines, MARGIN + 5, currentY + 4);
  currentY += resumoH + 10;

  // ══════════════════════════════════════════
  // PRÓXIMOS MARCOS
  // ══════════════════════════════════════════
  if (dados.marcos && dados.marcos.length > 0) {
    checkPageBreak(30);
    currentY = drawSectionTitle("Próximos Marcos", currentY);

    dados.marcos.forEach((m, i) => {
      const lines = doc.splitTextToSize(m, CONTENT_WIDTH - 18);
      const h = (lines.length * 4.5) + 6;
      checkPageBreak(h + 4);

      // Row background
      doc.setFillColor(...hexToRgb("#FAFAFA"));
      doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, h, 2, 2, "F");

      // Orange number circle
      doc.setFillColor(...ORANGE);
      doc.circle(MARGIN + 6, currentY + (h / 2), 3.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...WHITE);
      doc.text(`${i + 1}`, MARGIN + 6, currentY + (h / 2) + 1, { align: "center" });

      // Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BLACK);
      doc.text(lines, MARGIN + 14, currentY + 5.5);

      currentY += h + 3;
    });
    currentY += 6;
  }

  // ══════════════════════════════════════════
  // ENTREGAS DO PERÍODO
  // ══════════════════════════════════════════
  if (dados.atividades && dados.atividades.length > 0) {
    checkPageBreak(30);
    currentY = drawSectionTitle("Entregas do Período", currentY);

    dados.atividades.forEach((a, i) => {
      checkPageBreak(10);

      const rowBg = i % 2 === 0 ? "#FAFAFA" : "#FFFFFF";
      doc.setFillColor(...hexToRgb(rowBg));
      doc.rect(MARGIN, currentY - 1, CONTENT_WIDTH, 7, "F");

      if (a.data) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...ORANGE);
        doc.text(a.data, MARGIN + 2, currentY + 3);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb("#333333"));
      doc.text(a.titulo, MARGIN + 18, currentY + 3);

      if (a.status) {
        let sbg = "#F3F4F6"; let stc = "#4B5563";
        if (a.status === "concluida") { sbg = "#DCFCE7"; stc = "#166534"; }
        else if (a.status === "em_andamento") { sbg = "#DBEAFE"; stc = "#1E40AF"; }
        else if (a.status === "bloqueada") { sbg = "#FEE2E2"; stc = "#991B1B"; }

        const statusText = a.status.replace("_", " ").toUpperCase();
        const stW = doc.getTextWidth(statusText) + 4;
        doc.setFillColor(...hexToRgb(sbg));
        doc.roundedRect(PAGE_WIDTH - MARGIN - stW - 2, currentY - 0.5, stW, 4.5, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...hexToRgb(stc));
        doc.text(statusText, PAGE_WIDTH - MARGIN - stW, currentY + 2.5);
      }

      currentY += 7;
    });
    currentY += 6;
  }

  // ══════════════════════════════════════════
  // OBSERVAÇÕES (se tiver)
  // ══════════════════════════════════════════
  if (dados.observacoes) {
    const obsLines = doc.splitTextToSize(dados.observacoes, CONTENT_WIDTH - 10);
    const obsH = (obsLines.length * 4.5) + 8;
    checkPageBreak(obsH + 20);
    currentY = drawSectionTitle("Observações", currentY);

    doc.setFillColor(...hexToRgb("#FFFAF5"));
    doc.rect(MARGIN, currentY - 2, CONTENT_WIDTH, obsH, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(MARGIN, currentY - 2, 1.2, obsH, "F");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(obsLines, MARGIN + 5, currentY + 4);
  }

  // ══════════════════════════════════════════
  // RODAPÉ BRANCO — Marca + Paginação laranja
  // ══════════════════════════════════════════
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = 282;

    // Orange top line
    doc.setFillColor(...ORANGE);
    doc.rect(MARGIN, footerY, CONTENT_WIDTH, 0.8, "F");

    // Left: brand
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text("Focus Tecnologia — focustecnologia.com.br", MARGIN, footerY + 5);

    // Right: page number in orange
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ORANGE);
    doc.text(`Página ${i}`, PAGE_WIDTH - MARGIN, footerY + 5, { align: "right" });
  }

  const projFileName = (dados.projeto || "Projeto").replace(/[^a-z0-9]/gi, '_');
  const perFileName = (dados.periodo || "Periodo").replace(/[^a-z0-9]/gi, '_');
  const fileName = `Relatorio_${projFileName}_${perFileName}.pdf`;

  doc.save(fileName);
}
