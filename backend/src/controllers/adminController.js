const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const Patient = require('../models/PatientProfile')
const Specialization = require('../models/Specialization');
const Review = require('../models/Review');

exports.dashboard = async (req, res, next) => {
  try {
    // Basic counts (only approved doctors and patients)
    const users = await User.countDocuments();
    const doctors = await User.countDocuments({ role: 'doctor' });
    const patients = await User.countDocuments({ role: 'patient' });
    const appointments = await Appointment.countDocuments();
    
    // Revenue calculations
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    // Monthly revenue for chart (last 7 months)
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 7 }
    ]);
    
    // Doctor and patient growth data for chart (using User)
    const doctorGrowth = await User.aggregate([
      { $match: { role: 'doctor' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 5 }
    ]);
    
    const patientGrowth = await User.aggregate([
      { $match: { role: 'patient' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 5 }
    ]);
    
    // Top doctors by totalEarned (from transactions)
    const topDoctorsAgg = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$doctor', totalEarned: { $sum: '$amount' } } },
      { $sort: { totalEarned: -1 } },
      { $limit: 5 }
    ]);
    const topDoctorIds = topDoctorsAgg.map(d => d._id);
    let topDoctors = await User.find({ _id: { $in: topDoctorIds }, role: 'doctor' }, 'name profileImgUrl').lean();
    topDoctors = topDoctors.map(doc => ({
      ...doc,
      totalEarned: topDoctorsAgg.find(d => String(d._id) === String(doc._id))?.totalEarned || 0
    }));
    // If less than 5, fill with other doctors
    if (topDoctors.length < 5) {
      const fillDoctors = await User.find({
        _id: { $nin: topDoctorIds },
        role: 'doctor'
      }, 'name profileImgUrl').sort({ createdAt: -1 }).limit(5 - topDoctors.length).lean();
      topDoctors = topDoctors.concat(fillDoctors.map(doc => ({ ...doc, totalEarned: 0 })));
    }

    // Enhance topDoctors with speciality and reviews
    for (let doc of topDoctors) {
      // Get specialities (as a comma-separated string)
      const specs = await Specialization.find({ doctorId: doc._id });
      doc.speciality = specs.map(s => s.name).join(', ');
      // Get reviews count
      doc.reviews = await Review.countDocuments({ doctor: doc._id });
    }

    // Top patients by totalSpent (from transactions)
    const topPatientsAgg = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$patient', totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);
    const topPatientIds = topPatientsAgg.map(p => p._id);
    let topPatients = await User.find({ _id: { $in: topPatientIds }, role: 'patient' }, 'name profileImgUrl phone').lean();
    topPatients = topPatients.map(pat => ({
      ...pat,
      totalSpent: topPatientsAgg.find(p => String(p._id) === String(pat._id))?.totalSpent || 0
    }));
    // If less than 5, fill with other patients
    if (topPatients.length < 5) {
      const fillPatients = await User.find({
        _id: { $nin: topPatientIds },
        role: 'patient'
      }, 'name profileImgUrl phone').sort({ createdAt: -1 }).limit(5 - topPatients.length).lean();
      topPatients = topPatients.concat(fillPatients.map(pat => ({ ...pat, totalSpent: 0 })));
    }
    
    // Enhance topPatients with phone and lastVisit
    for (let pat of topPatients) {
      // Phone is already in User model
      // Get last visit (latest appointment date)
      const lastAppt = await Appointment.findOne({ patient: pat._id }).sort({ date: -1 });
      pat.lastVisit = lastAppt ? lastAppt.date : null;
    }
    
    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name profileImgUrl')
      .populate('patient', 'name profileImgUrl')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Format chart data
    const revenueChartData = monthlyRevenue.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.total
    }));
    
    const growthChartData = {
      doctors: doctorGrowth.map(item => ({
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      })),
      patients: patientGrowth.map(item => ({
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      }))
    };
    
    res.json({
      counts: { users, doctors, patients, appointments },
      revenue,
      revenueChartData,
      growthChartData,
      topDoctors,
      topPatients,
      recentAppointments
    });
  } catch (err) { 
    console.error('Dashboard error:', err);
    next(err); 
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
};

exports.updateDoctorStatus = async (req, res, next) => {
  try {
    let { isApproved } = req.body;
    if (!['pending', 'true', 'false'].includes(isApproved)) {
      return res.status(400).json({ message: 'isApproved must be "pending", "true", or "false"' });
    }
    console.log(isApproved);
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    res.json(user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor', 'name email')
      .populate('patient', 'name email');
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}; 