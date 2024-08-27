const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../config/multer');
const path = require('path');
const fs = require('fs');

const tableMap = {
  genres: 'beats_genres',
  moods: 'beats_moods',
  keywords: 'beats_keywords',
  features: 'beats_features'
};

router.get('/', (req, res) => {
  const { associationType, associationIds } = req.query;

  if (associationType && associationIds) {
    const tableName = tableMap[associationType];
    if (!tableName) {
      console.log('Invalid association type');
      return res.status(400).json({ error: 'Invalid association type' });
    }

    const ids = associationIds.split(',').map(id => parseInt(id, 10));
    const placeholders = ids.map(() => '?').join(',');

    const query = `
      SELECT b.* FROM beats b
      JOIN ${tableName} bg ON b.id = bg.beat_id
      WHERE bg.${associationType.slice(0, -1)}_id IN (${placeholders})
    `;

    db.query(query, ids, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: `An error occurred while fetching beats with ${associationType}` });
      } else {
        res.json(results);
      }
    });
  } else {
    console.log('Received request for /api/beats without associationType and associationIds');
    db.query('SELECT * FROM beats ORDER BY created_at DESC', (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching beats' });
      } else {
        res.json(results);
      }
    });
  }
});

router.post('/', upload.single('audio'), (req, res) => {
  const { title, bpm, genre, tierlist, mood, keyword, feature, filePath, duration } = req.body;
  const createdAt = new Date();
  db.query('INSERT INTO beats (title, audio, bpm, genre, tierlist, mood, keyword, feature, created_at, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [title, filePath, bpm, genre, tierlist, mood, keyword, feature, createdAt, duration], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the beat' });
    } else {
      res.status(201).json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM beats WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching the beat' });
    } else {
      res.json(results);
    }
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  let updatedBeat = { ...req.body, edited_at: new Date().toISOString() };

  delete updatedBeat.created_at;

  updatedBeat.edited_at = updatedBeat.edited_at.replace('T', ' ').split('.')[0];

  let updateQuery = 'UPDATE beats SET ';
  let queryParams = [];

  for (let key in updatedBeat) {
    if (key !== 'beat_order') {
      updateQuery += `${key} = ?, `;
      queryParams.push(updatedBeat[key]);
    }
  }

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ' WHERE id = ?';
  queryParams.push(id);

  db.query(updateQuery, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the beat' });
    } else {
      res.json(results);
    }
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    // First, delete associations in playlists_beats
    db.query('DELETE FROM playlists_beats WHERE beat_id = ?', [id], (err, results) => {
      if (err) {
        console.error('An error occurred while deleting associated playlist beats:', err);
        return db.rollback(() => {
          res.status(500).json({ error: 'An error occurred while deleting associated playlist beats' });
        });
      }

      const deleteAssociations = (tableName, callback) => {
        db.query(`DELETE FROM ${tableName} WHERE beat_id = ?`, [id], (err, results) => {
          if (err) {
            console.error(`An error occurred while deleting associated ${tableName}:`, err);
            return db.rollback(() => {
              res.status(500).json({ error: `An error occurred while deleting associated ${tableName}` });
            });
          }
          callback();
        });
      };

      deleteAssociations('beats_genres', () => {
        deleteAssociations('beats_moods', () => {
          deleteAssociations('beats_keywords', () => {
            deleteAssociations('beats_features', () => {

              db.query('SELECT audio FROM beats WHERE id = ?', [id], (err, results) => {
                if (err) {
                  console.error(err);
                  return db.rollback(() => {
                    res.status(500).json({ error: 'An error occurred while fetching the beat' });
                  });
                }

                const audioFile = results[0]?.audio;
                const filePath = path.join(__dirname, '../../client/public', audioFile);

                fs.unlink(filePath, (err) => {
                  if (err && err.code !== 'ENOENT') {
                    console.error('An error occurred while deleting the audio file:', err);
                    return db.rollback(() => {
                      res.status(500).json({ error: 'An error occurred while deleting the audio file' });
                    });
                  }

                  db.query('DELETE FROM beats WHERE id = ?', [id], (err, results) => {
                    if (err) {
                      console.error(err);
                      return db.rollback(() => {
                        res.status(500).json({ error: 'An error occurred while deleting the beat' });
                      });
                    }

                    db.commit(err => {
                      if (err) {
                        console.error(err);
                        return db.rollback(() => {
                          res.status(500).json({ error: 'An error occurred while committing the transaction' });
                        });
                      }

                      res.json({ message: 'Beat deleted successfully' });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

router.post('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;
  const { associationIds } = req.body;
  
  if (!Array.isArray(associationIds) || associationIds.length === 0) {
    return res.status(400).json({ error: 'associationIds must be a non-empty array' });
  }
  
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

router.delete('/:beat_id/:association_type/:association_id', (req, res) => {
  const { beat_id, association_type, association_id } = req.params;

  const tableName = tableMap[association_type];
  if (!tableName) {
    return res.status(400).json({ error: 'Invalid association type' });
  }

  db.query(`DELETE FROM ${tableName} WHERE beat_id = ? AND ${association_type.slice(0, -1)}_id = ?`, [beat_id, association_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: `An error occurred while deleting ${association_type} from the beat` });
    } else {
      res.json({ message: `${association_type.slice(0, -1)} removed from beat successfully` });
    }
  });
});

router.get('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = tableMap[association_type];
  if (!tableName) {
    return res.status(400).json({ error: 'Invalid association type' });
  }

  db.query(`SELECT * FROM ${tableName} WHERE beat_id = ?`, [beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: `An error occurred while fetching ${association_type} for the beat` });
    } else {
      res.json(results);
    }
  });
});

router.delete('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = tableMap[association_type];
  if (!tableName) {
    return res.status(400).json({ error: 'Invalid association type' });
  }

  db.query(`DELETE FROM ${tableName} WHERE beat_id = ?`, [beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: `An error occurred while deleting all ${association_type} from the beat` });
    } else {
      res.json({ message: `All ${association_type} removed from beat successfully` });
    }
  });
});

module.exports = router;