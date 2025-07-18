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
  console.log('Received Stripe webhook event');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe event:', event.type);

  if (event.type === 'payment_intent.succeeded') {
    const piId = event.data.object.id;
    const paymentIntent = await stripe.paymentIntents.retrieve(piId, { expand: ['charges'] });

    let charge = null;
    if (paymentIntent.latest_charge) {
      try {
        charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      } catch (e) {
        console.error('Failed to retrieve latest charge:', e);
      }
    }

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

    if (transaction && transaction.appointment) {
      const appointment = await Appointment.findById(transaction.appointment).populate('doctor patient');
      if (!appointment) {
        console.error('No appointment found for transaction:', transaction._id);
      }

      if (appointment) {
        try {
          const InvoiceModel = require('../models/Invoice');
          // Check for existing invoice for this transaction
          const existingInvoice = await InvoiceModel.findOne({ transaction: transaction._id });
          if (existingInvoice) {
            console.log('Invoice already exists for transaction:', transaction._id);
            return res.status(200).json({ received: true });
          }
          // Use unique invoice number
          const invoiceNo = `#INV${Date.now()}`;
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
              details: charge?.payment_method_details?.card?.last4
                ? `**** **** **** ${charge.payment_method_details.card.last4}`
                : '',
              bank: charge?.payment_method_details?.card?.brand || '',
              expiry: charge?.payment_method_details?.card?.exp_month && charge?.payment_method_details?.card?.exp_year
                ? `${charge.payment_method_details.card.exp_month}/${charge.payment_method_details.card.exp_year}`
                : ''
            },
            receiptUrl: charge?.receipt_url || '',
            customer: {
              name: charge?.billing_details?.name || '',
              email: charge?.billing_details?.email || ''
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
            doctor: appointment.doctor,
            patient: appointment.patient,
            invoiceNo: invoiceNo
          };

          await InvoiceModel.create(invoiceData);
          console.log('Invoice created for transaction:', transaction._id);

          if (appointment.slot) {
            const Slot = require('../models/Slot');
            await Slot.findByIdAndUpdate(appointment.slot, { status: 'booked' });
            console.log('Slot status updated to booked:', appointment.slot);
          }

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
    const transaction = await Transaction.findOne({ reference: session.id });

    if (transaction) {
      transaction.paymentIntentId = session.payment_intent;
      transaction.stripeStatus = 'completed';
      await transaction.save();
      console.log('Transaction updated with paymentIntentId:', session.payment_intent);

      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['charges'] });

      let charge = null;
      if (paymentIntent.latest_charge) {
        try {
          charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        } catch (e) {
          console.error('Failed to retrieve charge (session.completed):', e);
        }
      }

      if (paymentIntent.status === 'succeeded') {
        const InvoiceModel = require('../models/Invoice');
        // Check for existing invoice for this transaction
        const existingInvoice = await InvoiceModel.findOne({ transaction: transaction._id });
        if (existingInvoice) {
          console.log('Invoice already exists for transaction:', transaction._id);
          return res.status(200).json({ received: true });
        }
        // Use unique invoice number
        const invoiceNo = `#INV${Date.now()}`;
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
                details: charge?.payment_method_details?.card?.last4
                  ? `**** **** **** ${charge.payment_method_details.card.last4}`
                  : '',
                bank: charge?.payment_method_details?.card?.brand || '',
                expiry: charge?.payment_method_details?.card?.exp_month && charge?.payment_method_details?.card?.exp_year
                  ? `${charge.payment_method_details.card.exp_month}/${charge.payment_method_details.card.exp_year}`
                  : ''
              },
              receiptUrl: charge?.receipt_url || '',
              customer: {
                name: charge?.billing_details?.name || '',
                email: charge?.billing_details?.email || ''
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
              doctor: appointment.doctor,
              patient: appointment.patient,
              invoiceNo: invoiceNo
            };
            await InvoiceModel.create(invoiceData);
            console.log('Invoice created for transaction (from session.completed):', transaction._id);

            if (appointment.slot) {
              const Slot = require('../models/Slot');
              await Slot.findByIdAndUpdate(appointment.slot, { status: 'booked' });
              console.log('Slot status updated to booked:', appointment.slot);
            }

            appointment.status = 'pending';
            await appointment.save();
            console.log('Appointment status updated to pending:', appointment._id);
          } catch (err) {
            console.error('Error creating invoice (from session.completed):', err);
          }
        }
      }
    } else {
      console.error('No transaction found for session:', session.id);
    }
  }

  res.status(200).json({ received: true });
};


// Fetch Stripe PaymentIntent details by ID
exports.getStripePaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(id, { expand: ['charges'] });
    let latest_charge_details = null;
    if (paymentIntent.latest_charge) {
      try {
        latest_charge_details = await stripe.charges.retrieve(paymentIntent.latest_charge);
      } catch (e) {
        latest_charge_details = null;
      }
    }
    const charge = latest_charge_details;
    const merged = {
      id: paymentIntent.id,
      amount: (paymentIntent.amount / 100).toFixed(2),
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000),
      card: charge && charge.payment_method_details && charge.payment_method_details.card ? {
        brand: charge.payment_method_details.card.brand,
        last4: charge.payment_method_details.card.last4,
        exp_month: charge.payment_method_details.card.exp_month,
        exp_year: charge.payment_method_details.card.exp_year,
        country: charge.payment_method_details.card.country
      } : null,
      customer: {
        name: charge?.billing_details?.name || null,
        email: charge?.billing_details?.email || null
      },
      receipt_url: charge?.receipt_url || null,
      statement_descriptor: charge?.calculated_statement_descriptor || paymentIntent.statement_descriptor,
      description: paymentIntent.description,
      charge_id: charge?.id || null,
      charge_status: charge?.status || null
    };
    res.json(merged);
  } catch (err) {
    next(err);
  }
};

// Fetch Stripe Charge details by ID
exports.getStripeChargeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const charge = await stripe.charges.retrieve(id);
    res.json(charge);
  } catch (err) {
    next(err);
  }
};
// Reusable refund function
async function refundTransactionById(id) {
  const transaction = await Transaction.findById(id);
  if (!transaction) throw new Error('Transaction not found');
  if (transaction.status !== 'paid') throw new Error('Only paid transactions can be refunded.');

  const paymentIntentId = transaction.paymentIntentId;
  if (!paymentIntentId) throw new Error('No paymentIntentId found for this transaction.');

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: Math.round(transaction.amount * 100),
  });

  transaction.status = 'refunded';
  transaction.stripeStatus = 'refunded';
  transaction.refundId = refund.id;
  await transaction.save();
  console.log(transaction)

  // return { refund, transaction };
  return { transaction };

}

exports.refundTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await refundTransactionById(id);
    console.log(result)
    res.json({ message: 'Refund processed', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}; 