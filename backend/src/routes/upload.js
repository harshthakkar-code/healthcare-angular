const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');

router.post('/document', upload.single('file'), uploadController.uploadDocument);

module.exports = router;

 