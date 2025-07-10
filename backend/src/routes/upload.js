const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middlewares/auth');

// Universal image upload endpoint (protected)
router.post('/image', auth, uploadController.uploadImage);

module.exports = router;

 