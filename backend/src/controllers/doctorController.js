const Review = require('../models/Review');
const Specialization = require('../models/Specialization');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Favourite = require('../models/Favourite');
const Payout = require('../models/Payout');
const Report = require('../models/Report');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const SocialMedia = require('../models/SocialMedia');
const Transaction = require('../models/Transaction');


exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateFields = {};
    // Only allow updating certain fields
    const allowedFields = ['profileImage', 'availability', 'name', 'email', 'phone', 'gender', 'specializations', 'profileImgUrl', 'age', 'weight', 'height', 'blood', 'address', 'address2', 'city', 'state', 'pincode'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};
exports.createSchedule = async (req, res, next) => { res.json({ message: 'Create schedule' }); };
exports.getAppointments = async (req, res, next) => { res.json({ message: 'Get doctor appointments' }); };
exports.updateAppointment = async (req, res, next) => { res.json({ message: 'Update appointment' }); };
exports.getEarnings = async (req, res, next) => { res.json({ message: 'Get doctor earnings' }); };
exports.createAppointment = async (req, res, next) => {
  try {
    // Accept both guest and logged-in users
    let patientId = null;
    if (req.user && req.user._id) patientId = req.user._id;
    patientId = req.body.patient;
    const {
      user: doctorId,
      specialty,
      selectedService,
      appointmentType,
      date,
      time,
      name,
      email,
      phone,
      symptoms,
      price,
      totalPrice,
      attachmentUrl,
      slot
    } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Doctor, date, and time are required.' });
    }

    // Fetch doctor name from User model
    let doctorName = '';
    const doctorUser = await User.findById(doctorId);
    if (doctorUser) doctorName = doctorUser.name;

    const appointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      specialty,
      service: selectedService,
      appointmentType,
      date,
      time,
      name,
      email,
      phone,
      symptoms,
      doctorName,
      status: 'pending',
      price,
      totalPrice,
      attachmentUrl,
      slot // <-- save slot in appointment
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) { next(err); }
};

// Centralized: Get doctor list with reviews, avgRating, and filters
exports.getDoctorListWithReviews = async (req, res, next) => {
  try {
    const { specialization, city, name, avgReview } = req.query;
    const query = { role: 'doctor' };
    if (specialization) query.specializations = specialization;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };
    let doctors = await User.find(query).select('-password');
    // Get avgRating for all doctors in one aggregation
    const doctorIds = doctors.map(doc => doc._id);
    const avgRatingsAgg = await Review.aggregate([
      { $match: { doctor: { $in: doctorIds } } },
      { $group: { _id: '$doctor', avg: { $avg: '$rating' } } }
    ]);
    // Attach reviews and avgRating
    doctors = await Promise.all(doctors.map(async doc => {
      const reviews = await Review.find({ doctor: doc._id });
      const avgRatingObj = avgRatingsAgg.find(r => String(r._id) === String(doc._id));
      const avgRating = avgRatingObj ? avgRatingObj.avg : null;
      return { ...doc.toObject(), reviews, avgRating };
    }));
    if (avgReview) {
      const avg = parseFloat(avgReview);
      doctors = doctors.filter(doc => doc.avgRating && Math.round(doc.avgRating) === avg);
    }
    const total = doctors.length;
    res.json({ total, data: doctors });
  } catch (err) { next(err); }
};

// Public: Get doctor list with search, pagination, specialities, and average reviews
exports.getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', specialization, sort = 'name', city, date, availability, isApproved } = req.query;
    const query = { role: 'doctor' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clinicName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization) {
      query.specializations = specialization;
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    // Add availability filter if provided
    if (availability !== undefined) {
      if (availability === 'true' || availability === true) {
        query.availability = true;
      } else if (availability === 'false' || availability === false) {
        query.availability = false;
      }
    }
    // Add isApproved filter if provided
    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let doctors = await User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort(sort);
    // Get avgRating for all doctors in one aggregation
    const doctorIds = doctors.map(doc => doc._id);
    const avgRatingsAgg = await Review.aggregate([
      { $match: { doctor: { $in: doctorIds } } },
      { $group: { _id: '$doctor', avg: { $avg: '$rating' } } }
    ]);
    // Attach reviews, avgRating, and specializations
    doctors = await Promise.all(doctors.map(async doc => {
      const reviews = await Review.find({ doctor: doc._id });
      const avgRatingObj = avgRatingsAgg.find(r => String(r._id) === String(doc._id));
      const avgRating = avgRatingObj ? avgRatingObj.avg : null;
      const allSpecs = await Specialization.find({ doctorId: doc._id });
      const specializations = allSpecs.map(s => s.name);
      return { ...doc.toObject(), reviews, avgRating, specializations };
    }));
    const total = await User.countDocuments(query);
    res.json({ total, data: doctors });
  } catch (err) { next(err); }
};

// Public: Get doctor details by ID (with reviews, specialization, etc)
exports.getDoctorDetails = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    const specializations = await Specialization.find({ doctorId: doctor._id });
    const reviews = await Review.find({ doctor: doctor._id }).populate('patient', 'name email avatar');
    const ratings = reviews.map(r => r.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
    res.json({ ...doctor.toObject(), specializations, reviews, avgRating });
  } catch (err) { next(err); }
};

exports.getDoctorByUserId = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.userId).select('-password');
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    const specializations = await Specialization.find({ doctorId: doctor._id });
    res.json({ ...doctor.toObject(), specializations });
  } catch (err) { next(err); }
};

