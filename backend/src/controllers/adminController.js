const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

exports.dashboard = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const doctors = await User.countDocuments({ role: 'doctor' });
    const patients = await User.countDocuments({ role: 'patient' });
    res.json({ users, doctors, patients });
  } catch (err) { next(err); }
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