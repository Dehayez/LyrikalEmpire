const express = require('express');
const { register, confirmEmail, login } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.get('/confirm/:token', confirmEmail);
router.post('/login', login);

module.exports = router;