const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');

router.get('/:id', lyricsController.getLyricsById);

module.exports = router;