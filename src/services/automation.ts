import Task from "@/src/models/Task";
import { runBalanceAndBlockAlerts } from "@/src/lib/alerts";
import { getAccountsWithLowBalance } from "./metaAccounts";

export async function createAutoTask(title: string, description: string, clientId: string, category: string, priority: string = "medium") {
  return Task.create({
    title,
    description,
    clientId,
    category,
    priority,
    status: "pending"
  });
}

export async function runAutomatedChecks() {
  const results = {
    tasksCreated: 0,
    alertsSent: 0,
    errors: [] as string[]
  };
  
  try {
    // 1. Verificar saldos baixos e criar tasks
    const lowBalanceAccounts = await getAccountsWithLowBalance();
    
    for (const account of lowBalanceAccounts) {
      await createAutoTask(
        `Saldo baixo - ${account.name}`,
        `Conta ${account.name} (${account.accountId}) tem saldo disponível de R$ ${account.availableBalance.toFixed(2)}`,
        account.clientId,
        "alert",
        "high"
      );
      results.tasksCreated++;
    }
    
    // 2. Executar alertas de saldo/bloqueio
    const alertResult = await runBalanceAndBlockAlerts();
    results.alertsSent = alertResult.count;
    
    // 3. Verificar contas bloqueadas e criar tasks
    const blockedAccounts = await getBlockedAccounts();
    for (const account of blockedAccounts) {
      await createAutoTask(
        `Conta bloqueada - ${account.name}`,
        `Conta ${account.name} (${account.accountId}) está com status: ${getStatusLabel(account.accountStatus)}`,
        account.clientId,
        "alert",
        "urgent"
      );
      results.tasksCreated++;
    }
    
  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : "Unknown error");
  }
  
  return results;
}

async function getBlockedAccounts() {
  // Buscar contas com status diferente de ACTIVE (1)
  const accounts = await import("@/src/models/AdAccount").then(m => m.default);
  return accounts.find({ accountStatus: { $ne: 1 } });
}

function getStatusLabel(code?: number) {
  const map: Record<number, string> = {
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

export async function scheduleAutomation() {
  // Função para ser chamada via cron
  // Pode ser executada a cada 30 minutos
  return runAutomatedChecks();
}
