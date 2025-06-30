const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');

async function updateDoctorAvgRating(doctorProfileId) {
  const doctor = await DoctorProfile.findById(doctorProfileId).populate('reviews');
  const ratings = doctor.reviews.map(r => r.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
  doctor.avgRating = avgRating;
  await doctor.save();
}

exports.getProfile = async (req, res, next) => { res.json({ message: 'Patient profile' }); };
exports.updateProfile = async (req, res, next) => { res.json({ message: 'Update patient profile' }); };
exports.bookAppointment = async (req, res, next) => { res.json({ message: 'Book appointment' }); };
exports.getAppointments = async (req, res, next) => { res.json({ message: 'Get patient appointments' }); };
exports.postReview = async (req, res, next) => {
  // ... existing code for saving review ...
  // After saving the review, update avgRating:
  await updateDoctorAvgRating(req.params.doctorId);
  // ... existing code ...
};
exports.getMedicalRecords = async (req, res, next) => { res.json({ message: 'Get medical records' }); }; 