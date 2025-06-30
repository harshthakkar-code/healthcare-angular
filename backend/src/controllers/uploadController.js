exports.uploadDocument = (req, res) => {
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
}; 