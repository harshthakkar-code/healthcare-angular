const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const { generateToken } = require('../utils/jwt');
const sendMail = require('../utils/sendMail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');


exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender, clinicName, clinicAddress, address, address2, city, state, pincode, weight, height, age, blood , isApproved} = req.body;

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

    // 3. For doctor, validate extra fields and Body
    let profileImage, certFile, photoID, employmentProof;
    profileImage = req.body.profileImage || undefined; 
    if (role === 'doctor') {
      if (!clinicAddress || !city || !state || !pincode || !weight || !height || !age || !blood) {
        return res.status(400).json({ message: 'Please fill all doctor profile fields.' });
      }
      const Body = req.body;
      // if (!Body.profileImage || !Body.qualiCertificate || !Body.photoId || !Body.clinicalEmployment) {
      //   return res.status(400).json({ message: 'All required Body (profile image, certificate, photo ID, employment proof) must be uploaded.' });
      // }
      profileImage = Body.profileImage ? Body.profileImage : undefined;
      qualiCertificate = Body.qualiCertificate ? Body.qualiCertificate : undefined;
      photoId = Body.photoId ? Body.photoId : undefined;
      clinicalEmployment = Body.clinicalEmployment ? Body.clinicalEmployment : undefined;
    }

    // 4. Create user (store all fields and Body in User)
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      gender,
      isApproved,
      clinicName,
      clinicAddress,
      address,
      address2,
      city,
      state,
      pincode,
      weight,
      height,
      age,
      blood,
      profileImage,
      profileImgUrl: profileImage,
      certFile,
      photoId,
      employmentProof,
      qualiCertificate,
      clinicalEmployment,
      photoId,
    });
    await user.save();

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
    res.json({
      token,
      loginTime: Date.now(),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileImgUrl: user.profileImgUrl || null,
        profileImage: user.profileImage || null,
        isApproved: user.isApproved
      }
    });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name profileImgUrl firstName');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};


exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Only allow updating certain fields
    const allowedFields = [
      'name', 'email', 'phone', 'gender', 'profileImgUrl', 'age', 'weight', 'height', 'blood',
      'address', 'address2', 'city', 'state', 'country', 'pincode', 'dob'
      // Add more fields as needed
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();
    // Send OTP via email
    await sendMail({
      to: user.email,
      subject: 'Your Login OTP',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <b>${otp}</b></p>`
    });
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) { next(err); }
};

exports.loginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });
    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiry) return res.status(400).json({ message: 'OTP not requested or expired.' });
    if (user.otpCode !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired.' });
    // Clear OTP fields
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();
    if (user.role === 'doctor' && !user.isApproved) return res.status(403).json({ message: 'Doctor not approved yet' });
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileImgUrl: user.profileImgUrl || null,
        profileImage: user.profileImage || null
      }
    });
  } catch (err) { next(err); }
};

exports.forgotPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();
    await sendMail({
      to: user.email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <b>${otp}</b></p>`
    });
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) { next(err); }
};

exports.forgotPasswordVerify = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpiry) return res.status(400).json({ message: 'OTP not requested or expired.' });
    if (user.otpCode !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired.' });
    res.json({ message: 'OTP verified.' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { next(err); }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No Google token provided.' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || '';
    const profileImage = payload.picture || null;

    const user = await User.findOne({ email });

    if (!user) {
      // Return limited info so UI can patch name/email
      return res.status(200).json({
        message: 'Email not registered',
        isNewUser: true,
        user: {
          name,
          email,
          profileImage,
        }
      });
    }

    // User exists, login and return token
    const jwt = generateToken(user);
    res.json({
      token: jwt,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileImgUrl: user.profileImgUrl || null,
        profileImage: user.profileImage || null
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Google login failed.' });
  }
};


exports.facebookLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No Facebook token provided.' });

    console.log('Incoming FB token:', token); 

    const fbUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`;
    const response = await axios.get(fbUrl);

    console.log('Facebook Graph API response:', response.data); 

    const { email, name, picture } = response.data;
    if (!email) return res.status(400).json({ message: 'Email not available from Facebook.' });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'Email not registered',
        isNewUser: true,
        user: {
          name,
          email,
          profileImage: picture?.data?.url || null,
        }
      });
    }

    const jwt = generateToken(user);
    res.json({
      token: jwt,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profileImgUrl: user.profileImgUrl || null,
        profileImage: user.profileImage || null
      }
    });

  } catch (err) {
    console.error('Facebook Login Error:', err.response?.data || err.message);
    res.status(401).json({ message: 'Facebook login failed.' });
  }
};

// Cascade delete user, profile, and all related data
exports.deleteUserCascade = async (req, res) => {
  try {
    const userId = req.params.id;
    const User = require('../models/User');
    const Appointment = require('../models/Appointment');
    const Favourite = require('../models/Favourite');
    const Dependant = require('../models/Dependant');
    const Review = require('../models/Review');
    const Notification = require('../models/Notification');
    const Report = require('../models/Report');
    const Document = require('../models/Document');
    const Schedule = require('../models/Schedule');
    const Chat = require('../models/Chat');
    const Payout = require('../models/Payout');

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete related data
    if (user.role === 'patient') {
      await Dependant.deleteMany({ userId });
      await Appointment.deleteMany({ patient: userId });
      await Favourite.deleteMany({ patientId: userId });
      await Review.deleteMany({ patient: userId });
      await Notification.deleteMany({ user: userId });
      await Report.deleteMany({ patient: userId });
      await Document.deleteMany({ patient: userId });
      await Chat.deleteMany({ participants: userId });
      await Payout.deleteMany({ patient: userId });
    } else if (user.role === 'doctor') {
      await Appointment.deleteMany({ doctor: userId });
      await Favourite.deleteMany({ doctorId: userId });
      await Review.deleteMany({ doctor: userId });
      await Notification.deleteMany({ user: userId });
      await Report.deleteMany({ doctor: userId });
      await Schedule.deleteMany({ doctor: userId });
      await Chat.deleteMany({ participants: userId });
      await Payout.deleteMany({ doctor: userId });
    }

    // Delete user
    await User.deleteOne({ _id: userId });

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 