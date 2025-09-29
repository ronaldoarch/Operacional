import { Schema, model, models } from "mongoose";

const CampaignSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
  adAccountId: { type: Schema.Types.ObjectId, ref: "AdAccount", index: true },
  campaignId: { type: String, index: true }, // Meta campaign ID
  name: String,
  status: String,
  objective: String,
  budget: Number, // em centavos
  spent: Number,  // em centavos
  impressions: Number,
  clicks: Number,
  conversions: Number,
  lastSyncAt: Date
}, { 
  timestamps: true 
});

export default models.Campaign || model("Campaign", CampaignSchema);
