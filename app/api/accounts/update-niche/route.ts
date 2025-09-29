import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import AdAccount from "@/src/models/AdAccount";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { accountId, niche } = await req.json();
    
    if (!accountId || !niche) {
      return NextResponse.json(
        { ok: false, error: "accountId and niche are required" },
        { status: 400 }
      );
    }

    const updatedAccount = await AdAccount.findByIdAndUpdate(
      accountId,
      { niche },
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      account: updatedAccount
    });
  } catch (error) {
    console.error("Update niche error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
