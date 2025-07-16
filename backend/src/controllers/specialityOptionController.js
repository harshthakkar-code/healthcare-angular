const SpecialityOption = require('../models/SpecialityOption');

// Create a new speciality option
exports.createSpecialityOption = async (req, res, next) => {
  try {
    const { name, description , image } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const specialityOption = new SpecialityOption({
      name,
      description,
      image,
      createdBy: req.user._id
    });
    await specialityOption.save();
    res.status(201).json(specialityOption);
  } catch (err) { next(err); }
};

// Get all speciality options with pagination
exports.getSpecialityOptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [options, totalData] = await Promise.all([
      SpecialityOption.find().populate('createdBy', 'name').skip(skip).limit(limit),
      SpecialityOption.countDocuments()
    ]);
    console.log('SpecialityOptions:', options, 'Total:', totalData); // Debug log
    res.json({ data: options, totalData });
  } catch (err) { next(err); }
};

// Update a speciality option
exports.updateSpecialityOption = async (req, res, next) => {
  try {
    const { name, description , image } = req.body;
    const option = await SpecialityOption.findByIdAndUpdate(
      req.params.id,
      { name, description , image },
      { new: true }
    );
    if (!option) return res.status(404).json({ message: 'Speciality option not found' });
    res.json(option);
  } catch (err) { next(err); }
};

// Delete a speciality option
exports.deleteSpecialityOption = async (req, res, next) => {
  try {
    const option = await SpecialityOption.findByIdAndDelete(req.params.id);
    if (!option) return res.status(404).json({ message: 'Speciality option not found' });
    res.json({ message: 'Speciality option deleted' });
  } catch (err) { next(err); }
}; 