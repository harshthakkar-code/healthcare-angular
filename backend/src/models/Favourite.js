const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  favourites: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Favourite', favouriteSchema); 