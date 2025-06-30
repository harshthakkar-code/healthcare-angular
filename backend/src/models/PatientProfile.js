const mongoose = require('mongoose');
const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalHistory: String,
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema); 