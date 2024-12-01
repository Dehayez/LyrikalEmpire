const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');
const checkPlan = require('../middleware/checkPlan');

router.get('/:id', lyricsController.getLyricsById);
router.put('/:id', checkPlan('paid'), lyricsController.updateLyricsById);
router.post('/', checkPlan('paid'), lyricsController.createLyrics);

module.exports = router;