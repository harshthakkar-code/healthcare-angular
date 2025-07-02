const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // patient, if booked
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // '09:00'
  endTime: { type: String, required: true },   // '09:30'
  status: { type: String, enum: ['available', 'booked', 'cancelled'], default: 'available' },
  fees: { type: Number },
  day: { type: String }, // 'Monday', 'Tuesday', etc.
  spaces: { type: Number, default: 1 }, // number of spaces for this slot
  spaceAssignments: [{
    spaceNumber: Number, // 1, 2, 3, ...
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // patient who booked this space
    status: { type: String, enum: ['available', 'booked', 'cancelled'], default: 'available' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema); 