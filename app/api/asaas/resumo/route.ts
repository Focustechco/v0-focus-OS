import { NextResponse } from "next/server";
import asaasApi from "@/lib/asaas";

export const dynamic = "force-dynamic";

// Resumo financeiro: busca saldo + estatísticas de cobranças
export async function GET() {
  try {
    // Buscar saldo da conta
    const [balanceRes, pendingRes, overdueRes, receivedRes] = await Promise.allSettled([
      asaasApi.get("/finance/balance"),
      asaasApi.get("/payments", { params: { status: "PENDING", limit: 1 } }),
      asaasApi.get("/payments", { params: { status: "OVERDUE", limit: 1 } }),
      asaasApi.get("/payments", { params: { status: "RECEIVED", limit: 1 } }),
    ]);

    const balance = balanceRes.status === "fulfilled" ? balanceRes.value.data : null;
    const pending = pendingRes.status === "fulfilled" ? pendingRes.value.data : null;
    const overdue = overdueRes.status === "fulfilled" ? overdueRes.value.data : null;
    const received = receivedRes.status === "fulfilled" ? receivedRes.value.data : null;

    return NextResponse.json({
      saldo: balance?.balance ?? 0,
      saldoPrevisto: (balance?.balance ?? 0) + (pending?.totalValue ?? 0),
      totalPendente: pending?.totalValue ?? 0,
      qtdPendente: pending?.totalCount ?? 0,
      totalRecebido: received?.totalValue ?? 0,
      qtdRecebido: received?.totalCount ?? 0,
      totalVencido: overdue?.totalValue ?? 0,
      qtdVencido: overdue?.totalCount ?? 0,
      inadimplencia: received?.totalCount 
        ? ((overdue?.totalCount ?? 0) / ((received?.totalCount ?? 0) + (overdue?.totalCount ?? 0)) * 100).toFixed(1)
        : "0.0",
    });
  } catch (error: any) {
    console.error("Erro ao buscar resumo financeiro:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Erro ao buscar resumo", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}
