const express = require('express');
const { refreshToken } = require('../controllers/tokenController');
const router = express.Router();

router.post('/refresh-token', refreshToken);

module.exports = router;