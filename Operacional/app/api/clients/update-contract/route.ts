import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";
import { ObjectId } from "@/src/lib/db";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { clientId, contractValue, responsible, niche, notes } = await req.json();
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId is required" },
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

    // Preparar dados de atualização
    const updateData: any = {};
    if (contractValue !== undefined) updateData.contractValue = Math.round(contractValue * 100); // Converter para centavos
    if (responsible !== undefined) updateData.responsible = responsible;
    if (niche !== undefined) updateData.niche = niche;
    if (notes !== undefined) updateData.notes = notes;

    console.log("Updating client with data:", updateData);
    console.log("Client ID:", client._id);

    // Atualizar cliente
    const updatedClient = await Client.findByIdAndUpdate(
      client._id,
      updateData,
      { new: true }
    );

    console.log("Updated client:", updatedClient);

    return NextResponse.json({
      ok: true,
      client: updatedClient
    });
  } catch (error) {
    console.error("Update contract error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
