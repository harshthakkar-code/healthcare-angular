const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'certFile', maxCount: 1 },
  { name: 'photoID', maxCount: 1 },
  { name: 'employmentProof', maxCount: 1 }
]), register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/test', (req, res) => {
  res.json({ message: 'Frontend and backend are connected!' });
});

module.exports = router; 