import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "operator"], default: "operator" },
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  permissions: [String], // array de permissões específicas
}, { 
  timestamps: true 
});

export default models.User || model("User", UserSchema);
