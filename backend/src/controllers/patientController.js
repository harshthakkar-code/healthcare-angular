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
    if (req.user.role === 'admin' && req.query.id) {
      userId = req.query.id;
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = await PatientProfile.findOne({ user: userId });
    if (!profile) return res.status(404).json({ message: 'Patient profile not found' });
    res.json({ user, profile });
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
    const profile = await PatientProfile.findOneAndUpdate(
      { user: userId },
      { $set: req.body },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Patient profile not found' });
    res.json({ message: 'Profile updated', profile });
  } catch (err) {
    next(err);
  }
};

// GET /patient/appointments
exports.getAppointments = async (req, res, next) => {
  try {
    let userId = req.user._id;
    if (req.user.role === 'admin' && req.query.id) {
      userId = req.query.id;
    }
    const appointments = await Appointment.find({ patient: userId });
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