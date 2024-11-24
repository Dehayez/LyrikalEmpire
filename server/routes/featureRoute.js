const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');

router.get('/', featureController.getFeatures);
router.get('/with-counts', featureController.getFeaturesWithCounts);
router.post('/', featureController.createFeature);
router.put('/:id', featureController.updateFeature);
router.delete('/:id', featureController.deleteFeature);

module.exports = router;