import { NextResponse } from "next/server";
import createAsaasClient from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const cpfCnpj = searchParams.get("cpfCnpj");

  try {
    const asaasApi = createAsaasClient();
    const response = await asaasApi.get("/customers", {
      params: {
        ...(name ? { name } : {}),
        ...(cpfCnpj ? { cpfCnpj } : {}),
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar clientes Asaas:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao buscar clientes", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const asaasApi = createAsaasClient();
    const response = await asaasApi.post("/customers", body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar cliente Asaas:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao criar cliente", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
