const Specialization = require('../models/Specialization');

// Create one or multiple specializations for a doctor
exports.createSpecialization = async (req, res, next) => {
  try {
    const { doctorId, specializations } = req.body;
    if (!doctorId || !Array.isArray(specializations)) {
      return res.status(400).json({ message: 'doctorId and specializations array required' });
    }
    // Each specialization: { name, experience, services }
    const docs = specializations.map(s => ({ ...s, doctorId }));
    const created = await Specialization.insertMany(docs);
    res.status(201).json(created);
  } catch (err) { next(err); }
};

// Get all specializations, or by doctorId
exports.getSpecializations = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    const query = doctorId ? { doctorId } : {};
    const specs = await Specialization.find(query);
    res.json(specs);
  } catch (err) { next(err); }
};

// Update a specialization (including services)
exports.updateSpecialization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Specialization.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

// Delete a specialization
exports.deleteSpecialization = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Specialization.findByIdAndDelete(id);
    res.json({ message: 'Specialization deleted' });
  } catch (err) { next(err); }
};

// Add a service to a specialization
exports.addService = async (req, res, next) => {
  try {
    const { id } = req.params; // specialization id
    const { name, price, about } = req.body;
    const updated = await Specialization.findByIdAndUpdate(
      id,
      { $push: { services: { name, price, about } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
};

// Update a service in a specialization
exports.updateService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    const { name, price, about } = req.body;
    const updated = await Specialization.findOneAndUpdate(
      { _id: id, 'services._id': serviceId },
      { $set: { 'services.$.name': name, 'services.$.price': price, 'services.$.about': about } },
      { new: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
};

// Delete a service from a specialization
exports.deleteService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    const updated = await Specialization.findByIdAndUpdate(
      id,
      { $pull: { services: { _id: serviceId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
}; 