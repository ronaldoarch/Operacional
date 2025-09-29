import { env } from "./env";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function metaFetch(path: string, params: Record<string,string|number> = {}, accessToken?: string) {
  const q = new URLSearchParams({ 
    ...Object.fromEntries(Object.entries(params).map(([k,v])=>[k,String(v)])), 
    access_token: accessToken || env.META_ACCESS_TOKEN 
  });
  
  const res = await fetch(`${GRAPH}/${path}?${q.toString()}`, { cache: "no-store" });
  
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Meta API error: ${res.status} - ${txt}`);
  }
  
  return res.json();
}

/**
 * Pega adaccounts do usuário/App:
 * - Campos chave para saldo/pagamento/estado
 * Observação: "balance" pode não aparecer em pós-pago.
 */
export async function getAdAccounts(accessToken?: string) {
  const fields = [
    "id","account_status","name","currency","amount_spent",
    "spend_cap","balance","funding_source_details{type}"
  ].join(",");
  
  // /me/adaccounts exige token com permissão
  return metaFetch("me/adaccounts", { fields, limit: 100 }, accessToken);
}

/** Opcional: pegar status/limites mais detalhados por account */
export async function getAdAccountById(accountId: string, accessToken?: string) {
  const fields = [
    "id","account_status","name","currency","amount_spent",
    "spend_cap","balance","funding_source_details{type}"
  ].join(",");
  
  return metaFetch(accountId, { fields }, accessToken);
}

/**
 * Verifica se o token ainda é válido
 */
export async function validateToken(accessToken?: string) {
  try {
    await metaFetch("me", {}, accessToken);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Pega informações do usuário/app
 */
export async function getMe(accessToken?: string) {
  return metaFetch("me", {}, accessToken);
}
