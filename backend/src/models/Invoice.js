const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  issuedDate: { type: Date, default: Date.now },
  billingFrom: {
    name: String,
    address: String,
    extra: String
  },
  billingTo: {
    name: String,
    address: String,
    extra: String
  },
  paymentMethod: {
    type: { type: String, required: true },
    details: String,
    bank: String
  },
  items: [
    {
      description: String,
      quantity: Number,
      vat: String,
      total: Number
    }
  ],
  customer: [
    {
    name : String,
    email : String
    }
  ],
  subtotal: Number,
  discount: String,
  totalAmount: Number,
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  otherInfo: String,
  receiptUrl: String,
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Invoice', invoiceSchema); 