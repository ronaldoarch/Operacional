import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { aggregateMetrics, createNicheConfig } from "@/src/services/metrics";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const niche = url.searchParams.get("niche") || "generic";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const accountIds = url.searchParams.get("accountIds");
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId parameter is required" },
        { status: 400 }
      );
    }
    
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    // Se accountIds for fornecido, usar apenas essas contas
    const selectedAccountIds = accountIds ? accountIds.split(',') : undefined;
    
    const result = await aggregateMetrics(clientId, niche, start, end, selectedAccountIds);
    
    return NextResponse.json({
      ok: true,
      clientId,
      niche,
      selectedAccounts: selectedAccountIds,
      period: {
        start: start?.toISOString(),
        end: end?.toISOString()
      },
      ...result
    });
    
  } catch (error) {
    console.error("Metrics aggregate error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { clientId, niche, metrics, settings } = await req.json();
    
    if (!clientId || !niche) {
      return NextResponse.json(
        { ok: false, error: "clientId and niche are required" },
        { status: 400 }
      );
    }
    
    const config = await createNicheConfig(clientId, niche, metrics || [], settings);
    
    return NextResponse.json({
      ok: true,
      config,
      message: "Niche configuration saved successfully"
    });
    
  } catch (error) {
    console.error("Metrics config error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
