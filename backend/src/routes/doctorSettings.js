const express = require('express');
const router = express.Router();
const doctorSettingsController = require('../controllers/doctorSettingsController');
const auth = require('../middlewares/auth');

// Upsert doctor settings (create/update)
router.post('/', auth, doctorSettingsController.upsertSettings);
// Get settings by doctorId
router.get('/:doctorId', doctorSettingsController.getSettingsByDoctor);
// Delete settings for a doctor
router.delete('/', auth, doctorSettingsController.deleteSettings);

module.exports = router; 