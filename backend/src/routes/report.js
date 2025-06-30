const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/:patientId', auth, role('doctor', 'admin'), reportController.getReports);

module.exports = router; 