const mongoose = require('mongoose');
const specializationSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  experience: { type: Number, required: true },
  services: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    about: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Specialization', specializationSchema); 