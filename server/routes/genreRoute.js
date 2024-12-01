const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const checkPlan = require('../middleware/checkPlan');

router.get('/', genreController.getGenres);
router.get('/with-counts', genreController.getGenresWithCounts);
router.post('/', checkPlan('paid'), genreController.createGenre);
router.put('/:id', checkPlan('paid'), genreController.updateGenre);
router.delete('/:id', checkPlan('paid'), genreController.deleteGenre);

module.exports = router;