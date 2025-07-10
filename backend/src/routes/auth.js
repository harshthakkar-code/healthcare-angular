const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, requestOtp, loginOtp, forgotPasswordRequest, forgotPasswordVerify, resetPassword, googleLogin, deleteUserCascade } = require('../controllers/authController');
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
router.put('/me', auth, updateMe);
router.post('/request-otp', requestOtp);
router.post('/login-otp', loginOtp);
router.post('/forgot-password-request', forgotPasswordRequest);
router.post('/forgot-password-verify', forgotPasswordVerify);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.delete('/user/:id', deleteUserCascade);
router.get('/test', (req, res) => {
  res.json({ message: 'Frontend and backend are connected!' });
});

module.exports = router; 