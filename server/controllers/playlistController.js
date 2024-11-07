const dbHelpers = require('../helpers/dbHelpers');

const createPlaylist = (req, res) => {
  const { title, description } = req.body;
  dbHelpers.handleQuery(
    'INSERT INTO playlists (title, description) VALUES (?, ?)',
    [title, description],
    res,
    'Playlist created successfully',
    false
  );
};

const getPlaylists = (req, res) => {
  const { user_id } = req.query;
  dbHelpers.handleQuery(
    'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC',
    [user_id],
    res,
    null,
    true
  );
};

const getPlaylistById = (req, res) => {
  const { id } = req.params;
  dbHelpers.handleQuery(
    'SELECT * FROM playlists WHERE id = ?',
    [id],
    res,
    null,
    true
  );
};

const updatePlaylist = (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  dbHelpers.handleQuery(
    'UPDATE playlists SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
    res,
    'Playlist updated successfully'
  );
};

const deletePlaylist = (req, res) => {
  const { id } = req.params;
  const queries = [
    { query: 'DELETE FROM playlists_beats WHERE playlist_id = ?', params: [id] },
    { query: 'DELETE FROM playlists WHERE id = ?', params: [id] }
  ];
  dbHelpers.handleTransaction(queries, res, 'Playlist and all associated beats deleted successfully');
};

const addBeatToPlaylist = (req, res) => {
  const { playlist_id, beat_id } = req.params;
  dbHelpers.handleQuery(
    'INSERT INTO playlists_beats (playlist_id, beat_id) VALUES (?, ?)',
    [playlist_id, beat_id],
    res,
    'Beat added to playlist successfully'
  );
};

const removeBeatFromPlaylist = (req, res) => {
  const { playlist_id, beat_id } = req.params;
  dbHelpers.handleQuery(
    'DELETE FROM playlists_beats WHERE playlist_id = ? AND beat_id = ?',
    [playlist_id, beat_id],
    res,
    'Beat removed from playlist successfully'
  );
};

const updateBeatOrderInPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  const { beatOrders } = req.body;

  const queries = beatOrders.map(({ id, order }) => ({
    query: 'UPDATE playlists_beats SET beat_order = ? WHERE playlist_id = ? AND beat_id = ?',
    params: [order, playlist_id, id]
  }));

  dbHelpers.handleTransaction(queries, res, 'Beat order updated successfully');
};

const removeAllBeatsFromPlaylist = (req, res) => {
  const { id } = req.params;
  dbHelpers.handleQuery(
    'DELETE FROM playlists_beats WHERE playlist_id = ?',
    [id],
    res,
    'All beats removed from playlist successfully'
  );
};

const getBeatsInPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  dbHelpers.handleQuery(
    `SELECT b.*, pb.beat_order 
     FROM beats b 
     JOIN playlists_beats pb ON b.id = pb.beat_id 
     WHERE pb.playlist_id = ? 
     ORDER BY pb.beat_order`,
    [playlist_id],
    res,
    'Beats in playlist fetched successfully',
    true
  );
};

const addBeatsToPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  const { beatIds } = req.body;

  const queries = beatIds.map(beat_id => ({
    query: 'INSERT INTO playlists_beats (playlist_id, beat_id) VALUES (?, ?)',
    params: [playlist_id, beat_id]
  }));

  dbHelpers.handleTransaction(queries, res, 'Beats added to playlist successfully');
};

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addBeatToPlaylist,
  removeBeatFromPlaylist,
  updateBeatOrderInPlaylist,
  removeAllBeatsFromPlaylist,
  getBeatsInPlaylist,
  addBeatsToPlaylist
};