const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

async function syncUserAndDoctorProfile(userId) {
  // Get both documents
  const user = await User.findById(userId).lean();
  const doctorProfile = await DoctorProfile.findOne({ user: userId }).lean();
  if (!user || !doctorProfile) return;

  // List of fields to sync (excluding _id and user)
  const fieldsToSync = [
    'name', 'email', 'phone', 'gender', 'specializations', 'totalEarned',
    'profileImgUrl', 'age', 'weight', 'height', 'blood', 'address', 'address2', 'city', 'state', 'pincode'
    // Add any other fields you want to sync
  ];

  // Build update objects
  const userUpdate = {};
  const doctorUpdate = {};
  fieldsToSync.forEach(field => {
    if (doctorProfile[field] !== undefined) userUpdate[field] = doctorProfile[field];
    if (user[field] !== undefined) doctorUpdate[field] = user[field];
  });

  // Update both, but never touch _id or user
  await User.updateOne({ _id: userId }, { $set: userUpdate });
  await DoctorProfile.updateOne({ user: userId }, { $set: doctorUpdate });
}

module.exports = { syncUserAndDoctorProfile }; 