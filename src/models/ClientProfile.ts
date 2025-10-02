import mongoose from "mongoose";

const ClientProfileSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    unique: true,
    index: true
  },
  satisfactionLevel: {
    type: String,
    enum: ['satisfied', 'neutral', 'unsatisfied'],
    default: 'neutral',
    index: true
  },
  traits: {
    behavior: {
      type: [String], // ['carente', 'exigente', 'tranquilo', 'chato', 'legal']
      default: []
    },
    communication: {
      type: [String], // ['responde_rapido', 'demora', 'detalhista', 'objetivo']
      default: []
    },
    payment: {
      type: [String], // ['pontual', 'atrasado', 'negociador']
      default: []
    }
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  preferredContactMethod: {
    type: String,
    enum: ['whatsapp', 'email', 'telegram', 'call', 'none'],
    default: 'whatsapp'
  },
  notes: {
    type: String,
    default: ''
  },
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    event: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['contact', 'payment', 'satisfaction', 'performance', 'other'],
      default: 'other'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar updatedAt
ClientProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índice composto
ClientProfileSchema.index({ satisfactionLevel: 1, lastContactDate: -1 });

const ClientProfile = mongoose.models.ClientProfile || mongoose.model("ClientProfile", ClientProfileSchema);

export default ClientProfile;

