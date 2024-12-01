const express = require('express');
const passport = require('passport');
const { register, confirmEmail, login, resendConfirmationEmail, requestPasswordReset, resetPassword, verifyToken, getUserDetails, updateUserDetails } = require('../controllers/userController');
const tokenRoutes = require('./tokenRoute');
const router = express.Router();

router.post('/register', register);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/resend-confirmation', resendConfirmationEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-token', verifyToken);
router.get('/me', getUserDetails);
router.put('/me', updateUserDetails);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

router.use('/token', tokenRoutes);

module.exports = router;