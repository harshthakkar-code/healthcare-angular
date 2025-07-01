const express = require('express');
const router = express.Router();
const specializationController = require('../controllers/specializationController');

router.post('/', specializationController.createSpecialization);
router.get('/', specializationController.getSpecializations);
router.put('/:id', specializationController.updateSpecialization);
router.delete('/:id', specializationController.deleteSpecialization);
router.post('/:id/services', specializationController.addService);
router.put('/:id/services/:serviceId', specializationController.updateService);
router.delete('/:id/services/:serviceId', specializationController.deleteService);

module.exports = router; 