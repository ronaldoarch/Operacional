import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import AdAccount from "@/src/models/AdAccount";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { accountId, notes } = await req.json();
    
    if (!accountId) {
      return NextResponse.json(
        { ok: false, error: "accountId is required" },
        { status: 400 }
      );
    }

    const updatedAccount = await AdAccount.findByIdAndUpdate(
      accountId,
      { notes: notes || '' },
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
    console.error("Update notes error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
