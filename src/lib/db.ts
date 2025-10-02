import mongoose from "mongoose";
import { env } from "./env";

// Import ObjectId para validação
export const ObjectId = mongoose.Types.ObjectId;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // DEBUG: Log da string de conexão (mascarar senha)
    const mongoUri = env.MONGODB_URI;
    const maskedUri = mongoUri.replace(/:[^:@]+@/, ':****@');
    console.log('[DB] Tentando conectar com:', maskedUri);
    console.log('[DB] Todas as env vars disponíveis:', Object.keys(process.env).filter(k => k.includes('MONGO')));

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log('[DB] Conexão estabelecida com sucesso!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectDB };

// Extend global to include mongoose
declare global {
  var mongoose: any;
}
