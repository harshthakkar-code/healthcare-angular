const Invoice = require('../models/Invoice');

// Helper to generate unique invoice number (e.g., #INV001)
async function generateInvoiceNo() {
  const count = await Invoice.countDocuments();
  return `#INV${(count + 1).toString().padStart(3, '0')}`;
}

exports.createInvoice = async (req, res, next) => {
  try {
    const invoiceNo = await generateInvoiceNo();
    const invoice = new Invoice({ ...req.body, invoiceNo });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) { next(err); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name email' },
          { path: 'patient', select: 'name email' }
        ]
      });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
};

// Get all invoices
exports.getAllInvoices = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, sort = '-issuedDate', search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const filter = {};
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { discount: { $regex: search, $options: 'i' } },
        // Add more fields as needed
      ];
    }
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name email' },
          { path: 'patient', select: 'name email' }
        ]
      });
    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: invoices
    });
  } catch (err) { next(err); }
};

// Get invoices by doctor ID
exports.getInvoicesByDoctor = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, sort = '-issuedDate', search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const filter = { doctor: req.params.doctorId };
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { discount: { $regex: search, $options: 'i' } },
        // Add more fields as needed
      ];
    }
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name email profileImgUrl' },
          { path: 'patient', select: 'name email profileImgUrl' }
        ]
      });
    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: invoices
    });
  } catch (err) { next(err); }
};

// Get invoices by patient ID
exports.getInvoicesByPatient = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, sort = '-issuedDate', search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const filter = { patient: req.params.patientId };
    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { discount: { $regex: search, $options: 'i' } },
        // Add more fields as needed
      ];
    }
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name email profileImgUrl' },
          { path: 'patient', select: 'name email profileImgUrl' }
        ]
      });
    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: invoices
    });
  } catch (err) { next(err); }
};

// Update invoice by id
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
};

// Delete invoice by id
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) { next(err); }
}; 