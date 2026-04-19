import { NextResponse } from "next/server";
import { DriveService } from "@/lib/services/drive.service";

export async function POST(request: Request) {
  try {
    const { relatorioId, driveFolderId, fileName } = await request.json();
    
    // 1. Simular geração de PDF (Em um cenário real, chamaria o ReportGenerator)
    const dummyContent = Buffer.from("Relatório Focus OS - Conteúdo Simulado");
    
    // 2. Upload para o Drive
    const drive = new DriveService();
    const result = await drive.uploadFile(
      driveFolderId, 
      fileName, 
      dummyContent, 
      "application/pdf"
    );

    // 3. Logar atividade (Removido: Modulo Backoffice desativado)

    return NextResponse.json({ success: true, fileId: result.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
