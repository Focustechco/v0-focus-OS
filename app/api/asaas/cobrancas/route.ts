import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const customer = searchParams.get("customer");

  try {
    const response = await asaasApi.get("/payments", {
      params: {
        status,
        customer,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar cobranças Asaas:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao buscar cobranças", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await asaasApi.post("/payments", body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar cobrança Asaas:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao criar cobrança", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
