const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  status: { type: String, enum: ['payment_pending', 'pending', 'accepted', 'rejected', 'completed'], default: 'payment_pending' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  doctorName: { type: String },
  specialty: { type: String },
  service: { type: String },
  appointmentType: { type: String },
  date: { type: String },
  time: { type: String },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  symptoms: { type: String },
  price: { type: Number },
  totalPrice: { type: Number },
  attachmentUrl: { type: String },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema); 