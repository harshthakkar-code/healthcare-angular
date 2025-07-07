const Dependant = require('../models/Dependant');

// Create a new dependant
exports.createDependant = async (req, res) => {
  try {
    const dependant = new Dependant(req.body);
    await dependant.save();
    res.status(201).json(dependant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all dependants (optionally filter by userId)
exports.getDependants = async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) query.userId = req.query.userId;
    const dependants = await Dependant.find(query).populate('userId');
    res.json(dependants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single dependant by ID
exports.getDependantById = async (req, res) => {
  try {
    const dependant = await Dependant.findById(req.params.id).populate('userId');
    if (!dependant) return res.status(404).json({ error: 'Dependant not found' });
    res.json(dependant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a dependant by ID
exports.updateDependant = async (req, res) => {
  try {
    const dependant = await Dependant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dependant) return res.status(404).json({ error: 'Dependant not found' });
    res.json(dependant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a dependant by ID
exports.deleteDependant = async (req, res) => {
  try {
    const dependant = await Dependant.findByIdAndDelete(req.params.id);
    if (!dependant) return res.status(404).json({ error: 'Dependant not found' });
    res.json({ message: 'Dependant deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 