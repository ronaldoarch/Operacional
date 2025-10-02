import Event from "@/src/models/Event";

export async function ingestEvent(payload: {
  clientId: string;
  adAccountId?: string;
  type: string;
  amount?: number;
  qty?: number;
  meta?: any;
  happenedAt?: string | Date;
  source?: string;
}) {
  // Buscar cliente para obter ObjectId real
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(payload.clientId);
  let actualClientId = payload.clientId;
  
  if (!isValidObjectId) {
    const Client = (await import("@/src/models/Client")).default;
    const client = await Client.findOne({ name: `Cliente ${payload.clientId}` });
    if (client) {
      actualClientId = client._id.toString();
    }
  }
  
  const event = await Event.create({
    clientId: actualClientId,
    adAccountId: payload.adAccountId || null,
    type: payload.type,
    amount: payload.amount ?? null,
    qty: payload.qty ?? 1,
    meta: payload.meta || {},
    happenedAt: payload.happenedAt ? new Date(payload.happenedAt) : new Date(),
    source: payload.source || "webhook"
  });
  
  return event;
}

export async function getEventsByClient(clientId: string, type?: string, limit: number = 100) {
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
  
  const query: any = { clientId: actualClientId };
  if (type) query.type = type;
  
  return Event.find(query)
    .sort({ happenedAt: -1 })
    .limit(limit)
    .populate("adAccountId", "name accountId");
}

export async function getEventsByType(clientId: string, type: string, startDate?: Date, endDate?: Date) {
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
  
  const query: any = { clientId: actualClientId, type };
  
  if (startDate || endDate) {
    query.happenedAt = {};
    if (startDate) query.happenedAt.$gte = startDate;
    if (endDate) query.happenedAt.$lte = endDate;
  }
  
  return Event.find(query).sort({ happenedAt: -1 });
}

export async function getEventStats(clientId: string, startDate?: Date, endDate?: Date) {
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
  
  const query: any = { clientId: actualClientId };
  
  if (startDate || endDate) {
    query.happenedAt = {};
    if (startDate) query.happenedAt.$gte = startDate;
    if (endDate) query.happenedAt.$lte = endDate;
  }
  
  const stats = await Event.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalQty: { $sum: "$qty" },
        avgAmount: { $avg: "$amount" }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
}

export async function processWebhookEvent(webhookPayload: any) {
  // Processar webhook de sistemas externos (BeMob, n8n, etc.)
  try {
    // Validar payload
    if (!webhookPayload.clientId || !webhookPayload.type) {
      throw new Error("Missing required fields: clientId, type");
    }
    
    // Mapear payload para formato interno
    const eventData = {
      clientId: webhookPayload.clientId,
      adAccountId: webhookPayload.adAccountId,
      type: webhookPayload.type.toUpperCase(),
      amount: webhookPayload.amount || webhookPayload.value,
      qty: webhookPayload.qty || webhookPayload.quantity || 1,
      meta: {
        ...webhookPayload.meta,
        source: webhookPayload.source || "webhook",
        externalId: webhookPayload.externalId || webhookPayload.id
      },
      happenedAt: webhookPayload.happenedAt || webhookPayload.timestamp,
      source: webhookPayload.source || "webhook"
    };
    
    const event = await ingestEvent(eventData);
    
    return { success: true, eventId: event._id };
    
  } catch (error) {
    console.error("Failed to process webhook event:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
