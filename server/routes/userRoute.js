const express = require('express');
const passport = require('passport');
const { register, login, requestPasswordReset, verifyConfirmationCode, verifyResetCode, resetPassword, verifyToken, getUserDetails, updateUserDetails, getUserById } = require('../controllers/userController');
const tokenRoutes = require('./tokenRoute');
const router = express.Router();

router.post('/register', register);
router.post('/verify-confirmation-code', verifyConfirmationCode);
router.post('/verify-reset-code', verifyResetCode); 
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-token', verifyToken);
router.get('/me', getUserDetails);
router.put('/me', updateUserDetails);
router.get('/:id', getUserById);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});

router.use('/token', tokenRoutes);

module.exports = router;