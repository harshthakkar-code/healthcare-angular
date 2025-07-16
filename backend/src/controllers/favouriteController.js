const Favourite = require('../models/Favourite');
const User = require('../models/User');

// Create a new favourite
exports.createFavourite = async (req, res) => {
  try {
    console.log(req.body)
    const favourite = new Favourite(req.body);
    await favourite.save();
    res.status(201).json(favourite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all favourites (with optional search and pagination, including doctor name search)
exports.getFavourites = async (req, res) => {
  try {
    const query = {};
    if (req.query.patientId) query.patientId = req.query.patientId;
    if (req.query.doctorId) query.doctorId = req.query.doctorId;
    if (req.query.date) query.date = req.query.date;
    if (req.query.favourites !== undefined) query.favourites = req.query.favourites === 'true';

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    let favouritesQuery = Favourite.find(query).populate('patientId doctorId');
    let totalQuery = Favourite.countDocuments(query);

    // If searching by doctor name
    if (req.query.search) {
      // First, get all doctor users matching the name
      const doctorUsers = await User.find({
        name: { $regex: req.query.search, $options: 'i' }
      }).select('_id');
      const doctorUserIds = doctorUsers.map(u => u._id.toString());
      // Add to query
      favouritesQuery = Favourite.find({ ...query, doctorId: { $in: doctorUserIds } }).populate('patientId doctorId');
      totalQuery = Favourite.countDocuments({ ...query, doctorId: { $in: doctorUserIds } });
    }

    const total = await totalQuery;
    const favourites = await favouritesQuery.skip(skip).limit(limit);

    res.json({ total, page, limit, data: favourites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single favourite by ID
exports.getFavouriteById = async (req, res) => {
  try {
    const favourite = await Favourite.findById(req.params.id).populate('patientId doctorId');
    if (!favourite) return res.status(404).json({ error: 'Favourite not found' });
    res.json(favourite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a favourite by ID
exports.updateFavourite = async (req, res) => {
  try {
    const favourite = await Favourite.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!favourite) return res.status(404).json({ error: 'Favourite not found' });
    res.json(favourite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a favourite by ID
exports.deleteFavourite = async (req, res) => {
  try {
    const favourite = await Favourite.findByIdAndDelete(req.params.id);
    if (!favourite) return res.status(404).json({ error: 'Favourite not found' });
    res.json({ message: 'Favourite deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /favourites/batch-status
exports.getBatchFavouriteStatus = async (req, res) => {
  try {
    const { patientId, doctorIds } = req.body;
    if (!patientId || !Array.isArray(doctorIds)) {
      return res.status(400).json({ error: 'patientId and doctorIds are required' });
    }
    const favourites = await Favourite.find({
      patientId,
      doctorId: { $in: doctorIds },
      favourites: true
    });
    // Map doctorId to favourite object (or null)
    const result = {};
    doctorIds.forEach(id => {
      result[id] = null;
    });
    favourites.forEach(fav => {
      result[fav.doctorId.toString()] = fav;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 