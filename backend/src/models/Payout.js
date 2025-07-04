const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // e.g., 'stripe', 'paypal'
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  paymentDate: { type: Date, required: true },
  timesteps: {
    requested: { type: Date },
    processed: { type: Date },
    completed: { type: Date },
    failed: { type: Date }
  },
  transactionId: { type: String }, // from Stripe/PayPal/etc
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema); 