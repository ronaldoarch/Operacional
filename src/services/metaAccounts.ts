import AdAccount from "@/src/models/AdAccount";
import { getAdAccounts } from "@/src/lib/meta";
import { toMinor } from "@/src/lib/currency";

export async function syncAdAccounts(clientId: string, accessToken?: string) {
  const data = await getAdAccounts(accessToken);
  const syncedAccounts = [];
  
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
  
  for (const a of data.data || []) {
    const fsd = a.funding_source_details || {};
    
    const account = await AdAccount.findOneAndUpdate(
      { clientId: actualClientId, accountId: a.id },
      {
        name: a.name,
        currency: a.currency,
        accountStatus: a.account_status,
        amountSpent: toMinor(a.amount_spent, a.currency),
        spendCap: a.spend_cap != null ? toMinor(a.spend_cap, a.currency) : null,
        balance: a.balance != null ? toMinor(a.balance, a.currency) : null,
        fundingSourceType: fsd.type || null,
        fundingSourceName: null, // Campo removido da API
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    syncedAccounts.push(account);
  }
  
  return { ok: true, count: syncedAccounts.length, accounts: syncedAccounts };
}

export async function getClientAdAccounts(clientId: string) {
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
  
  return AdAccount.find({ clientId: actualClientId }).sort({ name: 1 });
}

export async function getAdAccountById(clientId: string, accountId: string) {
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
  
  return AdAccount.findOne({ clientId: actualClientId, accountId });
}

export async function getAccountsWithLowBalance(clientId?: string) {
  let query: any = {};
  
  if (clientId) {
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
    
    query = { clientId: actualClientId };
  }
  
  const accounts = await AdAccount.find(query);
  const lowBalanceAccounts = [];
  
  for (const acc of accounts) {
    let availableBRL: number | null = null;
    
    if (typeof acc.balance === "number") {
      availableBRL = acc.balance / 100;
    } else if (typeof acc.spendCap === "number" && typeof acc.amountSpent === "number") {
      const remaining = acc.spendCap - acc.amountSpent;
      availableBRL = Math.max(0, remaining / 100);
    }
    
    if (availableBRL !== null && availableBRL < 50) {
      lowBalanceAccounts.push({ ...acc.toObject(), availableBalance: availableBRL });
    }
  }
  
  return lowBalanceAccounts;
}
