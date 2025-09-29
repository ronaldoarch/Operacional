import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";
import { ObjectId } from "@/src/lib/db";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { clientId, status, comment, updatedBy } = await req.json();
    
    if (!clientId || !status) {
      return NextResponse.json(
        { ok: false, error: "clientId and status are required" },
        { status: 400 }
      );
    }

    // Resolver clientId (pode ser string simples ou ObjectId)
    let client;
    const isValidObjectId = ObjectId.isValid(clientId) && /^[0-9a-fA-F]{24}$/.test(clientId);
    
    if (isValidObjectId) {
      client = await Client.findById(clientId);
    } else {
      client = await Client.findOne({ name: `Cliente ${clientId}` });
    }

    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Adicionar comentário de status
    const statusComment = {
      status,
      comment: comment || '',
      createdAt: new Date(),
      updatedBy: updatedBy || 'Sistema'
    };

    // Atualizar cliente
    const updatedClient = await Client.findByIdAndUpdate(
      client._id,
      { 
        status,
        $push: { statusComments: statusComment }
      },
      { new: true }
    );

    return NextResponse.json({
      ok: true,
      client: updatedClient
    });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
