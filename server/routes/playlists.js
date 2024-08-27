const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create Playlist
router.post('/', (req, res) => {
  const { title, description } = req.body;
  db.query('INSERT INTO playlists (title, description) VALUES (?, ?)', [title, description], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the playlist' });
    } else {
      res.status(201).json({ message: 'Playlist created successfully', playlistId: results.insertId });
    }
  });
});

// Get Playlists
router.get('/', (req, res) => {
  db.query('SELECT * FROM playlists ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching playlists' });
    } else {
      res.json(results);
    }
  });
});

// Get Playlist by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM playlists WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching the playlist' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Playlist not found' });
      } else {
        res.json(results[0]);
      }
    }
  });
});
  
// Update Playlist
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  db.query('UPDATE playlists SET title = ?, description = ? WHERE id = ?', [title, description, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the playlist' });
    } else {
      res.json({ message: 'Playlist updated successfully' });
    }
  });
});

// Delete Playlist and associated beats
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // First, delete all beats associated with the playlist
  db.query('DELETE FROM playlists_beats WHERE playlist_id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while removing beats from the playlist' });
    } else {
      // After successfully deleting beats, delete the playlist
      db.query('DELETE FROM playlists WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'An error occurred while deleting the playlist' });
        } else {
          res.json({ message: 'Playlist deleted successfully' });
        }
      });
    }
  });
});

// CRUD for playlists_beats
// Add Beat to Playlist
router.post('/:playlist_id/beats/:beat_id', (req, res) => {
  const { playlist_id, beat_id } = req.params;
  db.query('INSERT INTO playlists_beats (playlist_id, beat_id) VALUES (?, ?)', [playlist_id, beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the beat to the playlist' });
    } else {
      res.status(201).json({ message: 'Beat added to playlist successfully' });
    }
  });
});

// Remove Beat from Playlist
router.delete('/:playlist_id/beats/:beat_id', (req, res) => {
  const { playlist_id, beat_id } = req.params;
  db.query('DELETE FROM playlists_beats WHERE playlist_id = ? AND beat_id = ?', [playlist_id, beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while removing the beat from the playlist' });
    } else {
      res.json({ message: 'Beat removed from playlist successfully' });
    }
  });
});

// Get Beats in Playlist
router.get('/:playlist_id/beats', (req, res) => {
  const { playlist_id } = req.params;
  db.query(
    'SELECT b.*, pb.beat_order FROM beats b INNER JOIN playlists_beats pb ON b.id = pb.beat_id WHERE pb.playlist_id = ? ORDER BY pb.beat_order',
    [playlist_id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching beats in the playlist' });
      } else {
        res.json(results);
      }
    }
  );
});

// Add Beats to Playlist
router.post('/:playlist_id/beats', (req, res) => {
  const { playlist_id } = req.params;
  const { beatIds } = req.body;
  
  const insertValues = beatIds.map(beatId => [playlist_id, beatId]);

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    // Increment the order of existing beats
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
              db.query('INSERT INTO playlists_beats (playlist_id, beat_id, beat_order) VALUES (?, ?, 0)', [playlistId, beatId], (err, results) => {
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
});

router.put('/:playlist_id/beats/order', (req, res) => {
  const { playlist_id } = req.params;
  const { beatOrders } = req.body;

  const queries = beatOrders.map(({ id, order }) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE playlists_beats SET beat_order = ? WHERE playlist_id = ? AND beat_id = ?', [order, playlist_id, id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: 'Beat order updated successfully' }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the beat order' });
    });
});

router.delete('/:id/beats', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM playlists_beats WHERE playlist_id = ?';

  db.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting beats from the playlist' });
    } else {
      res.status(200).json({ message: 'All beats removed from playlist successfully' });
    }
  });
});

router.post('/api/beats/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;
  const { associationIds } = req.body;
  
  if (!Array.isArray(associationIds) || associationIds.length === 0) {
    return res.status(400).json({ error: 'associationIds must be a non-empty array' });
  }
  
  const tableMap = {
    genres: 'beats_genres',
    moods: 'beats_moods',
    keywords: 'beats_keywords',
    features: 'beats_features'
  };
  
  const tableName = tableMap[association_type];
  if (!tableName) {
    return res.status(400).json({ error: 'Invalid association type' });
  }
  
  const insertValues = associationIds.map(id => [beat_id, id]);
  
  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }
  
    const checkAndInsertPromises = insertValues.map(([beatId, associationId]) =>
      new Promise((resolve, reject) => {
        db.query(`SELECT 1 FROM ${tableName} WHERE beat_id = ? AND ${association_type.slice(0, -1)}_id = ?`, [beatId, associationId], (err, results) => {
          if (err) {
            return reject(err);
          }
          if (results.length === 0) {
            db.query(`INSERT INTO ${tableName} (beat_id, ${association_type.slice(0, -1)}_id) VALUES (?, ?)`, [beatId, associationId], (err) => {
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
            res.status(201).json({ message: `${association_type} added to beat successfully, duplicates avoided` });
          }
        });
      })
      .catch(err => {
        console.error(err);
        db.rollback(() => {
          res.status(500).json({ error: 'An error occurred while processing the request' });
        });
      });
  });
});
  
module.exports = router;