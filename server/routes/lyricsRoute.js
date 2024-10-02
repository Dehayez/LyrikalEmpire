const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');

router.get('/:id', lyricsController.getLyricsById);
router.put('/:id', lyricsController.updateLyricsById);
router.post('/', lyricsController.createLyrics);

module.exports = router;