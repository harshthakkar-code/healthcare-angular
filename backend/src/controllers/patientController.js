const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');

async function updateDoctorAvgRating(doctorProfileId) {
  const doctor = await DoctorProfile.findById(doctorProfileId).populate('reviews');
  const ratings = doctor.reviews.map(r => r.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
  doctor.avgRating = avgRating;
  await doctor.save();
}

// GET /patient/profile
exports.getProfile = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if ((req.user.role === 'admin' || req.user.role === 'doctor') && req.query.id) {
      userId = req.query.id;
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = await PatientProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: 'Patient profile not found' });
    // Merge user and profile fields (profile fields overwrite user fields if duplicate)
    const mergedProfile = { ...user.toObject(), ...profile.toObject() };
    res.json(mergedProfile);
  } catch (err) {
    next(err);
  }
};

// PUT /patient/profile
exports.updateProfile = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if (req.user.role === 'admin' && req.query.id) {
      userId = req.query.id;
    }

    // Update User with all fields that exist in User schema
    const userUpdateFields = {};
    const userSchemaPaths = Object.keys(User.schema.paths);
    Object.keys(req.body).forEach(key => {
      if (userSchemaPaths.includes(key)) {
        userUpdateFields[key] = req.body[key];
      }
    });
    delete userUpdateFields._id; // Remove _id if present
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: userUpdateFields }, { new: true });

    // Update PatientProfile with all fields that exist in PatientProfile schema
    const profileUpdateFields = {};
    const profileSchemaPaths = Object.keys(PatientProfile.schema.paths);
    Object.keys(req.body).forEach(key => {
      if (profileSchemaPaths.includes(key)) {
        profileUpdateFields[key] = req.body[key];
      }
    });
    delete profileUpdateFields._id; // Remove _id if present
    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileUpdateFields },
      { new: true }
    );
    if (!updatedProfile) return res.status(404).json({ message: 'Patient profile not found' });

    // Merge and return updated profile
    const mergedProfile = { ...updatedUser.toObject(), ...updatedProfile.toObject() };
    res.json(mergedProfile);
  } catch (err) {
    next(err);
  }
};

// GET /patient/appointments
exports.getAppointments = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if ((req.user.role === 'admin' || req.user.role === 'doctor') && req.query.id) {
      userId = req.query.id;
    }
    const appointments = await Appointment.find({ patient: userId }).populate('doctor', 'name');
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

// POST /patient/appointments
exports.bookAppointment = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if (req.user.role === 'admin' && req.body.patientId) {
      userId = req.body.patientId;
    }
    const appointment = new Appointment({ ...req.body, patient: userId });
    await appointment.save();
    res.json({ message: 'Appointment booked', appointment });
  } catch (err) {
    next(err);
  }
};

exports.postReview = async (req, res, next) => {
  // ... existing code for saving review ...
  // After saving the review, update avgRating:
  await updateDoctorAvgRating(req.params.doctorId);
  // ... existing code ...
};
exports.getMedicalRecords = async (req, res, next) => { res.json({ message: 'Get medical records' }); };

// POST /patient/profile
exports.createProfile = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if (req.user.role === 'admin' && req.body.userId) {
      userId = req.body.userId;
    }
    // Prevent duplicate profile
    const existing = await PatientProfile.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });
    const profile = new PatientProfile({ ...req.body, user: userId });
    await profile.save();
    res.status(201).json({ message: 'Profile created', profile });
  } catch (err) {
    next(err);
  }
};

// PUT /patient/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new password are required.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}; 