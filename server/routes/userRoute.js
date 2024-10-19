const express = require('express');
const { register, confirmEmail, login, resendConfirmationEmail, requestPasswordReset, resetPassword, verifyToken, getUserDetails } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/resend-confirmation', resendConfirmationEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-token', verifyToken);
router.get('/me', getUserDetails);

module.exports = router;