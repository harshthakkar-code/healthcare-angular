const mongoose = require('mongoose');
const scheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  slots: [{ time: String, isBooked: { type: Boolean, default: false } }],
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema); 