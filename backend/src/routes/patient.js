const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth, role('patient', 'admin'));
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);
router.post('/profile', patientController.createProfile);
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getAppointments);
router.post('/review/:doctorId', patientController.postReview);
router.get('/medical-records', patientController.getMedicalRecords);
router.put('/change-password', patientController.changePassword);

module.exports = router; 