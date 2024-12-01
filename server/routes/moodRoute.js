const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const checkPlan = require('../middleware/checkPlan');

router.get('/', moodController.getMoods);
router.get('/with-counts', moodController.getMoodsWithCounts);
router.post('/', checkPlan('paid'), moodController.createMood);
router.put('/:id', checkPlan('paid'), moodController.updateMood);
router.delete('/:id', checkPlan('paid'), moodController.deleteMood);

module.exports = router;