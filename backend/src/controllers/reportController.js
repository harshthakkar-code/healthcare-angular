const Report = require('../models/Report');

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ patient: req.params.patientId });
    res.json(reports);
  } catch (err) { next(err); }
}; 