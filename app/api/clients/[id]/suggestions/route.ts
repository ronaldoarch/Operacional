import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Suggestion from "@/src/models/Suggestion";

// GET - Buscar sugestões do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const suggestions = await Suggestion.find({
      clientId: params.id,
      status
    }).sort({ priority: -1, createdAt: -1 });

    return NextResponse.json({ ok: true, suggestions });

  } catch (error) {
    console.error('Suggestions GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar sugestões' },
      { status: 500 }
    );
  }
}

// POST - Criar sugestão
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      type,
      priority = 'medium',
      title,
      description,
      action,
      reason,
      aiGenerated = false
    } = body;

    const suggestion = await Suggestion.create({
      clientId: params.id,
      type,
      priority,
      title,
      description,
      action,
      reason,
      aiGenerated,
      status: 'pending'
    });

    return NextResponse.json({
      ok: true,
      suggestion,
      message: 'Sugestão criada'
    });

  } catch (error) {
    console.error('Suggestion POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar sugestão' },
      { status: 500 }
    );
  }
}

