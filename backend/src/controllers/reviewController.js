const Review = require('../models/Review');
const DoctorProfile = require('../models/DoctorProfile');
const ObjectId = require('mongoose').Types.ObjectId;

// Create a review for a doctor
exports.createReview = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { doctorId, rating, comment } = req.body;
    if (!doctorId || !rating) {
      return res.status(400).json({ message: 'doctorId and rating are required' });
    }
    // Prevent duplicate reviews by same patient for same doctor (optional)
    const existing = await Review.findOne({ doctor: doctorId, patient: patientId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this doctor.' });
    }
    const review = new Review({ doctor: doctorId, patient: patientId, rating, comment });
    await review.save();
    // Add review to doctor profile
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (doctorProfile) {
      doctorProfile.reviews = doctorProfile.reviews || [];
      doctorProfile.reviews.push(review._id);
      // Update avgRating
      const allReviews = await Review.find({ doctor: doctorId });
      const avgRating = allReviews.length ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) : null;
      doctorProfile.avgRating = avgRating;
      await doctorProfile.save();
    }
    // Optionally, add review to patient profile (not required for now)
    // Populate doctor and patient info in response
    const populated = await Review.findById(review._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

// Get all reviews for a doctor (with patient info) with pagination
exports.getReviewsForDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    // const page = parseInt(req.query.page) || 1;
    // const pageSize = parseInt(req.query.pageSize) || ;

    const filter = { doctor: doctorId };

    const totalReviews = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate('patient', 'name email profileImgUrl')
      .sort({ createdAt: -1 })
      // .skip((page - 1) * pageSize)
      // .limit(pageSize);

    const avgRating = totalReviews
      ? (await Review.aggregate([
          { $match: { doctor: new ObjectId(doctorId) } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ])).at(0)?.avg || null
      : null;

    res.json({ avgRating, reviews, totalReviews });
  } catch (err) { next(err); }
};

// Get all reviews (admin, paginated)
exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
      Review.find()
        .populate('doctor', 'name email profileImgUrl')
        .populate('patient', 'name email profileImgUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments()
    ]);

    res.json({ reviews, totalReviews });
  } catch (err) { next(err); }
};

// Delete a review (admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
}; 