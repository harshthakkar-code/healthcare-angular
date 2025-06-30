const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

// Create slots (bulk)
router.post('/', slotController.createSlots);

// Get slots for a doctor (optionally by date)
router.get('/:doctorId', slotController.getSlots);

// Update a slot
router.put('/:slotId', slotController.updateSlot);

// Delete a slot
router.delete('/:slotId', slotController.deleteSlot);

module.exports = router; 