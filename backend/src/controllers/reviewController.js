const Review = require('../models/Review');
const DoctorProfile = require('../models/DoctorProfile');

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

// Get all reviews for a doctor (with patient info)
exports.getReviewsForDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctor: doctorId })
      .populate('patient', 'name email avatar')
      .sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : null;
    res.json({ avgRating, reviews });
  } catch (err) { next(err); }
}; 