const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Add this import if not present
const stripe = require('../utils/stripe');
const Invoice = require('../models/Invoice');

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

// Create Stripe PaymentIntent and Transaction
exports.createStripePayment = async (req, res, next) => {
  try {
    const { appointment, doctor, patient, amount, currency = 'usd', paymentDate, ...rest } = req.body;
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata: {
        appointment,
        doctor,
        patient,
        paymentDate,
        ...rest
      }
    });
    // Create Transaction in DB
    const transaction = await Transaction.create({
      appointment,
      amount,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      stripeStatus: paymentIntent.status,
      reference: paymentIntent.id
    });
    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      transaction
    });
  } catch (err) { next(err); }
};

// Create Stripe Checkout Session
exports.createStripeCheckoutSession = async (req, res, next) => {
  try {
    const { appointment, doctor, patient, amount, successUrl, cancelUrl } = req.body;
    console.log('Creating Stripe Checkout Session with:', {
      appointment,
      doctor,
      patient,
      amount,
      successUrl,
      cancelUrl
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Appointment Payment',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointment,
        doctor,
        patient
      }
    });
    // Optionally, create a Transaction in DB with status 'pending' and session.id
    await Transaction.create({
      appointment,
      amount,
      status: 'pending',
      paymentIntentId: session.payment_intent,
      stripeStatus: 'pending',
      reference: session.id
    });
    res.json({ url: session.url });
  } catch (err) { next(err); }
};

// Stripe Webhook Handler
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('Received Stripe event:', event.type);
  // Handle event types
  if (event.type === 'payment_intent.succeeded') {
    const piId = event.data.object.id;
    // Fetch the PaymentIntent from Stripe, expanding charges
    const paymentIntent = await stripe.paymentIntents.retrieve(piId, { expand: ['charges'] });
    console.log("", paymentIntent);
    // Defensive: ensure charges are present
    const charge = paymentIntent.charges?.data?.[0];
    // Update transaction to paid
    const transaction = await Transaction.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: 'paid',
        stripeStatus: paymentIntent.status,
        reference: paymentIntent.id
      },
      { new: true }
    );
    if (!transaction) {
      console.error('No transaction found for paymentIntent:', paymentIntent.id);
    }
    // Create invoice if transaction and appointment exist
    if (transaction && transaction.appointment) {
      const appointment = await Appointment.findById(transaction.appointment).populate('doctor patient');
      if (!appointment) {
        console.error('No appointment found for transaction:', transaction._id);
      }
      if (appointment) {
        try {
          // Fill invoice fields (customize as needed)
          const invoiceData = {
            issuedDate: new Date(),
            billingFrom: {
              name: appointment.doctor?.name || 'Clinic',
              address: appointment.doctor?.address || '',
              extra: ''
            },
            billingTo: {
              name: appointment.patient?.name || '',
              address: appointment.patient?.address || '',
              extra: ''
            },
            paymentMethod: {
              type: 'Card',
              details: charge?.payment_method_details?.card?.last4 ? `**** **** **** ${charge.payment_method_details.card.last4}` : '',
              bank: charge?.payment_method_details?.card?.brand || ''
            },
            items: [
              {
                description: appointment.service || 'Consultation',
                quantity: 1,
                vat: '$0',
                total: transaction.amount
              }
            ],
            subtotal: transaction.amount,
            discount: '0%',
            totalAmount: transaction.amount,
            appointment: appointment._id,
            transaction: transaction._id,
            otherInfo: appointment.reason || '',
            doctor: appointment.doctor, // add doctor user id
            patient: appointment.patient // add patient user id
          };
          // Generate invoice number
          const InvoiceModel = require('../models/Invoice');
          const count = await InvoiceModel.countDocuments();
          invoiceData.invoiceNo = `#INV${(count + 1).toString().padStart(3, '0')}`;
          await InvoiceModel.create(invoiceData);
          console.log('Invoice created for transaction:', transaction._id);
          // Book the slot if appointment has a slot
          if (appointment.slot) {
            const Slot = require('../models/Slot');
            await Slot.findByIdAndUpdate(appointment.slot, { status: 'booked' });
            console.log('Slot status updated to booked:', appointment.slot);
          }
          // Update appointment status to 'pending' after payment
          appointment.status = 'pending';
          await appointment.save();
          console.log('Appointment status updated to pending:', appointment._id);
        } catch (err) {
          console.error('Error creating invoice:', err);
        }
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Transaction.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        stripeStatus: paymentIntent.status
      }
    );
  } else if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Find the transaction by session.id (reference)
    const transaction = await Transaction.findOne({ reference: session.id });
    if (transaction) {
      // Update the transaction with the paymentIntentId
      transaction.paymentIntentId = session.payment_intent;
      transaction.stripeStatus = 'completed';
      await transaction.save();
      console.log('Transaction updated with paymentIntentId:', session.payment_intent);

      // Fetch the PaymentIntent from Stripe, expanding charges
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['charges'] });
      const charge = paymentIntent.charges?.data?.[0];
      if (paymentIntent.status === 'succeeded') {
        // Check if invoice already exists for this transaction
        const InvoiceModel = require('../models/Invoice');
        const existingInvoice = await InvoiceModel.findOne({ transaction: transaction._id });
        if (!existingInvoice && transaction.appointment) {
          const appointment = await Appointment.findById(transaction.appointment).populate('doctor patient');
          if (appointment) {
            try {
              const invoiceData = {
                issuedDate: new Date(),
                billingFrom: {
                  name: appointment.doctor?.name || 'Clinic',
                  address: appointment.doctor?.address || '',
                  extra: ''
                },
                billingTo: {
                  name: appointment.patient?.name || '',
                  address: appointment.patient?.address || '',
                  extra: ''
                },
                paymentMethod: {
                  type: 'Card',
                  details: charge?.payment_method_details?.card?.last4 ? `**** **** **** ${charge.payment_method_details.card.last4}` : '',
                  bank: charge?.payment_method_details?.card?.brand || ''
                },
                items: [
                  {
                    description: appointment.service || 'Consultation',
                    quantity: 1,
                    vat: '$0',
                    total: transaction.amount
                  }
                ],
                subtotal: transaction.amount,
                discount: '0%',
                totalAmount: transaction.amount,
                appointment: appointment._id,
                transaction: transaction._id,
                otherInfo: appointment.reason || '',
                doctor: appointment.doctor, // add doctor user id
                patient: appointment.patient // add patient user id
              };
              const count = await InvoiceModel.countDocuments();
              invoiceData.invoiceNo = `#INV${(count + 1).toString().padStart(3, '0')}`;
              await InvoiceModel.create(invoiceData);
              console.log('Invoice created for transaction (from session.completed):', transaction._id);
              // Book the slot if appointment has a slot
              if (appointment.slot) {
                const Slot = require('../models/Slot');
                await Slot.findByIdAndUpdate(appointment.slot, { status: 'booked' });
                console.log('Slot status updated to booked:', appointment.slot);
              }
              // Update appointment status to 'pending' after payment
              appointment.status = 'pending';
              await appointment.save();
              console.log('Appointment status updated to pending:', appointment._id);
            } catch (err) {
              console.error('Error creating invoice (from session.completed):', err);
            }
          }
        }
      }
    } else {
      console.error('No transaction found for session:', session.id);
    }
  }
  res.status(200).json({ received: true });
}; 