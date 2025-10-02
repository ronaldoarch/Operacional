import mongoose from "mongoose";

const SuggestionSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['performance', 'behavior', 'financial', 'operational', 'okr'],
    required: true
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
  description: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true // Ação recomendada
  },
  reason: {
    type: String,
    default: '' // Por que essa sugestão foi feita
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'done', 'dismissed'],
    default: 'pending',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  dismissedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware
SuggestionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índices
SuggestionSchema.index({ clientId: 1, status: 1, priority: -1 });

const Suggestion = mongoose.models.Suggestion || mongoose.model("Suggestion", SuggestionSchema);

export default Suggestion;

