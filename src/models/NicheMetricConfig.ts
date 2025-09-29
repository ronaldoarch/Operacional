import { Schema, model, models } from "mongoose";

const NicheMetricConfigSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
  niche: { 
    type: String, 
    enum: ["casino","rifa","hot","generic"], 
    default: "generic" 
  },
  // lista de métricas calculadas que queremos exibir
  metrics: [{
    key: String,                  // ex.: "ftd", "avg_ticket", "roi", "roas"
    label: String,                // "FTDs", "Ticket médio"
    formula: String,              // ex.: "sum(event:FTD.qty)"
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  }],
  // configurações específicas do nicho
  settings: {
    ftdThreshold: Number,         // alerta se FTDs < threshold
    ticketMinValue: Number,       // valor mínimo do ticket
    roiTarget: Number,            // ROI alvo em %
    roasTarget: Number,           // ROAS alvo
  }
}, { 
  timestamps: true 
});

export default models.NicheMetricConfig || model("NicheMetricConfig", NicheMetricConfigSchema);
