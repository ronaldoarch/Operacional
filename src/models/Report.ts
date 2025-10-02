import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  template: {
    type: String,
    enum: ['standard', 'executive', 'detailed'],
    default: 'standard'
  },
  sections: {
    summary: { type: Boolean, default: true },
    metrics: { type: Boolean, default: true },
    campaigns: { type: Boolean, default: true },
    charts: { type: Boolean, default: true },
    timeline: { type: Boolean, default: true },
    okrs: { type: Boolean, default: false },
    suggestions: { type: Boolean, default: false }
  },
  manualData: {
    ftds: { type: Number, default: 0 },
    deposits: { type: Number, default: 0 },
    tickets: { type: Number, default: 0 },
    leads: { type: Number, default: 0 },
    customMetrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  computedData: {
    totalSpent: { type: Number, default: 0 },
    totalResults: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    roas: { type: Number, default: 0 },
    cpa: { type: Number, default: 0 },
    cpl: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'ready', 'sent', 'failed'],
    default: 'draft',
    index: true
  },
  generatedAt: {
    type: Date,
    default: null
  },
  sentTo: {
    type: [String], // Array de emails
    default: []
  },
  sentAt: {
    type: Date,
    default: null
  },
  pdfUrl: {
    type: String,
    default: null
  },
  error: {
    type: String,
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

// Middleware
ReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Índices
ReportSchema.index({ clientId: 1, 'period.start': -1 });
ReportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);

export default Report;

