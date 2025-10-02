import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import ClientProfile from "@/src/models/ClientProfile";
import Client from "@/src/models/Client";

// GET - Buscar perfil do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    let profile = await ClientProfile.findOne({ clientId: params.id });

    // Se não existe, criar perfil padrão
    if (!profile) {
      profile = await ClientProfile.create({
        clientId: params.id,
        satisfactionLevel: 'neutral',
        traits: {
          behavior: [],
          communication: [],
          payment: []
        }
      });
    }

    return NextResponse.json({ ok: true, profile });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      satisfactionLevel,
      traits,
      preferredContactMethod,
      notes,
      addHistory
    } = body;

    let profile = await ClientProfile.findOne({ clientId: params.id });

    if (!profile) {
      profile = await ClientProfile.create({ clientId: params.id });
    }

    if (satisfactionLevel) profile.satisfactionLevel = satisfactionLevel;
    if (traits) profile.traits = traits;
    if (preferredContactMethod) profile.preferredContactMethod = preferredContactMethod;
    if (notes !== undefined) profile.notes = notes;
    
    if (addHistory) {
      profile.history.push(addHistory);
    }

    profile.lastContactDate = new Date();
    await profile.save();

    return NextResponse.json({
      ok: true,
      profile,
      message: 'Perfil atualizado'
    });

  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

