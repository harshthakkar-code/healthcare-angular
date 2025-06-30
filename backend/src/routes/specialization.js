const express = require('express');
const router = express.Router();
const specializationController = require('../controllers/specializationController');

router.post('/', specializationController.createSpecialization);
router.get('/', specializationController.getSpecializations);
router.put('/:id', specializationController.updateSpecialization);
router.delete('/:id', specializationController.deleteSpecialization);

module.exports = router; 