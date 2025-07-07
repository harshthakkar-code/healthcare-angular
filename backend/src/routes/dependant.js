const express = require('express');
const router = express.Router();
const dependantController = require('../controllers/dependantController');

// Create a new dependant
router.post('/', dependantController.createDependant);

// Get all dependants (with optional userId filter)
router.get('/', dependantController.getDependants);

// Get a single dependant by ID
router.get('/:id', dependantController.getDependantById);

// Update a dependant by ID
router.put('/:id', dependantController.updateDependant);

// Delete a dependant by ID
router.delete('/:id', dependantController.deleteDependant);

module.exports = router; 