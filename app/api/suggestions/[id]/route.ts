import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Suggestion from "@/src/models/Suggestion";

// PATCH - Atualizar sugestão
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { status } = body;

    const suggestion = await Suggestion.findById(params.id);

    if (!suggestion) {
      return NextResponse.json(
        { ok: false, error: 'Sugestão não encontrada' },
        { status: 404 }
      );
    }

    suggestion.status = status;
    if (status === 'done') suggestion.completedAt = new Date();
    if (status === 'dismissed') suggestion.dismissedAt = new Date();

    await suggestion.save();

    return NextResponse.json({
      ok: true,
      suggestion,
      message: 'Sugestão atualizada'
    });

  } catch (error) {
    console.error('Suggestion PATCH error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar sugestão' },
      { status: 500 }
    );
  }
}

