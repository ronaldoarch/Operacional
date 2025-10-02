import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { saveClientToken } from "@/src/services/metaTokens";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { clientId, accessToken, metaAppId, metaAppSecret } = await req.json();
    
    if (!clientId || !accessToken) {
      return NextResponse.json(
        { ok: false, error: "clientId and accessToken are required" },
        { status: 400 }
      );
    }
    
    console.log("Saving token for clientId:", clientId);
    
    const client = await saveClientToken(clientId, accessToken, metaAppId, metaAppSecret);
    
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Failed to save client" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      ok: true, 
      message: "Meta token saved successfully",
      clientId: client._id,
      clientName: client.name
    });
    
  } catch (error) {
    console.error("Meta connect error:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
