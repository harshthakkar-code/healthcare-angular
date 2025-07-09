const DoctorProfile = require('../models/DoctorProfile');
const Specialization = require('../models/Specialization');
const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');

// Sync the specializations array in DoctorProfile for a given userId
async function syncDoctorSpecializations(userId) {
  const allSpecs = await Specialization.find({ doctorId: userId });
  const specializationNames = allSpecs.map(s => s.name);
  await DoctorProfile.updateOne(
    { user: userId },
    { $set: { specializations: specializationNames } }
  );
}

// Sync the totalEarned field in DoctorProfile for a given userId
async function syncDoctorTotalEarned(userId) {
  // Find all appointments for this doctor
  const appointments = await Appointment.find({ doctor: userId }).select('_id');
  const appointmentIds = appointments.map(a => a._id);
  // Sum all paid transactions for these appointments
  const result = await Transaction.aggregate([
    { $match: { appointment: { $in: appointmentIds }, status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalEarned = result[0]?.total || 0;
  await DoctorProfile.updateOne(
    { user: userId },
    { $set: { totalEarned } }
  );
}

module.exports = {
  syncDoctorSpecializations,
  syncDoctorTotalEarned
}; 