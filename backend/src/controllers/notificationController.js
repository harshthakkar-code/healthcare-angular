const Notification = require('../models/Notification');

exports.createNotification = async (req, res, next) => {
  try {
    const notification = new Notification({ ...req.body, user: req.user._id });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) { next(err); }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId });
    res.json(notifications);
  } catch (err) { next(err); }
}; 