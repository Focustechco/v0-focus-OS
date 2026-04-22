
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

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  let currentY = 8;

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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLACK);
  doc.text("FOCUS OS", 36, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Sistema de Gestão de projetos", 36, 20);

  const dateStr = new Intl.DateTimeFormat('pt-BR').format(new Date());
  doc.text(dateStr, PAGE_WIDTH - MARGIN, 15, { align: "right" });

  currentY = 28;
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);

  currentY = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BLACK);
  doc.text("RELATÓRIO DE PROGRESSO", MARGIN, currentY);

  currentY = 47;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  const tituloProjeto = `${dados.projeto || ""} — Status atual`;
  doc.text(tituloProjeto, MARGIN, currentY);

  currentY = 53;
  const preparado = `Preparado por: ${dados.preparadoPor || ""}`;
  doc.text(preparado, MARGIN, currentY);

  currentY = 57;
  let currentX = MARGIN;

  const drawBadge = (texto: string, bgHex: string, textHex: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const textWidth = doc.getTextWidth(texto);
    const boxW = textWidth + 6;
    const boxH = 5;

    doc.setFillColor(...hexToRgb(bgHex));
    doc.roundedRect(currentX, currentY - 3.5, boxW, boxH, 1, 1, "F");

    doc.setTextColor(...hexToRgb(textHex));
    doc.text(texto, currentX + 3, currentY);

    currentX += boxW + 4;
  };

  if (dados.sprint) drawBadge(dados.sprint, "#E6E6E6", "#787878");
  if (dados.periodo) drawBadge(dados.periodo, "#E6E6E6", "#787878");

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

  currentY = 70;
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > PAGE_HEIGHT - 25) {
      doc.addPage();
      currentY = 20;
    }
  };

  const drawSectionTitle = (title: string, y: number) => {
    doc.setFillColor(...ORANGE);
    doc.rect(MARGIN, y - 4, 1, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);
    doc.text(title, MARGIN + 4, y);
    return y + 6;
  };

  currentY = 80;
  currentY = drawSectionTitle("1. RESUMO EXECUTIVO", currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);

  const resumoLines = doc.splitTextToSize(dados.resumo || "", CONTENT_WIDTH);
  doc.text(resumoLines, MARGIN, currentY);
  currentY += (resumoLines.length * 4.5) + 12;

  checkPageBreak(35);
  currentY = drawSectionTitle("2. STATUS ATUAL", currentY);

  const cardGap = 3;
  const numCards = 4;
  const cardWidth = (CONTENT_WIDTH - (cardGap * (numCards - 1))) / numCards;
  const cardHeight = 16;

  const progressoStr = (dados.progresso !== undefined ? dados.progresso : 0) + "%";
  const numFeitas = dados.entregas?.feitas ?? 0;
  const numTotal = dados.entregas?.total ?? 0;
  const entregasStr = `${numFeitas}/${numTotal}`;
  const alertasStr = dados.alertas || "0 alto, 0 médio";

  const cardsData = [
    { label: "PROGRESSO GERAL", val: progressoStr },
    { label: "ENTREGAS",        val: entregasStr },
    { label: "STATUS",          val: dados.status || "—" },
    { label: "ALERTAS",         val: alertasStr }
  ];

  let cx = MARGIN;
  cardsData.forEach((c) => {
    doc.setFillColor(...hexToRgb("#F8F8F8"));
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, currentY, cardWidth, cardHeight, 1.5, 1.5, "F");
    doc.line(cx + 1.5, currentY, cx + cardWidth - 1.5, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(c.label, cx + 3, currentY + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BLACK);
    doc.text(c.val, cx + 3, currentY + 13);

    cx += cardWidth + cardGap;
  });

  currentY += cardHeight + 6;

  const pbHeight = 6;
  doc.setFillColor(...hexToRgb("#E6E6E6"));
  doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, pbHeight, 3, 3, "F");

  let p = dados.progresso;
  if (p > 100) p = 100;
  if (p < 0) p = 0;
  const fillWidth = (p / 100) * CONTENT_WIDTH;

  if (fillWidth > 0) {
    doc.setFillColor(...ORANGE);
    if (fillWidth < 6) {
      doc.roundedRect(MARGIN, currentY, fillWidth, pbHeight, 0, 0, "F");
    } else {
      doc.roundedRect(MARGIN, currentY, fillWidth, pbHeight, 3, 3, "F");
    }
  }

  currentY += pbHeight + 12;

  checkPageBreak(30);
  currentY = drawSectionTitle("3. PRÓXIMOS MARCOS", currentY);

  if (dados.marcos && dados.marcos.length > 0) {
    dados.marcos.forEach(m => {
      const lines = doc.splitTextToSize(m, CONTENT_WIDTH - 12);
      const h = (lines.length * 4.5) + 4;
      checkPageBreak(h + 4);

      doc.setDrawColor(...hexToRgb("#E6E6E6"));
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, h, 2, 2, "FD");

      doc.setFillColor(...ORANGE);
      doc.circle(MARGIN + 5, currentY + (h / 2), 1.5, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BLACK);
      doc.text(lines, MARGIN + 10, currentY + 5.5);

      currentY += h + 3;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text("Nenhum próximo marco listado.", MARGIN, currentY);
    currentY += 8;
  }

  currentY += 6;

  const obsLines = doc.splitTextToSize(dados.observacoes || "", CONTENT_WIDTH - 6);
  const obsH = (obsLines.length * 4.5) + 6;
  checkPageBreak(obsH + 20);
  currentY = drawSectionTitle("4. OBSERVAÇÕES", currentY);

  doc.setFillColor(...hexToRgb("#FFF9F2"));
  doc.rect(MARGIN, currentY, CONTENT_WIDTH, obsH, "F");

  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, currentY, MARGIN, currentY + obsH);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(obsLines, MARGIN + 3, currentY + 6);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = 282;
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, footerY, PAGE_WIDTH - MARGIN, footerY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Focus Tecnologia — focustecnologia.com.br", MARGIN, footerY + 5);

    const now = new Date();
    const dateTimeStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
    doc.text(`Gerado em: ${dateTimeStr}`, PAGE_WIDTH - MARGIN, footerY + 5, { align: "right" });
  }

  const projFileName = (dados.projeto || "Projeto").replace(/[^a-z0-9]/gi, '_');
  const perFileName = (dados.periodo || "Periodo").replace(/[^a-z0-9]/gi, '_');
  const fileName = `Relatorio_${projFileName}_${perFileName}.pdf`;

  doc.save(fileName);
}
