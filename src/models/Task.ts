import { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client", index: true },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ["pending", "in_progress", "completed", "cancelled"], 
    default: "pending" 
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"], 
    default: "medium" 
  },
  category: { 
    type: String, 
    enum: ["analysis", "optimization", "setup", "alert", "maintenance"], 
    default: "analysis" 
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  dueDate: Date,
  completedAt: Date,
  meta: Schema.Types.Mixed, // dados extras (campaignId, etc.)
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { 
  timestamps: true 
});

export default models.Task || model("Task", TaskSchema);
