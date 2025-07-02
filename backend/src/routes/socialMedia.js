const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
const auth = require('../middlewares/auth');

// Upsert social media links for logged-in user
router.post('/', auth, socialMediaController.upsertSocialMedia);
// Get social media links by userId (public)
router.get('/:userId', socialMediaController.getSocialMediaByUser);
// Delete social media links for logged-in user
router.delete('/', auth, socialMediaController.deleteSocialMedia);

module.exports = router; 