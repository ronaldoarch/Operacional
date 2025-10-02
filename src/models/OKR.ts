import mongoose from "mongoose";

const OKRSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  niche: {
    type: String,
    enum: ['casino', 'raffle', 'hot', 'generic'],
    required: true
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  objectives: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    keyResults: [{
      metric: {
        type: String,
        required: true
      },
      target: {
        type: Number,
        required: true
      },
      current: {
        type: Number,
        default: 0
      },
      unit: {
        type: String,
        default: ''
      },
      status: {
        type: String,
        enum: ['on_track', 'at_risk', 'off_track', 'completed'],
        default: 'on_track'
      }
    }]
  }],
  progress: {
    type: Number, // 0-100
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para calcular progresso
OKRSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calcular progresso
  if (!this.objectives || this.objectives.length === 0) {
    this.progress = 0;
    next();
    return;
  }

  let totalKRs = 0;
  let completedKRs = 0;

  this.objectives.forEach((obj: any) => {
    obj.keyResults.forEach((kr: any) => {
      totalKRs++;
      const percentage = (kr.current / kr.target) * 100;
      if (percentage >= 100) {
        completedKRs++;
        kr.status = 'completed';
      } else if (percentage >= 70) {
        kr.status = 'on_track';
      } else if (percentage >= 40) {
        kr.status = 'at_risk';
      } else {
        kr.status = 'off_track';
      }
    });
  });

  this.progress = Math.round((completedKRs / totalKRs) * 100);
  next();
});

// Índices
OKRSchema.index({ clientId: 1, status: 1, endDate: -1 });

const OKR = mongoose.models.OKR || mongoose.model("OKR", OKRSchema);

export default OKR;

