import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Payment from "@/src/models/Payment";
import Client from "@/src/models/Client";

// GET - Listar pagamentos
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    let query: any = {};
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('clientId', 'name')
      .sort({ dueDate: -1 })
      .limit(100);

    return NextResponse.json({
      ok: true,
      payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
}

// POST - Criar pagamento
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      clientId,
      dueDate,
      amount,
      paymentMethod = 'pix',
      recurrence = 'monthly',
      notes = ''
    } = body;

    // Validar cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { ok: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const payment = await Payment.create({
      clientId,
      dueDate: new Date(dueDate),
      amount,
      paymentMethod,
      recurrence,
      notes,
      status: 'pending'
    });

    return NextResponse.json({
      ok: true,
      payment,
      message: 'Pagamento criado com sucesso'
    });

  } catch (error) {
    console.error('Payments POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
}

