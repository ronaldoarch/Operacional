import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Report from "@/src/models/Report";

// GET - Listar relatórios
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let query: any = {};
    if (clientId) query.clientId = clientId;

    const reports = await Report.find(query)
      .populate('clientId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      ok: true,
      reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar relatórios' },
      { status: 500 }
    );
  }
}

// POST - Gerar relatório
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      clientId,
      period,
      template = 'standard',
      sections,
      manualData = {}
    } = body;

    const report = await Report.create({
      clientId,
      period: {
        start: new Date(period.start),
        end: new Date(period.end)
      },
      template,
      sections,
      manualData,
      status: 'generating'
    });

    // TODO: Aqui você pode adicionar lógica para gerar PDF
    report.status = 'ready';
    report.generatedAt = new Date();
    await report.save();

    return NextResponse.json({
      ok: true,
      report,
      message: 'Relatório gerado'
    });

  } catch (error) {
    console.error('Report POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}

