export const env = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/traffic_ops",
  META_APP_ID: process.env.META_APP_ID || "",
  META_APP_SECRET: process.env.META_APP_SECRET || "",
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || "",
  ALERTS_WEBHOOK_URL: process.env.ALERTS_WEBHOOK_URL || "",
  CURRENCY_DEFAULT: process.env.CURRENCY_DEFAULT || "BRL",
  LOW_BALANCE_THRESHOLD: Number(process.env.LOW_BALANCE_THRESHOLD) || 50,
} as const;
