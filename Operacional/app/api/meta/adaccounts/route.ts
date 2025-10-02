import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import { syncAdAccounts, getClientAdAccounts } from "@/src/services/metaAccounts";
import Client from "@/src/models/Client";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");
    const sync = url.searchParams.get("sync") === "true";
    
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "clientId parameter is required" },
        { status: 400 }
      );
    }
    
    console.log("Getting accounts for clientId:", clientId);
    
    // Buscar cliente - pode ser por ID ou por nome
    let client;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
    
    if (isValidObjectId) {
      client = await Client.findById(clientId);
    } else {
      client = await Client.findOne({ name: `Cliente ${clientId}` });
    }
    
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Client not found. Please configure Meta token first." },
        { status: 404 }
      );
    }
    
    if (!client.metaAccessToken) {
      return NextResponse.json(
        { ok: false, error: "Client without Meta token" },
        { status: 400 }
      );
    }
    
    let result;
    
    if (sync) {
      // Sincronizar com Meta API
      result = await syncAdAccounts(clientId, client.metaAccessToken);
    } else {
      // Apenas buscar do banco
      const accounts = await getClientAdAccounts(clientId);
      
      // Normalizar valores que parecem estar incorretos
      const normalizeAmount = (amount: number | null | undefined) => {
        if (!amount || amount === 0) return 0
        
        // Se o valor for muito alto (mais de 1 milhão de centavos = R$ 10.000), 
        // provavelmente está em centavos quando deveria estar em reais
        if (amount > 1000000) {
          return Math.round(amount / 100) // Converter de centavos para centavos corretos
        }
        
        return amount
      }
      
      const normalizedAccounts = accounts.map(account => ({
        ...account.toObject(),
        balance: normalizeAmount(account.balance),
        spendCap: normalizeAmount(account.spendCap)
      }))
      
      result = { ok: true, count: normalizedAccounts.length, accounts: normalizedAccounts };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("AdAccounts API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { clientId, accountId } = await req.json();
    
    if (!clientId || !accountId) {
      return NextResponse.json(
        { ok: false, error: "clientId and accountId are required" },
        { status: 400 }
      );
    }
    
    const client = await Client.findById(clientId);
    
    if (!client?.metaAccessToken) {
      return NextResponse.json(
        { ok: false, error: "Client without Meta token" },
        { status: 400 }
      );
    }
    
    // Sincronizar conta específica
    const result = await syncAdAccounts(clientId, client.metaAccessToken);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("AdAccounts sync error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
