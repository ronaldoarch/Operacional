import { Schema, model, models } from "mongoose";

const EventSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
  adAccountId: { type: Schema.Types.ObjectId, ref: "AdAccount" },
  type: { type: String, index: true }, // "FTD", "TICKET_SOLD", "DEPOSIT", ...
  amount: Number, // valor em centavos (quando aplicável)
  qty: Number,    // quantidade (ex.: 1 FTD, 3 tickets)
  meta: Schema.Types.Mixed, // payload livre (campaignId, source, etc.)
  happenedAt: { type: Date, index: true },
  source: String, // "bemob", "n8n", "webhook", "manual"
  processedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

export default models.Event || model("Event", EventSchema);
