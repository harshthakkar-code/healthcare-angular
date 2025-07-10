const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middlewares/auth');

// Universal image upload endpoint (protected)
router.post('/image', uploadController.uploadImage);

module.exports = router;

 