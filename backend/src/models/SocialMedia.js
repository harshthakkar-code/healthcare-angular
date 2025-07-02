const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  facebook: { type: String },
  twitter: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  youtube: { type: String },
  website: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SocialMedia', socialMediaSchema); 