const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');
const Patient = require('../models/PatientProfile')

exports.dashboard = async (req, res, next) => {
  try {
    // Basic counts (only approved doctors and patients)
    const users = await User.countDocuments();
    const doctors = await DoctorProfile.countDocuments();
    const patients = await Patient.countDocuments();
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
    
    // Doctor and patient growth data for chart (using DoctorProfile and Patient)
    const doctorGrowth = await DoctorProfile.aggregate([
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
    
    const patientGrowth = await Patient.aggregate([
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
    
    // Top doctors by totalEarned from DoctorProfile
    const topDoctors = await DoctorProfile.find()
      .sort({ totalEarned: -1 })
      .limit(5)
      .select('name speciality totalEarned profileImgUrl');
    
    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name')
      .populate('patient', 'name')
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
    await DoctorProfile.findOneAndUpdate({ user: req.params.id }, { isApproved });
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