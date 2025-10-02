// Usar getters para ler variáveis em RUNTIME, não em build time
export const env = {
  get MONGODB_URI() {
    return process.env.MONGODB_URI || "mongodb://localhost:27017/traffic_ops";
  },
  get META_APP_ID() {
    return process.env.META_APP_ID || "";
  },
  get META_APP_SECRET() {
    return process.env.META_APP_SECRET || "";
  },
  get META_ACCESS_TOKEN() {
    return process.env.META_ACCESS_TOKEN || "";
  },
  get ALERTS_WEBHOOK_URL() {
    return process.env.ALERTS_WEBHOOK_URL || "";
  },
  get CURRENCY_DEFAULT() {
    return process.env.CURRENCY_DEFAULT || "BRL";
  },
  get LOW_BALANCE_THRESHOLD() {
    return Number(process.env.LOW_BALANCE_THRESHOLD) || 50;
  },
};
