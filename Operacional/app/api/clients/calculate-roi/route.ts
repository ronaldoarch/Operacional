import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";
import AdAccount from "@/src/models/AdAccount";
import Event from "@/src/models/Event";
import { ObjectId } from "@/src/lib/db";

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

    // Resolver clientId
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

    // Calcular total gasto das contas de anúncio
    const adAccounts = await AdAccount.find({ clientId: client._id });
    const totalSpend = adAccounts.reduce((sum, account) => sum + (account.amountSpent || 0), 0);

    // Calcular total de receita dos eventos
    const events = await Event.find({ clientId: client._id });
    const totalRevenue = events.reduce((sum, event) => {
      if (event.type === 'FTD' || event.type === 'DEPOSIT') {
        return sum + (event.amount || 0);
      }
      return sum;
    }, 0);

    // Calcular ROI
    let roi = 0;
    if (totalSpend > 0) {
      roi = ((totalRevenue - totalSpend) / totalSpend) * 100;
    }

    // Atualizar cliente com métricas calculadas
    const updatedClient = await Client.findByIdAndUpdate(
      client._id,
      {
        totalSpend,
        totalRevenue,
        roi,
        lastRoiUpdate: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      ok: true,
      metrics: {
        totalSpend,
        totalRevenue,
        roi,
        contractValue: client.contractValue,
        adAccountsCount: adAccounts.length,
        eventsCount: events.length
      },
      client: updatedClient
    });
  } catch (error) {
    console.error("Calculate ROI error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
