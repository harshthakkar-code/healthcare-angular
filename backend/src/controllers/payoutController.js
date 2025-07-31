const Payout = require('../models/Payout');
const DoctorProfile = require('../models/DoctorProfile');

// Create a new payout
// Create or update payout (upsert logic)
exports.createPayout = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'transactionId is required to prevent duplicates.' });
    }

    const updatedPayout = await Payout.findOneAndUpdate(
      { transactionId },            
      { $set: req.body },          
      { new: true, upsert: true }
    );

    res.status(201).json(updatedPayout);
  } catch (err) {
    next(err);
  }
};


// Get all payouts
exports.getPayouts = async (req, res, next) => {
  try {
    const { doctor, patient, status, paymentMethod, transactionId, startDate, endDate, search } = req.query;
    const filter = {};
    if (doctor) filter.doctor = doctor;
    if (patient) filter.patient = patient;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (transactionId) filter.transactionId = transactionId;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.notes = { $regex: search, $options: 'i' };
    }
    const payouts = await Payout.find(filter).populate('doctor patient');
    res.json(payouts);
  } catch (err) {
    next(err);
  }
};

// Get a single payout by ID
exports.getPayoutById = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id).populate('doctor patient');
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json(payout);
  } catch (err) {
    next(err);
  }
};

// Update a payout
exports.updatePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    const prevStatus = payout.status;
    // Update payout fields
    Object.assign(payout, req.body);
    await payout.save();

    // DoctorProfile earnings update removed (no longer needed)

    res.json(payout);
  } catch (err) {
    next(err);
  }
};

// Delete a payout
exports.deletePayout = async (req, res, next) => {
  try {
    const payout = await Payout.findByIdAndDelete(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    res.json({ message: 'Payout deleted' });
  } catch (err) {
    next(err);
  }
}; 