import { Schema, model, models } from "mongoose";

const PlaybookSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ["casino", "rifa", "hot", "generic"], 
    default: "generic" 
  },
  steps: [{
    title: String,
    description: String,
    order: Number,
    required: { type: Boolean, default: false },
    conditions: Schema.Types.Mixed, // condições para executar o step
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { 
  timestamps: true 
});

export default models.Playbook || model("Playbook", PlaybookSchema);
