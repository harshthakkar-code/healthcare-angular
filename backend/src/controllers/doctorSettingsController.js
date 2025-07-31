const User = require('../models/User');

// Upsert (create or update) doctor settings
exports.upsertSettings = async (req, res, next) => {
  try {
    const { profileSettings, insuranceSettings, experienceSettings, educationSettings, clinicsSettings, businessSettings, awardsSettings } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract shared fields from profileSettings[0] if present
    let sharedUpdate = {};
    if (Array.isArray(profileSettings) && profileSettings.length > 0) {
      const p = profileSettings[0];
      sharedUpdate = {
        name: p.name,
        lastName: p.lastName,
        displayName: p.displayName,
        designation: p.designation,
        phone: p.phone,
        email: p.email,
        knownLanguages: p.knownLanguages,
        memberships: p.memberships,
        profileImgUrl: p.profileImgUrl,
        qualiCertificate: p.qualiCertificate,
        photoId: p.photoId,
        clinicalEmployment: p.clinicalEmployment
      };
    }

    // Update User with both settings and shared fields
    const update = {
      ...sharedUpdate,
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings,
    };
    await User.findByIdAndUpdate(userId, update);

    res.json({ message: 'Settings updated in User.' });
  } catch (err) {
    next(err);
  }
};

// Get settings by doctorId (now userId)
exports.getSettingsByDoctor = async (req, res, next) => {
  try {
    const userId = req.params.doctorId;
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') return res.status(404).json({ message: 'Not found' });
    // Return only the settings fields
    const {
      profileSettings,
      insuranceSettings,
      experienceSettings,
      educationSettings,
      clinicsSettings,
      businessSettings,
      awardsSettings
    } = user;
    res.json({
      user,
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

// Delete settings for a doctor (now user)
exports.deleteSettings = async (req, res, next) => {
  try {
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
    res.json({ message: 'Settings deleted from User.' });
  } catch (err) {
    next(err);
  }
}; 