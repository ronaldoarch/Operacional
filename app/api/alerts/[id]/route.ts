import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Alert from "@/src/models/Alert";

// PATCH - Atualizar alerta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { status } = body;

    const alert = await Alert.findById(params.id);

    if (!alert) {
      return NextResponse.json(
        { ok: false, error: 'Alerta não encontrado' },
        { status: 404 }
      );
    }

    alert.status = status;
    if (status === 'read') alert.readAt = new Date();
    if (status === 'resolved') alert.resolvedAt = new Date();

    await alert.save();

    return NextResponse.json({
      ok: true,
      alert,
      message: 'Alerta atualizado'
    });

  } catch (error) {
    console.error('Alert PATCH error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar alerta' },
      { status: 500 }
    );
  }
}

