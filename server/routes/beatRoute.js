const express = require('express');
const router = express.Router();
const beatController = require('../controllers/beatController');
const { upload } = require('../config/multer');
const checkPlan = require('../middleware/checkPlan');

router.get('/', beatController.getBeats);
router.post('/', checkPlan('paid'), upload.single('audio'), beatController.createBeat);
router.get('/:id', beatController.getBeatById);
router.put('/:id', checkPlan('paid'), upload.single('audio'), beatController.updateBeat);
router.delete('/:id', checkPlan('paid'), beatController.deleteBeat);
router.put('/:id/audio', checkPlan('paid'), upload.single('audio'), beatController.replaceAudio);
router.post('/:beat_id/:association_type', checkPlan('paid'), beatController.addAssociation);
router.delete('/:beat_id/:association_type/:association_id', checkPlan('paid'), beatController.removeAssociation);
router.get('/:beat_id/:association_type', beatController.getAssociations);
router.delete('/:beat_id/:association_type', checkPlan('paid'), beatController.removeAllAssociations);
router.get('/signed-url/:fileName', beatController.getSignedUrl);

module.exports = router;