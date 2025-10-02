import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { runBalanceAndBlockAlerts } from "@/src/lib/alerts";
import { runAutomatedChecks } from "@/src/services/automation";

export async function POST() {
  try {
    await connectDB();
    
    const result = await runBalanceAndBlockAlerts();
    
    return NextResponse.json({
      ok: true,
      alertsCount: result.count,
      alerts: result.alerts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Alerts run error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Executar verificações automatizadas completas
    const result = await runAutomatedChecks();
    
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Automated checks error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
