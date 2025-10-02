import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false, // Pode ser alerta global
    index: true
  },
  type: {
    type: String,
    enum: [
      'financial', // Financeiro
      'operational', // Operacional (saldo, conta bloqueada)
      'satisfaction', // Satisfação do cliente
      'performance', // Performance (ROI, CPA)
      'task', // Tarefa urgente
      'system' // Sistema
    ],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'read', 'resolved', 'dismissed'],
    default: 'active',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  channels: {
    type: [String], // ['dashboard', 'telegram', 'email', 'webhook']
    default: ['dashboard']
  },
  sentAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
AlertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índice composto
AlertSchema.index({ status: 1, priority: -1, createdAt: -1 });
AlertSchema.index({ clientId: 1, status: 1 });

const Alert = mongoose.models.Alert || mongoose.model("Alert", AlertSchema);

export default Alert;

