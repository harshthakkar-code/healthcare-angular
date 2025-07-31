const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // patient, if booked
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // '09:00'
  endTime: { type: String, required: true },   // '09:30'
  duration: { type: Number }, // duration in minutes
  interval: { type: Number }, // interval in minutes
  status: { type: String, enum: ['available', 'booked', 'cancelled'], default: 'available' },
  fees: { type: Number },
  day: { type: String }, // 'Monday', 'Tuesday', etc.
  spaces: { type: Number, default: 1 }, // number of spaces for this slot
  remainingSpaces: { type: Number }, // number of spaces still available
  type: { type: String, enum: ['general', 'clinic'], default: 'general' },
  clinicName: { type: String }, // Optional, only for clinic slots
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema); 