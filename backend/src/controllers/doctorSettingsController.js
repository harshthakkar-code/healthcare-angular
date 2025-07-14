const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Upsert (create or update) doctor settings
exports.upsertSettings = async (req, res, next) => {
  try {
    const { doctorId, profileSettings, insuranceSettings, experienceSettings, educationSettings, clinicsSettings, businessSettings, awardsSettings } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const doctor = await DoctorProfile.findById(doctorId);
    if (!user || !doctor) return res.status(404).json({ message: 'User or Doctor not found' });

    // Update both User and DoctorProfile
    const update = {
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings,
    };
    await User.findByIdAndUpdate(userId, update);
    await DoctorProfile.findByIdAndUpdate(doctorId, update);

    // --- SYNC PROFILE IMAGE TO DoctorProfile AND User ---
    if (
      Array.isArray(profileSettings) &&
      profileSettings.length > 0 &&
      profileSettings[0].profileImgUrl
    ) {
      const imgUrl = profileSettings[0].profileImgUrl;
      await DoctorProfile.findByIdAndUpdate(
        doctorId,
        { profileImage: imgUrl, profileImgUrl: imgUrl }
      );
      await User.findByIdAndUpdate(
        userId,
        { profileImgUrl: imgUrl }
      );
    }

    res.json({ message: 'Settings updated in both User and DoctorProfile.' });
  } catch (err) {
    next(err);
  }
};

// Get settings by doctorId
exports.getSettingsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Not found' });
    // Return only the settings fields
    const {
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings
    } = doctor;
    res.json({
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings
    });
  } catch (err) {
    next(err);
  }
};

// Delete settings for a doctor
exports.deleteSettings = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const userId = req.user._id;
    const empty = {
      profileSettings: [],
      insuranceSettings: [],
      experienceSettings: [],
      educationSettings: [],
      clinicsSettings: [],
      businessSettings: [],
      awardsSettings: [],
    };
    await User.findByIdAndUpdate(userId, empty);
    await DoctorProfile.findByIdAndUpdate(doctorId, empty);
    res.json({ message: 'Settings deleted from both User and DoctorProfile.' });
  } catch (err) {
    next(err);
  }
}; 