import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";
import AdAccount from "@/src/models/AdAccount";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se cliente tem contas de anúncios associadas
    const adAccounts = await AdAccount.find({ clientId });
    if (adAccounts.length > 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Cliente possui ${adAccounts.length} conta(s) de anúncios associada(s). Remova as contas primeiro.`,
          hasAdAccounts: true,
          adAccountsCount: adAccounts.length
        },
        { status: 400 }
      );
    }

    // Deletar cliente
    await Client.findByIdAndDelete(clientId);

    console.log(`🗑️ Cliente deletado: ${client.name} (ID: ${clientId})`);

    return NextResponse.json({
      ok: true,
      message: `Cliente "${client.name}" removido com sucesso`,
      deletedClient: {
        id: clientId,
        name: client.name
      }
    });
  } catch (error) {
    console.error("Delete client API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
