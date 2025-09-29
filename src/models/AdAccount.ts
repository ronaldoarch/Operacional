import { Schema, model, models } from "mongoose";

const AdAccountSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
  accountId: { type: String, index: true }, // act_123
  name: String,
  currency: String,
  accountStatus: Number, // 1=ACTIVE, etc.
  amountSpent: Number,   // em centavos (minor units)
  spendCap: Number,      // em centavos
  balance: Number,       // se disponível (pré-pago) em centavos
  fundingSourceType: String, // PREPAID / CREDIT_CARD / etc
  fundingSourceName: String,
  lastSyncAt: Date,
  niche: { type: String, default: 'generic' }, // cassino, rifa, afiliado, ecommerce, massagem
  notes: { type: String, default: '' },
  tasks: [{
    id: String,
    title: String,
    description: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

export default models.AdAccount || model("AdAccount", AdAccountSchema);
