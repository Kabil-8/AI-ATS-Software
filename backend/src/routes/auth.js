const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

router.post('/2fa/setup', protect, authController.setupTwoFactor);
router.post('/2fa/verify', protect, authController.verifyTwoFactor);

module.exports = router;