exports.getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('doctor', 'name email')
      .populate('patient');
    res.json(appointments);
  } catch (err) { next(err); }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name email')
      .populate('patient', 'name email');
    res.json(appointments);
  } catch (err) { next(err); }
};

exports.getAppointmentsByPatient = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate('doctor', 'name email')
      .populate('patient', 'name email');
    res.json({ total: appointments.length, data: appointments });
  } catch (err) { next(err); }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // expected: 'accepted', 'rejected', or 'completed'
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    // Only allow the doctor assigned to the appointment to update
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    // if (req.user.role !== 'doctor' || String(appointment.doctor) !== String(req.user._id)) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    // Only allow marking as completed if today >= appointment date
    if (status === 'completed') {
      const today = new Date();
      const apptDate = new Date(appointment.date);
      if (today < apptDate.setHours(0,0,0,0)) {
        return res.status(400).json({ message: 'Cannot mark as completed before appointment date.' });
      }
    }

    // Only allow rejecting if more than 24 hours before appointment date/time
    if (status === 'rejected') {
      const now = new Date();
      const apptDate = new Date(appointment.date);
      const diffMs = apptDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24) {
        return res.status(400).json({ message: 'Cannot reject appointment less than 24 hours before the appointment time.' });
      }
    }
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) { next(err); }
};

// Get paginated, filtered list of patients who have appointments with the doctor
exports.getPatientsWithAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { page = 1, limit = 10, search = '', dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const match = { doctor: doctorId };
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = dateFrom;
      if (dateTo) match.date.$lte = dateTo;
    }
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    // Aggregate to get latest appointment per patient
    const pipeline = [
      { $match: match },
      { $sort: { date: -1, createdAt: -1 } },
      { $group: {
          _id: '$patient',
          latestAppointment: { $first: '$$ROOT' }
        }
      },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      { $unwind: '$patientInfo' },
      { $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$latestAppointment',
              { patient: '$patientInfo' }
            ]
          }
        }
      },
      { $facet: {
          data: [ { $skip: skip }, { $limit: parseInt(limit) } ],
          total: [ { $count: 'count' } ]
        }
      }
    ];
    const result = await Appointment.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].total[0] ? result[0].total[0].count : 0;
    res.json({ total, data });
  } catch (err) { next(err); }
};

// Create a review for a doctor
exports.createReview = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, rating, comment } = req.body;
    if (!doctorId || !rating) {
      return res.status(400).json({ message: 'doctorId and rating are required' });
    }
    // Prevent duplicate reviews by same patient for same doctor (optional)
    const existing = await Review.findOne({ doctor: doctorId, patient: patientId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this doctor.' });
    }
    const review = new Review({ doctor: doctorId, patient: patientId, rating, comment });
    await review.save();
    // Update avgRating on User (doctor) if you want to store it, or just calculate on the fly
    const allReviews = await Review.find({ doctor: doctorId });
    const avgRating = allReviews.length ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) : null;
    await User.findByIdAndUpdate(doctorId, { avgRating });
    // Populate doctor and patient info in response
    const populated = await Review.findById(review._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

// Get all reviews for a doctor (with patient info)
exports.getReviewsForDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctor: doctorId })
      .populate('patient', 'name email avatar')
      .sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : null;
    res.json({ avgRating, reviews });
  } catch (err) { next(err); }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email profileImgUrl');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

// Change password for doctor
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

exports.getDoctorProfileAndSpecialization = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.doctorId);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    const specializations = await Specialization.find({ doctorId: req.params.doctorId });
    res.json({ ...doctor.toObject(), specializations: specializations });
  } catch (err) {
    next(err);
  }
}; 
exports.getFullDoctorData = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    // Doctor Profile (now User)
    const profile = await User.findById(doctorId).select('-password');
    if (!profile || profile.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    // Doctor Settings (now embedded in user)
    const settings = {
      profileSettings: profile.profileSettings,
      insuranceSettings: profile.insuranceSettings,
      experienceSettings: profile.experienceSettings,
      educationSettings: profile.educationSettings,
      clinicsSettings: profile.clinicsSettings,
      businessSettings: profile.businessSettings,
      awardsSettings: profile.awardsSettings
    };
    // Reviews
    const reviews = await Review.find({ doctor: doctorId }).populate('patient');
    // Favourite
    const favourites = await Favourite.find({ doctor: doctorId });
    // Payout
    const payouts = await Payout.find({ doctor: doctorId });
    // Report
    const reports = await Report.find({ doctor: doctorId });
    // Service
    const services = await Service.find({ doctor: doctorId });
    // Specialization
    const specializations = await Specialization.find({ doctorId: doctorId });
    // Slot
    const slots = await Slot.find({ doctorId: doctorId });
    // Social Media
    const socialMedia = await SocialMedia.findOne({ userId: doctorId });
    // Appointments
    const appointments = await Appointment.find({ doctor: doctorId });
    res.json({
      profile,
      settings,
      reviews,
      favourites,
      payouts,
      reports,
      services,
      specializations,
      slots,
      socialMedia,
      appointments
    });
  } catch (err) {
    next(err);
  }
};

exports.getDoctorContactInfo = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.doctorId).select('email phone role profileImgUrl');
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    res.json({ email: doctor.email, phone: doctor.phone  , profileImgUrl: doctor.profileImgUrl});
  } catch (err) {
    next(err);
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isApproved } = req.body; // expects 'true' or 'false'
    const doctor = await User.findByIdAndUpdate(doctorId, { isApproved }, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};