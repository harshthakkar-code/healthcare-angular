const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth, role('admin'));
router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.getUsers);
router.put('/doctor-status/:id', adminController.updateDoctorStatus);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router; 