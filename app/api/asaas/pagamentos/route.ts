import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Filtrar por cobranças recebidas (RECEIVED ou CONFIRMED)
    const response = await asaasApi.get("/payments", {
      params: {
        status: "RECEIVED", // ou utilizar múltiplos status se a API permitir no filtro
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos recebidos", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
