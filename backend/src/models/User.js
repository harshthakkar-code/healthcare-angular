const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  isApproved: { type: String, enum: ['pending', 'true', 'false'], default: 'pending' },
  avatar: { type: String },
  address: { type: String },
  address2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  age: { type: Number },
  blood: { type: String },
  weight: { type: Number },
  height: { type: Number },
  dob: { type: String },
  emergencyContact: { type: String },
  medicalInfo: { type: String },
  heartRate: { type: String },
  bp: { type: String },
  glucose: { type: String },
  allergies: { type: String },
  preExisting: { type: Boolean },
  medication: { type: Boolean },
  selectedMembers: { type: Object },
  childCount: { type: Number },
  memberDetails: { type: Object },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema); 