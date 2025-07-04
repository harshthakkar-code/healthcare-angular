const mongoose = require('mongoose');

const doctorSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  doctorName: { type: String, required: true },
  profileSettings: [{ type: Object }],
  insuranceSettings: [{ type: Object }],
  experienceSettings: [{ type: Object }],
  educationSettings: [{ type: Object }],
  clinicsSettings: [{ type: Object }],
  businessSettings: [{ type: Object }],
  awardsSettings: [{ type: Object }],
}, { timestamps: true });

module.exports = mongoose.model('DoctorSettings', doctorSettingsSchema); 