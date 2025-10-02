import { NextResponse } from "next/server";

/**
 * Health check endpoint simples para Railway/VPS
 * Não depende de conexão com banco de dados
 */
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Traffic Ops API",
    version: "1.0.0"
  });
}
