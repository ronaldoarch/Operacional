import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import AdAccount from "@/src/models/AdAccount";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { accountId, paymentMethod } = await req.json();

    if (!accountId || !paymentMethod) {
      return NextResponse.json({ ok: false, error: "accountId and paymentMethod are required" }, { status: 400 });
    }

    // Mapear nomes para códigos da Meta API
    const paymentMethodMap: { [key: string]: string } = {
      'PIX': '1',
      'Cartão': '20',
      'Pré-pago': 'PREPAID',
      'Cartão de Crédito': 'CREDIT_CARD',
      'Transferência': 'BANK_TRANSFER',
      'PayPal': 'PAYPAL'
    };

    const fundingSourceType = paymentMethodMap[paymentMethod] || paymentMethod;

    const updatedAccount = await AdAccount.findByIdAndUpdate(
      accountId, 
      { fundingSourceType }, 
      { new: true }
    );

    if (!updatedAccount) {
      return NextResponse.json({ ok: false, error: "AdAccount not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Forma de pagamento atualizada com sucesso", 
      account: updatedAccount 
    });
  } catch (error) {
    console.error("Update payment method API error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

