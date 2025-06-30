const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender, clinicName, clinicAddress, address, address2, city, state, pincode, weight, height, age, blood } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role || !phone || !gender) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered. Please use a different email.' });
    }

    // 3. For doctor, validate extra fields and files
    let doctorProfile;
    if (role === 'doctor') {
      if (!clinicAddress || !city || !state || !pincode || !weight || !height || !age || !blood) {
        return res.status(400).json({ message: 'Please fill all doctor profile fields.' });
      }
      const files = req.files || {};
      if (!files.profileImage || !files.certFile || !files.photoID || !files.employmentProof) {
        return res.status(400).json({ message: 'All required files (profile image, certificate, photo ID, employment proof) must be uploaded.' });
      }
    }

    // 4. Create user
    const user = new User({ name, email, password, role, phone, gender, isApproved: role === 'doctor' ? false : true });
    await user.save();

    // 5. Create doctor profile if doctor
    if (role === 'doctor') {
      const files = req.files || {};
      const profileImage = files.profileImage ? files.profileImage[0].filename : undefined;
      const certFile = files.certFile ? files.certFile[0].filename : undefined;
      const photoID = files.photoID ? files.photoID[0].filename : undefined;
      const employmentProof = files.employmentProof ? files.employmentProof[0].filename : undefined;

      doctorProfile = new DoctorProfile({
        user: user._id,
        name,
        email,
        password,
        clinicName,
        clinicAddress,
        address,
        address2,
        city,
        state,
        pincode,
        phone,
        gender,
        weight,
        height,
        age,
        blood,
        profileImage,
        certFile,
        photoID,
        employmentProof
      });
      await doctorProfile.save();
    }

    res.status(201).json({ message: 'Registration successful, please login.' });
  } catch (err) {
    // 6. Return error message
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: 'This email is already registered. Please use a different email.' });
    }
    res.status(500).json({ message: err.message || 'Registration failed.' });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.role === 'doctor' && !user.isApproved) return res.status(403).json({ message: 'Doctor not approved yet' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) { next(err); }
}; 