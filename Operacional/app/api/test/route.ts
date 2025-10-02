import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({ 
      ok: true, 
      message: "Database connected successfully",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Database connection failed" },
      { status: 500 }
    );
  }
}
