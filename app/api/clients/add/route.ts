import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Client from "@/src/models/Client";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, contractValue, responsible, priority, niche, notes } = await req.json();

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se cliente já existe
    const existingClient = await Client.findOne({ name });
    if (existingClient) {
      return NextResponse.json(
        { ok: false, error: "Cliente com este nome já existe" },
        { status: 400 }
      );
    }

    const newClient = new Client({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      contractValue: contractValue ? Math.round(contractValue * 100) : 0, // Converter para centavos
      responsible: responsible || '',
      priority: priority || 2,
      referralPotential: 'Baixa',
      renewed: false,
      renewalResponsible: '',
      tracking: '',
      status: 'not_started',
      statusComments: [{ status: 'not_started', comment: 'Cliente criado manualmente', updatedBy: 'Sistema' }],
      niche: niche || 'generic',
      notes: notes || ''
    });

    await newClient.save();

    console.log(`✅ Novo cliente criado: ${name} (ID: ${newClient._id})`);

    return NextResponse.json({
      ok: true,
      message: "Cliente criado com sucesso",
      client: newClient
    });
  } catch (error) {
    console.error("Add client API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
