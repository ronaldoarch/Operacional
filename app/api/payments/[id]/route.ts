import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Payment from "@/src/models/Payment";

// GET - Buscar pagamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const payment = await Payment.findById(params.id).populate('clientId', 'name');

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, payment });

  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar pagamento' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar pagamento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { paidDate, status, notes } = body;

    const payment = await Payment.findById(params.id);

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    if (paidDate) payment.paidDate = new Date(paidDate);
    if (status) payment.status = status;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    return NextResponse.json({
      ok: true,
      payment,
      message: 'Pagamento atualizado'
    });

  } catch (error) {
    console.error('Payment PATCH error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao atualizar pagamento' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar pagamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const payment = await Payment.findByIdAndDelete(params.id);

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Pagamento deletado'
    });

  } catch (error) {
    console.error('Payment DELETE error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao deletar pagamento' },
      { status: 500 }
    );
  }
}

