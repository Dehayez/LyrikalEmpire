const express = require('express');
const { register, confirmEmail, login, resendConfirmationEmail } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);
router.post('/resend-confirmation', resendConfirmationEmail);

module.exports = router;