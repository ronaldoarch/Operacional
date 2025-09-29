import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { ingestEvent, processWebhookEvent } from "@/src/services/events";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const payload = await req.json();
    
    // Validar payload obrigatório
    if (!payload.clientId || !payload.type) {
      return NextResponse.json(
        { ok: false, error: "clientId and type are required" },
        { status: 400 }
      );
    }
    
    let result;
    
    // Se vier de webhook externo, usar processWebhookEvent
    if (payload.source && payload.source !== "manual") {
      result = await processWebhookEvent(payload);
    } else {
      // Ingestão manual direta
      const event = await ingestEvent({
        clientId: payload.clientId,
        adAccountId: payload.adAccountId || null,
        type: payload.type,
        amount: payload.amount ?? null,
        qty: payload.qty ?? 1,
        meta: payload.meta || {},
        happenedAt: payload.happenedAt ? new Date(payload.happenedAt) : new Date(),
        source: payload.source || "manual"
      });
      
      result = { success: true, eventId: event._id };
    }
    
    if (result.success) {
      return NextResponse.json({ 
        ok: true, 
        eventId: result.eventId,
        message: "Event ingested successfully"
      });
    } else {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Event ingest error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId parameter is required" },
        { status: 400 }
      );
    }
    
    const { getEventsByClient } = await import("@/src/services/events");
    const events = await getEventsByClient(clientId, type || undefined, limit);
    
    return NextResponse.json({
      ok: true,
      events,
      count: events.length
    });
    
  } catch (error) {
    console.error("Events get error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
