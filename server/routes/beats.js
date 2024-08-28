const express = require('express');
const router = express.Router();
const beatController = require('../controllers/beatController');
const upload = require('../config/multer');

router.get('/', beatController.getBeats);
router.post('/', upload.single('audio'), beatController.createBeat);
router.get('/:id', beatController.getBeatById);
router.put('/:id', beatController.updateBeat);
router.delete('/:id', beatController.deleteBeat);
router.post('/:beat_id/:association_type', beatController.addAssociation);
router.delete('/:beat_id/:association_type/:association_id', beatController.removeAssociation);
router.get('/:beat_id/:association_type', beatController.getAssociations);
router.delete('/:beat_id/:association_type', beatController.removeAllAssociations);

module.exports = router;