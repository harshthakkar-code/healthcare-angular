const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/public/docterlist', doctorController.getDoctorListWithReviews);
router.get('/public', doctorController.getDoctors);
router.get('/public/:id', doctorController.getDoctorDetails);
router.get('/by-user/:userId', doctorController.getDoctorByUserId);
router.use(auth, role('doctor'));
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);
router.post('/schedule', doctorController.createSchedule);
router.get('/appointments', doctorController.getAppointments);
router.put('/appointments/:id', doctorController.updateAppointment);
router.get('/earnings', doctorController.getEarnings);
router.post('/appointments', doctorController.createAppointment);
router.get('/appointments/doctor/:doctorId', doctorController.getAppointmentsByDoctor);
router.get('/appointments/all', doctorController.getAllAppointments);
router.get('/appointments/patient/:patientId', doctorController.getAppointmentsByPatient);
router.put('/appointments/:id/status', doctorController.updateAppointmentStatus);
router.get('/patients-with-appointments', doctorController.getPatientsWithAppointments);

module.exports = router; 