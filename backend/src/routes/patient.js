const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth, role('patient'));
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getAppointments);
router.post('/review/:doctorId', patientController.postReview);
router.get('/medical-records', patientController.getMedicalRecords);

module.exports = router; 