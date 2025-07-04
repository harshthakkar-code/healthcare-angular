const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');

// Create
router.post('/', payoutController.createPayout);
// Read all
router.get('/', payoutController.getPayouts);
// Read one
router.get('/:id', payoutController.getPayoutById);
// Update
router.put('/:id', payoutController.updatePayout);
// Delete
router.delete('/:id', payoutController.deletePayout);

module.exports = router; 