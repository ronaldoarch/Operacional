import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";

export async function GET() {
  try {
    await connectDB();
    
    const clients = await Client.find({});
    
    return NextResponse.json({
      ok: true,
      clients: clients.map(client => client.toObject())
    });
    
  } catch (error) {
    console.error("Clients API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
