import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { validateClientToken, refreshClientToken } from "@/src/services/metaTokens";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId parameter is required" },
        { status: 400 }
      );
    }
    
    const validation = await validateClientToken(clientId);
    
    return NextResponse.json({
      ok: true,
      valid: validation.valid,
      error: validation.error
    });
    
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { clientId } = await req.json();
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId is required" },
        { status: 400 }
      );
    }
    
    const result = await refreshClientToken(clientId);
    
    return NextResponse.json({
      ok: true,
      ...result
    });
    
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
