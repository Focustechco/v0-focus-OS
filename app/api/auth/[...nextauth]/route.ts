// Este arquivo não é mais necessário - autenticação Google Drive feita diretamente
// Mantido vazio para evitar conflitos de rota
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Use /api/drive/auth para autenticação Google Drive" })
}

export async function POST() {
  return NextResponse.json({ message: "Use /api/drive/auth para autenticação Google Drive" })
}
