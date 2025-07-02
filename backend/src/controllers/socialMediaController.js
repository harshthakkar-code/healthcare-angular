const SocialMedia = require('../models/SocialMedia');
const User = require('../models/User');

// Create or update social media links for a user
exports.upsertSocialMedia = async (req, res, next) => {
  try {
    const { facebook, twitter, instagram, linkedin, youtube, website } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const data = {
      userId,
      name: user.name,
      role: user.role,
      facebook,
      twitter,
      instagram,
      linkedin,
      youtube,
      website,
    };
    let social = await SocialMedia.findOneAndUpdate(
      { userId },
      data,
      { new: true, upsert: true }
    );
    res.json(social);
  } catch (err) {
    next(err);
  }
};

// Get social media links by user
exports.getSocialMediaByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const social = await SocialMedia.findOne({ userId });
    if (!social) return res.status(404).json({ message: 'Not found' });
    res.json(social);
  } catch (err) {
    next(err);
  }
};

// Delete social media links for a user
exports.deleteSocialMedia = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await SocialMedia.findOneAndDelete({ userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}; 