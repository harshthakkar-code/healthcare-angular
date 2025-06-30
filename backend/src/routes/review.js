const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.post('/', auth, role('patient'), reviewController.createReview);
router.get('/doctor/:doctorId', reviewController.getReviewsForDoctor);

module.exports = router; 