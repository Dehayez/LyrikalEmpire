const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

router.post('/', playlistController.createPlaylist);
router.get('/', playlistController.getPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.post('/:playlist_id/beats/:beat_id', playlistController.addBeatToPlaylist);
router.delete('/:playlist_id/beats/:beat_id', playlistController.removeBeatFromPlaylist);
router.get('/:playlist_id/beats', playlistController.getBeatsInPlaylist);
router.post('/:playlist_id/beats', playlistController.addBeatsToPlaylist);
router.put('/:playlist_id/beats/order', playlistController.updateBeatOrderInPlaylist);
router.delete('/:id/beats', playlistController.removeAllBeatsFromPlaylist);

module.exports = router;