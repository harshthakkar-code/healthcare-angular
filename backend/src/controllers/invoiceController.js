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
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
}; 