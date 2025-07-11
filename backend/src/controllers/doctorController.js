const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');
const Specialization = require('../models/Specialization');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorSettings = require('../models/DoctorSettings');
const Favourite = require('../models/Favourite');
const Payout = require('../models/Payout');
const Report = require('../models/Report');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const SocialMedia = require('../models/SocialMedia');
const Transaction = require('../models/Transaction');
const { syncUserAndDoctorProfile } = require('../utils/userDoctorSync');


exports.getProfile = async (req, res, next) => {
  try {
    // req.user._id should be set by your auth middleware
    const doctor = await DoctorProfile.findOne({ user: req.user._id })
      .populate('specialization', 'name description');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // req.user._id should be set by your auth middleware
    const userId = req.user._id;
    const updateFields = {};
    // Only allow updating certain fields
    const allowedFields = ['profileImage', 'availability', 'name', 'email', 'phone', 'gender', 'specializations', 'profileImgUrl', 'age', 'weight', 'height', 'blood', 'address', 'address2', 'city', 'state', 'pincode'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });
    // Update DoctorProfile
    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateFields },
      { new: true }
    );
    // Sync with User model (profileImage and availability, and any other shared fields)
    await syncUserAndDoctorProfile(userId);
    res.json(updatedProfile);
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
      attachmentUrl
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
      attachmentUrl
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) { next(err); }
};

// Centralized: Get doctor list with reviews, avgRating, and filters
exports.getDoctorListWithReviews = async (req, res, next) => {
  try {
    const { specialization, city, name, avgReview } = req.query;
    const query = {};
    if (specialization) query.specialization = specialization;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };
    let doctors = await DoctorProfile.find(query)
      .populate({ path: 'reviews', select: 'rating comment createdAt', populate: { path: 'patient', select: 'name' } })
      .populate({ path: 'schedule' });
    doctors = doctors.map(doc => {
      const ratings = doc.reviews.map(r => r.rating);
      const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
      return { ...doc.toObject(), avgRating };
    });
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
    const { page = 1, limit = 10, search = '', specialization, sort = 'name', city, date, availability } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clinicName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization) {
      query.specialization = specialization;
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

    let doctors = await DoctorProfile.find(query)
      .populate('user', '_id')
      .populate('specialization', 'name')
      .populate({ path: 'reviews', select: 'rating comment', populate: { path: 'patient', select: 'name' } });

    // Get all doctor user IDs (safe)
    const doctorUserIds = doctors.map(doc => doc.user && doc.user._id ? doc.user._id : null).filter(Boolean);

    // Get total earned (sum of paid transactions) for each doctor user ID
    const transactionSums = await Transaction.aggregate([
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          as: 'appointmentData'
        }
      },
      { $unwind: '$appointmentData' },
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$appointmentData.doctor',
          totalEarned: { $sum: '$amount' }
        }
      }
    ]);
    // Map: doctorUserId (as string) => totalEarned
    const transactionSumMap = {};
    transactionSums.forEach(ts => {
      if (ts._id) transactionSumMap[ts._id.toString()] = ts.totalEarned;
    });

    // Prepare the response
    const doctorsWithExtras = await Promise.all(doctors.map(async doc => {
      // Find all specializations for this doctor by user ID
      const allSpecs = await Specialization.find({ doctorId: doc.user && doc.user._id ? doc.user._id : null });
      const services = allSpecs.map(s => s.services)
      const specializations = allSpecs.map(s => s.name);
      const totalEarned = doc.user && doc.user._id ? transactionSumMap[doc.user._id.toString()] || 0 : 0;
      // Update the DoctorProfile document with these values
      await DoctorProfile.updateOne(
        { _id: doc._id },
        { $set: { specializations, totalEarned } }
      );
      return {
        ...doc.toObject(),
        specializations,
        totalEarned,
        services
      };
    }));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedDoctors = doctorsWithExtras.slice(skip, skip + parseInt(limit));
    const total = doctorsWithExtras.length;
    res.json({
      data: paginatedDoctors,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) { next(err); }
};

// Public: Get doctor details by ID (with reviews, specialization, etc)
exports.getDoctorDetails = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('specialization', 'name description')
      .populate({ path: 'reviews', select: 'rating comment createdAt', populate: { path: 'patient', select: 'name' } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // Calculate average rating
    const ratings = doctor.reviews.map(r => r.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
    res.json({ ...doctor.toObject(), avgRating });
  } catch (err) { next(err); }
};

exports.getDoctorByUserId = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findOne({ user: req.params.userId })
      .populate('specialization', 'name description');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
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
      // If appointment.date is only a date string (YYYY-MM-DD), this works
      if (today < apptDate.setHours(0,0,0,0)) {
        return res.status(400).json({ message: 'Cannot mark as completed before appointment date.' });
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
    // Add review to doctor profile
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (doctorProfile) {
      doctorProfile.reviews = doctorProfile.reviews || [];
      doctorProfile.reviews.push(review._id);
      // Update avgRating
      const allReviews = await Review.find({ doctor: doctorId });
      const avgRating = allReviews.length ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) : null;
      doctorProfile.avgRating = avgRating;
      await doctorProfile.save();
    }
    // Optionally, add review to patient profile (not required for now)
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
      .populate('patient', 'name email');
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
    const doctor = await DoctorProfile.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Fetch all specializations for this doctor, including services
    const specializations = await Specialization.find({ doctorId: doctor.user })
      .select('-__v -createdAt -updatedAt');

    res.json({
      _id: doctor._id,
      name: doctor.name,
      avatar: doctor.profileImgUrl || doctor.profileImage,
      city: doctor.city,
      address: doctor.address,
      specializations, // Array with services
      // Add more doctor fields as needed
    });
  } catch (err) {
    next(err);
  }
}; 
exports.getFullDoctorData = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    // Doctor Profile
    const profile = await DoctorProfile.findById(doctorId)
      .populate('specialization')
      .populate('reviews');

    // Doctor Settings
    const settings = await DoctorSettings.findOne({ doctorId: doctorId });

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

    // Specialization (already populated in profile, but can fetch all if needed)
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
    // Try to find by DoctorProfile _id first
    let doctor = await DoctorProfile.findById(req.params.doctorId).select('email phone');
    // If not found, try to find by user field
    if (!doctor) {
      doctor = await DoctorProfile.findOne({ user: req.params.doctorId }).select('email phone');
    }
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ email: doctor.email, phone: doctor.phone });
  } catch (err) {
    next(err);
  }
};