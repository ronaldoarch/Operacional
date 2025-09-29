import AdAccount from "@/src/models/AdAccount";
import { fromMinor } from "./currency";
import { env } from "./env";

function statusLabel(code?: number) {
  // 1=ACTIVE; 2=DISABLED; 3=UNSETTLED; 7=PENDING_RISK_REVIEW; 8=PENDING_SETTLEMENT; 9=IN_GRACE_PERIOD; 100=INTERNAL
  const map: Record<number,string> = {
    1: "ACTIVE", 
    2: "DISABLED", 
    3: "UNSETTLED", 
    7: "PENDING_RISK_REVIEW",
    8: "PENDING_SETTLEMENT", 
    9: "IN_GRACE_PERIOD", 
    100: "INTERNAL"
  };
  return map[code || 0] || `UNKNOWN_${code}`;
}

export async function runBalanceAndBlockAlerts() {
  const th = Number(process.env.LOW_BALANCE_THRESHOLD || 50); // BRL
  const accounts = await AdAccount.find({});
  const alerts: string[] = [];

  for (const acc of accounts) {
    const status = statusLabel(acc.accountStatus);
    
    // Verifica status da conta
    if (status !== "ACTIVE") {
      alerts.push(`🚨 Conta ${acc.name} (${acc.accountId}) está com status: ${status}`);
    }
    
    // Verifica saldo baixo
    let availableBRL: number | null = null;
    
    if (typeof acc.balance === "number") {
      // Pré-pago: usa balance direto
      availableBRL = fromMinor(acc.balance, acc.currency);
    } else if (typeof acc.spendCap === "number" && typeof acc.amountSpent === "number") {
      // Pós-pago: usa sobra de spend_cap
      const remaining = acc.spendCap - acc.amountSpent;
      availableBRL = Math.max(0, fromMinor(remaining, acc.currency));
    }

    if (availableBRL !== null && availableBRL < th) {
      alerts.push(`💰 Saldo baixo na conta ${acc.name} (${acc.accountId}): R$ ${availableBRL.toFixed(2)} (< R$ ${th})`);
    }
  }

  // Envia alertas se houver webhook configurado
  if (alerts.length && process.env.ALERTS_WEBHOOK_URL) {
    try {
      await fetch(process.env.ALERTS_WEBHOOK_URL, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          text: alerts.join("\n"),
          timestamp: new Date().toISOString()
        }) 
      });
    } catch (error) {
      console.error("Failed to send alerts:", error);
    }
  }

  return { count: alerts.length, alerts };
}

export async function runMetricAlerts(clientId: string, niche: string) {
  // Implementar alertas específicos por métrica
  // Ex: ROI baixo, FTDs abaixo do threshold, etc.
  return { count: 0, alerts: [] };
}
