const DoctorSettings = require('../models/DoctorSettings');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Upsert (create or update) doctor settings
exports.upsertSettings = async (req, res, next) => {
  try {
    const { doctorId, profileSettings, insuranceSettings, experienceSettings, educationSettings, clinicsSettings, businessSettings, awardsSettings } = req.body;
    console.log("test", doctorId)

    const userId = req.user._id;
    console.log("test2", userId)

    const user = await User.findById(doctorId);
    const doctor = await DoctorProfile.findOne({ user: doctorId });
    console.log("test", user , doctor)
    if (!user || !doctor) return res.status(404).json({ message: 'User or Doctor not found' });
    const data = {
      userId,
      doctorId,
      doctorName: doctor.name,
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings,
    };
    const settings = await DoctorSettings.findOneAndUpdate(
      { userId, doctorId },
      data,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// Get settings by doctorId
exports.getSettingsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const settings = await DoctorSettings.findOne({ doctorId });
    if (!settings) return res.status(404).json({ message: 'Not found' });
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// Delete settings for a doctor
exports.deleteSettings = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const userId = req.user._id;
    await DoctorSettings.findOneAndDelete({ userId, doctorId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}; 