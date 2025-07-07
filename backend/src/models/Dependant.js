const mongoose = require('mongoose');

const dependantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relation: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String },
  bloodGroup: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Dependant', dependantSchema); 