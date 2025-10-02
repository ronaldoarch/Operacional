import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import AdAccount from "@/src/models/AdAccount";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { accountId, title, description, priority } = await req.json();
    
    if (!accountId || !title) {
      return NextResponse.json(
        { ok: false, error: "accountId and title are required" },
        { status: 400 }
      );
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description: description || '',
      status: 'pending' as const,
      priority: priority || 'medium' as const,
      createdAt: new Date().toISOString()
    };

    const updatedAccount = await AdAccount.findByIdAndUpdate(
      accountId,
      { $push: { tasks: newTask } },
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
      task: newTask,
      account: updatedAccount
    });
  } catch (error) {
    console.error("Add task error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
