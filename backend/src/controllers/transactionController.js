const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Add this import if not present

exports.createTransaction = async (req, res, next) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    // If the transaction is paid, increment totalEarned for the doctor
    if (transaction.status === 'paid') {
      await User.findByIdAndUpdate(transaction.doctor, {
        $inc: { totalEarned: transaction.amount || 0 }
      });
    }
    res.status(201).json(transaction);
  } catch (err) { next(err); }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10, search } = req.query;
    const match = {};

    if (status) match.status = status;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // Build search match
    let searchMatch = {};
    if (search) {
      searchMatch = {
        $or: [
          { 'appointment.patient.name': { $regex: search, $options: 'i' } },
          { '_id': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: '$appointment' },
      {
        $lookup: {
          from: 'users',
          localField: 'appointment.patient',
          foreignField: '_id',
          as: 'appointment.patient'
        }
      },
      { $unwind: '$appointment.patient' },
      {
        $lookup: {
          from: 'users',
          localField: 'appointment.doctor',
          foreignField: '_id',
          as: 'appointment.doctor'
        }
      },
      { $unwind: '$appointment.doctor' },
      { $addFields: { idStr: { $toString: '$_id' } } },
      // Add search match if needed
      ...(search ? [{ $match: {
        'appointment.patient.name': { $regex: search, $options: 'i' }
      }}] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ],
          total: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Transaction.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].total[0]?.count || 0;

    res.json({ total, page: parseInt(page), limit: parseInt(limit), data });
  } catch (err) { next(err); }
};

exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'patient', select: 'name email' },
          { path: 'doctor', select: 'name _id' }
        ],
        select: 'patient doctor date createdAt time service'
      });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) { next(err); }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    const prevStatus = transaction.status;
    const prevAmount = transaction.amount;
    // Update transaction fields
    Object.assign(transaction, req.body);
    await transaction.save();
    // If status changed to 'paid'
    if (prevStatus !== 'paid' && transaction.status === 'paid') {
      await User.findByIdAndUpdate(transaction.doctor, {
        $inc: { totalEarned: transaction.amount || 0 }
      });
    }
    // If status changed from 'paid' to something else
    else if (prevStatus === 'paid' && transaction.status !== 'paid') {
      await User.findByIdAndUpdate(transaction.doctor, {
        $inc: { totalEarned: -(prevAmount || 0) }
      });
    }
    res.json(transaction);
  } catch (err) { next(err); }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    // If the transaction was paid, decrement totalEarned for the doctor
    if (transaction.status === 'paid') {
      await User.findByIdAndUpdate(transaction.doctor, {
        $inc: { totalEarned: -(transaction.amount || 0) }
      });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) { next(err); }
};

exports.getTotalPaid = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ status: 'paid' });
    const totalPaid = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    res.json({ totalPaid, transactions });
  } catch (err) {
    next(err);
  }
};

// Get all transactions for a user (doctor or patient)
exports.getTransactionsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'doctor', 'patient', or undefined
    let appointmentQuery = {};
    if (role === 'doctor') {
      appointmentQuery.doctor = userId;
    } else if (role === 'patient') {
      appointmentQuery.patient = userId;
    } else {
      appointmentQuery = { $or: [ { doctor: userId }, { patient: userId } ] };
    }
    // Find all relevant appointments
    const appointments = await Appointment.find(appointmentQuery).select('_id');
    const appointmentIds = appointments.map(a => a._id);
    // Find all transactions for these appointments
    const transactions = await Transaction.find({ appointment: { $in: appointmentIds } })
      .populate({
        path: 'appointment',
        populate: [
          { path: 'patient', select: 'name email' },
          { path: 'doctor', select: 'name _id' }
        ],
        select: 'patient doctor date createdAt time service'
      });
    res.json({ total: transactions.length, data: transactions });
  } catch (err) { next(err); }
}; 