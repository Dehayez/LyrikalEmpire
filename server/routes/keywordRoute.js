const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const checkPlan = require('../middleware/checkPlan');

router.get('/', keywordController.getKeywords);
router.get('/with-counts', keywordController.getKeywordsWithCounts);
router.post('/', checkPlan('paid'), keywordController.createKeyword);
router.put('/:id', checkPlan('paid'), keywordController.updateKeyword);
router.delete('/:id', checkPlan('paid'), keywordController.deleteKeyword);

module.exports = router;