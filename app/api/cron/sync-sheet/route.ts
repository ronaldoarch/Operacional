import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    console.log("🔄 Executando sincronização automática via cron...");
    
    // Chamar a API de sincronização
    const syncResponse = await fetch(`${req.nextUrl.origin}/api/clients/sync-sheet`);
    const syncData = await syncResponse.json();
    
    if (!syncData.ok) {
      throw new Error(syncData.error || "Erro na sincronização");
    }
    
    console.log("✅ Sincronização automática concluída:", syncData.summary);
    
    return NextResponse.json({
      ok: true,
      message: "Sincronização automática executada com sucesso",
      summary: syncData.summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Endpoint para ser chamado por serviços externos (Vercel Cron, etc.)
export async function POST(req: NextRequest) {
  return GET(req);
}
