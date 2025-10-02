import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Alert from "@/src/models/Alert";

// GET - Listar alertas
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status') || 'active';
    const priority = searchParams.get('priority');

    let query: any = {};
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const alerts = await Alert.find(query)
      .populate('clientId', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      ok: true,
      alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('Alerts API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar alertas' },
      { status: 500 }
    );
  }
}

// POST - Criar alerta
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      clientId,
      type,
      priority = 'medium',
      title,
      message,
      channels = ['dashboard'],
      metadata = {}
    } = body;

    const alert = await Alert.create({
      clientId,
      type,
      priority,
      title,
      message,
      channels,
      metadata,
      status: 'active'
    });

    return NextResponse.json({
      ok: true,
      alert,
      message: 'Alerta criado'
    });

  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar alerta' },
      { status: 500 }
    );
  }
}

