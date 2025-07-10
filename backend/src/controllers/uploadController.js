const upload = require('../utils/s3');

// Universal image upload endpoint
exports.uploadImage = [
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required.' });
      }
      res.json({ imageUrl: req.file.location });
    } catch (err) {
      next(err);
    }
  }
]; 