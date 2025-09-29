import Event from "@/src/models/Event";
import AdAccount from "@/src/models/AdAccount";
import NicheMetricConfig from "@/src/models/NicheMetricConfig";
import { fromMinor } from "@/src/lib/currency";

export async function aggregateMetrics(clientId: string, niche: string = "generic", startDate?: Date, endDate?: Date, selectedAccountIds?: string[]) {
  // Buscar cliente para obter ObjectId real
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
  let actualClientId = clientId;
  
  if (!isValidObjectId) {
    const Client = (await import("@/src/models/Client")).default;
    const client = await Client.findOne({ name: `Cliente ${clientId}` });
    if (client) {
      actualClientId = client._id.toString();
    }
  }
  
  const cfg = await NicheMetricConfig.findOne({ clientId: actualClientId, niche }) || 
              await NicheMetricConfig.findOne({ clientId: actualClientId, niche: "generic" });
  
  // Métricas base de ad accounts (spend)
  let accountQuery: any = { clientId: actualClientId };
  
  // Se IDs específicos de contas foram fornecidos, filtrar por eles
  if (selectedAccountIds && selectedAccountIds.length > 0) {
    accountQuery._id = { $in: selectedAccountIds };
  }
  
  const accounts = await AdAccount.find(accountQuery);
  
  // Normalizar valores que parecem estar incorretos
  const normalizeAmount = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return 0
    
    // Se o valor for muito alto (mais de 1 milhão de centavos = R$ 10.000), 
    // provavelmente está em centavos quando deveria estar em reais
    if (amount > 1000000) {
      return Math.round(amount / 100) // Converter de centavos para centavos corretos
    }
    
    return amount
  }
  
  // Gasto removido - não calculamos mais totalSpentMinor
  
  // Query de eventos com filtro de data opcional
  const eventQuery: any = { clientId: actualClientId };
  if (startDate || endDate) {
    eventQuery.happenedAt = {};
    if (startDate) eventQuery.happenedAt.$gte = startDate;
    if (endDate) eventQuery.happenedAt.$lte = endDate;
  }
  
  const events = await Event.find(eventQuery);
  
  const calc: Record<string, number> = {};
  
  // Métricas essenciais (gasto removido)
  
  // FTDs (cassino): soma qty de events type=FTD
  calc.ftd = events
    .filter(e => e.type === "FTD")
    .reduce((s, e) => s + (e.qty || 0), 0);
  
  // Ticket médio (rifa): sum(amount) / sum(qty) nos events type=TICKET_SOLD
  const tickets = events.filter(e => e.type === "TICKET_SOLD");
  const tAmount = tickets.reduce((s, e) => s + (e.amount || 0), 0);
  const tQty = tickets.reduce((s, e) => s + (e.qty || 0), 0);
  calc.avg_ticket = tQty ? fromMinor(tAmount) / tQty : 0;
  
  // Depósitos totais
  calc.deposits = events
    .filter(e => e.type === "DEPOSIT")
    .reduce((s, e) => s + fromMinor(e.amount || 0), 0);
  
  // ROI básico (se tivermos receita)
  // ROI e ROAS (sem gasto, apenas receita)
  calc.roi = 0; // Sem gasto para calcular ROI
  calc.roas = 0; // Sem gasto para calcular ROAS
  
  // Aplica métricas do config personalizadas
  const metrics = (cfg?.metrics || [])
    .filter((m: any) => m.enabled)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((m: any) => ({
      key: m.key,
      label: m.label,
      value: calc[m.key] ?? null
    }));
  
  // Sempre incluir as chaves essenciais
  const essentials = [
    { key: "ftd", label: "FTDs", value: calc.ftd },
    { key: "avg_ticket", label: "Ticket médio", value: calc.avg_ticket },
    { key: "deposits", label: "Depósitos", value: calc.deposits },
    { key: "roi", label: "ROI (%)", value: calc.roi },
    { key: "roas", label: "ROAS", value: calc.roas },
  ];
  
  // Merge evitando duplicar chaves
  const byKey = new Map<string, { key: string; label: string; value: number | null }>();
  for (const m of [...essentials, ...metrics]) {
    byKey.set(m.key, m);
  }
  
  return {
    metrics: Array.from(byKey.values()),
    raw: calc,
    config: cfg
  };
}

export async function getMetricHistory(clientId: string, metricKey: string, days: number = 7) {
  // Buscar cliente para obter ObjectId real
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
  let actualClientId = clientId;
  
  if (!isValidObjectId) {
    const Client = (await import("@/src/models/Client")).default;
    const client = await Client.findOne({ name: `Cliente ${clientId}` });
    if (client) {
      actualClientId = client._id.toString();
    }
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  // Implementar histórico de métricas por período
  // Pode usar agregação MongoDB para performance
  return [];
}

export async function createNicheConfig(clientId: string, niche: string, metrics: any[], settings?: any) {
  // Buscar cliente para obter ObjectId real
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(clientId);
  let actualClientId = clientId;
  
  if (!isValidObjectId) {
    const Client = (await import("@/src/models/Client")).default;
    const client = await Client.findOne({ name: `Cliente ${clientId}` });
    if (client) {
      actualClientId = client._id.toString();
    }
  }
  
  return NicheMetricConfig.findOneAndUpdate(
    { clientId: actualClientId, niche },
    { 
      clientId: actualClientId,
      niche,
      metrics,
      settings: settings || {}
    },
    { upsert: true, new: true }
  );
}
