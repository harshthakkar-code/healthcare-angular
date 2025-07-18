const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  amount: Number,
  status: { type: String, enum: ['pending', 'paid', 'failed' , 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  // Stripe integration fields
  paymentIntentId: { type: String },
  stripeStatus: { type: String },
  reference: { type: String },
  refundId: { type: String }
});

module.exports = mongoose.model('Transaction', transactionSchema); 