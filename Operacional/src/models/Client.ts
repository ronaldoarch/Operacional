import { Schema, model, models } from "mongoose";

const ClientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: String,
  metaAccessToken: String, // token de longa duração por cliente
  metaAppId: String,
  metaAppSecret: String,
  currency: { type: String, default: "BRL" },
  isActive: { type: Boolean, default: true },
  settings: {
    lowBalanceThreshold: { type: Number, default: 50 },
    alertsEnabled: { type: Boolean, default: true },
    webhookUrl: String,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  
  // Informações do contrato (baseado na planilha)
  contractValue: { type: Number, default: 0 }, // Valor do contrato em centavos
  contractCurrency: { type: String, default: 'BRL' },
  responsible: { type: String, default: '' }, // Quem está responsável
  priority: { type: Number, default: 2 }, // Prioridade: 0=Baixa, 1=Média, 2=Alta
  referralPotential: { type: String, enum: ['Alta', 'Baixa'], default: 'Baixa' }, // Possibilidade de indicação
  renewed: { type: Boolean, default: false }, // Se renovou (s/n da planilha)
  renewalResponsible: { type: String, default: '' }, // Responsável pela renovação
  tracking: { type: String, default: '' }, // Campo de tracking/status atual
  
  // Status e controle
  status: { 
    type: String, 
    enum: ['not_started', 'running', 'paused', 'completed'], 
    default: 'not_started' 
  },
  statusComments: [{ 
    status: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
    updatedBy: String
  }],
  
  // Métricas calculadas
  totalSpend: { type: Number, default: 0 }, // Total gasto em centavos
  totalRevenue: { type: Number, default: 0 }, // Total de receita em centavos
  roi: { type: Number, default: 0 }, // ROI calculado
  lastRoiUpdate: Date,
  
  // Configurações
  niche: { type: String, default: 'generic' },
  notes: { type: String, default: '' }
}, { 
  timestamps: true 
});

// Forçar recriação do modelo
delete models.Client;
export default model("Client", ClientSchema);
