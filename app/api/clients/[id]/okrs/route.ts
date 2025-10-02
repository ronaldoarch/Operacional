import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import OKR from "@/src/models/OKR";

// GET - Buscar OKRs do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const okrs = await OKR.find({
      clientId: params.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ ok: true, okrs });

  } catch (error) {
    console.error('OKRs GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar OKRs' },
      { status: 500 }
    );
  }
}

// POST - Criar OKR
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { niche, period, startDate, endDate, objectives } = body;

    const okr = await OKR.create({
      clientId: params.id,
      niche,
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      objectives,
      status: 'active'
    });

    return NextResponse.json({
      ok: true,
      okr,
      message: 'OKR criado'
    });

  } catch (error) {
    console.error('OKR POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar OKR' },
      { status: 500 }
    );
  }
}

