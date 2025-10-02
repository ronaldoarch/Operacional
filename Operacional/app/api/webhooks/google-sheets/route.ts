import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Verificar se é um webhook válido da Google Sheets
    const signature = req.headers.get('x-goog-channel-token');
    const channelId = req.headers.get('x-goog-channel-id');
    
    // Em produção, você validaria a assinatura aqui
    console.log("📨 Webhook recebido da Google Sheets:", { signature, channelId });
    
    // Executar sincronização
    const syncResponse = await fetch(`${req.nextUrl.origin}/api/clients/sync-sheet`);
    const syncData = await syncResponse.json();
    
    if (!syncData.ok) {
      throw new Error(syncData.error || "Erro na sincronização");
    }
    
    console.log("✅ Sincronização via webhook concluída:", syncData.summary);
    
    return NextResponse.json({
      ok: true,
      message: "Webhook processado com sucesso",
      summary: syncData.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Webhook sync error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Para webhooks GET (verificação)
export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    message: "Google Sheets webhook endpoint ativo",
    timestamp: new Date().toISOString()
  });
}

