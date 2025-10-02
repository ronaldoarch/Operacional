import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  amount: {
    type: Number, // em centavos
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending',
    index: true
  },
  daysOverdue: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['pix', 'boleto', 'credit_card', 'debit_card', 'transfer', 'other'],
    default: 'pix'
  },
  reference: {
    type: String, // Referência/Número do pagamento
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  recurrence: {
    type: String,
    enum: ['one_time', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
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

// Middleware para atualizar updatedAt
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para calcular dias de atraso
PaymentSchema.pre('save', function(next) {
  if (this.status !== 'paid' && this.dueDate < new Date()) {
    const diffTime = Math.abs(new Date().getTime() - this.dueDate.getTime());
    this.daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.status = 'overdue';
  }
  next();
});

// Índice composto para queries otimizadas
PaymentSchema.index({ clientId: 1, status: 1, dueDate: -1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;

