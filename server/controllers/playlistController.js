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
  dbHelpers.handleQuery(
    'SELECT * FROM playlists ORDER BY created_at DESC',
    [],
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

  dbHelpers.handleQuery(
    'DELETE FROM playlists_beats WHERE playlist_id = ?',
    [id],
    res,
    'All beats removed from playlist successfully'
  ).then(() => {
    dbHelpers.handleQuery(
      'DELETE FROM playlists WHERE id = ?',
      [id],
      res,
      'Playlist deleted successfully'
    );
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the playlist' });
  });
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

const getBeatsInPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  dbHelpers.handleQuery(
    'SELECT b.*, pb.beat_order FROM beats b INNER JOIN playlists_beats pb ON b.id = pb.beat_id WHERE pb.playlist_id = ? ORDER BY pb.beat_order',
    [playlist_id],
    res,
    null,
    true
  );
};

const addBeatsToPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  const { beatIds } = req.body;

  const insertValues = beatIds.map(beatId => [playlist_id, beatId]);

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    db.query('UPDATE playlists_beats SET beat_order = beat_order + 1 WHERE playlist_id = ?', [playlist_id], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'An error occurred while updating the beat order' });
        });
      }

      const checkAndInsertPromises = insertValues.map(([playlistId, beatId]) =>
        new Promise((resolve, reject) => {
          db.query('SELECT 1 FROM playlists_beats WHERE playlist_id = ? AND beat_id = ?', [playlistId, beatId], (err, results) => {
            if (err) {
              return reject(err);
            }
            if (results.length === 0) {
              db.query('INSERT INTO playlists_beats (playlist_id, beat_id, beat_order) VALUES (?, ?, 0)', [playlistId, beatId], (err) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
            } else {
              resolve();
            }
          });
        })
      );

      Promise.all(checkAndInsertPromises)
        .then(() => {
          db.commit(err => {
            if (err) {
              console.error(err);
              db.rollback(() => {
                res.status(500).json({ error: 'An error occurred while committing the transaction' });
              });
            } else {
              res.status(201).json({ message: 'Beats added to playlist successfully, duplicates avoided' });
            }
          });
        })
        .catch(err => {
          console.error(err);
          db.rollback(() => {
            res.status(500).json({ error: 'An error occurred while adding the beats to the playlist' });
          });
        });
    });
  });
};

const updateBeatOrderInPlaylist = (req, res) => {
  const { playlist_id } = req.params;
  const { beatOrders } = req.body;

  const queries = beatOrders.map(({ id, order }) => {
    return dbHelpers.handleQuery(
      'UPDATE playlists_beats SET beat_order = ? WHERE playlist_id = ? AND beat_id = ?',
      [order, playlist_id, id],
      res,
      null
    );
  });

  Promise.all(queries)
    .then(() => res.json({ message: 'Beat order updated successfully' }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the beat order' });
    });
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

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addBeatToPlaylist,
  removeBeatFromPlaylist,
  getBeatsInPlaylist,
  addBeatsToPlaylist,
  updateBeatOrderInPlaylist,
  removeAllBeatsFromPlaylist
};