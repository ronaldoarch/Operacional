import Client from "@/src/models/Client";
import { validateToken, getMe } from "@/src/lib/meta";
import { ObjectId } from "@/src/lib/db";

// Função helper para validar ObjectId
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function saveClientToken(clientId: string, accessToken: string, metaAppId?: string, metaAppSecret?: string) {
  const updateData: any = { 
    metaAccessToken: accessToken,
    name: `Cliente ${clientId}`,
    email: `cliente${clientId}@example.com`
  };
  
  if (metaAppId) updateData.metaAppId = metaAppId;
  if (metaAppSecret) updateData.metaAppSecret = metaAppSecret;
  
  // Sempre usar upsert para evitar problemas de ObjectId
  return Client.findOneAndUpdate(
    { name: `Cliente ${clientId}` },
    updateData,
    { upsert: true, new: true }
  );
}

export async function validateClientToken(clientId: string) {
  let client;
  if (isValidObjectId(clientId)) {
    client = await Client.findById(clientId);
  } else {
    client = await Client.findOne({ name: `Cliente ${clientId}` });
  }
  
  if (!client?.metaAccessToken) {
    return { valid: false, error: "No token found for client" };
  }
  
  return validateToken(client.metaAccessToken);
}

export async function refreshClientToken(clientId: string) {
  let client;
  if (isValidObjectId(clientId)) {
    client = await Client.findById(clientId);
  } else {
    client = await Client.findOne({ name: `Cliente ${clientId}` });
  }
  
  if (!client?.metaAccessToken) {
    throw new Error("No token found for client");
  }
  
  // Para tokens de longa duração, pode ser necessário renovar
  // Implementar lógica de refresh baseada no tipo de token
  const validation = await validateToken(client.metaAccessToken);
  
  if (!validation.valid) {
    // Token expirado - requer nova autorização
    return { 
      needsReauth: true, 
      error: validation.error 
    };
  }
  
  return { 
    needsReauth: false, 
    valid: true 
  };
}

export async function getClientMetaInfo(clientId: string) {
  let client;
  if (isValidObjectId(clientId)) {
    client = await Client.findById(clientId);
  } else {
    client = await Client.findOne({ name: `Cliente ${clientId}` });
  }
  
  if (!client?.metaAccessToken) {
    return null;
  }
  
  try {
    const me = await getMe(client.metaAccessToken);
    return me;
  } catch (error) {
    console.error("Failed to get Meta info:", error);
    return null;
  }
}
