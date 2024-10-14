const express = require('express');
const { register, confirmEmail, login } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/confirm/:token', confirmEmail);

module.exports = router;