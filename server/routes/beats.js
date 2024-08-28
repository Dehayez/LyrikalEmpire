const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../config/multer');
const { handleQuery } = require('../helpers/dbHelpers');
const path = require('path');
const fs = require('fs');

const tableMap = {
  genres: 'beats_genres',
  moods: 'beats_moods',
  keywords: 'beats_keywords',
  features: 'beats_features'
};

const getTableName = (association_type, res) => {
  const tableName = tableMap[association_type];
  if (!tableName) {
    res.status(400).json({ error: 'Invalid association type' });
    return null;
  }
  return tableName;
};

router.get('/', (req, res) => {
  const { associationType, associationIds } = req.query;

  if (associationType && associationIds) {
    const tableName = getTableName(associationType, res);
    if (!tableName) return;

    const ids = associationIds.split(',').map(id => parseInt(id, 10));
    const placeholders = ids.map(() => '?').join(',');

    const query = `
      SELECT b.* FROM beats b
      JOIN ${tableName} bg ON b.id = bg.beat_id
      WHERE bg.${associationType.slice(0, -1)}_id IN (${placeholders})
    `;

    handleQuery(query, ids, res, `Beats with ${associationType} fetched successfully`, true);
  } else {
    handleQuery('SELECT * FROM beats ORDER BY created_at DESC', [], res, 'Beats fetched successfully', true);
  }
});

router.post('/', upload.single('audio'), (req, res) => {
  const { title, bpm, genre, tierlist, mood, keyword, feature, filePath, duration } = req.body;
  const createdAt = new Date();
  const query = 'INSERT INTO beats (title, audio, bpm, genre, tierlist, mood, keyword, feature, created_at, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [title, filePath, bpm, genre, tierlist, mood, keyword, feature, createdAt, duration];
  handleQuery(query, params, res, 'Beat added successfully');
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  handleQuery('SELECT * FROM beats WHERE id = ?', [id], res, 'Beat fetched successfully', true);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  let updatedBeat = { ...req.body, edited_at: new Date().toISOString().replace('T', ' ').split('.')[0] };
  delete updatedBeat.created_at;

  let updateQuery = 'UPDATE beats SET ';
  let queryParams = [];

  for (let key in updatedBeat) {
    if (key !== 'beat_order') {
      updateQuery += `${key} = ?, `;
      queryParams.push(updatedBeat[key]);
    }
  }

  updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
  queryParams.push(id);

  handleQuery(updateQuery, queryParams, res, 'Beat updated successfully');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    const deleteAssociations = (tableName, callback) => {
      db.query(`DELETE FROM ${tableName} WHERE beat_id = ?`, [id], (err, results) => {
        if (err) {
          console.error(`An error occurred while deleting from ${tableName}:`, err);
          return db.rollback(() => {
            res.status(500).json({ error: `An error occurred while deleting from ${tableName}` });
          });
        }
        callback();
      });
    };

    deleteAssociations('beats_genres', () => {
      deleteAssociations('beats_moods', () => {
        deleteAssociations('beats_keywords', () => {
          deleteAssociations('beats_features', () => {
            db.query('DELETE FROM beats WHERE id = ?', [id], (err, results) => {
              if (err) {
                console.error('An error occurred while deleting the beat:', err);
                return db.rollback(() => {
                  res.status(500).json({ error: 'An error occurred while deleting the beat' });
                });
              }
              db.commit(err => {
                if (err) {
                  console.error('An error occurred while committing the transaction:', err);
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

router.post('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;
  const { associationIds } = req.body;

  if (!Array.isArray(associationIds) || associationIds.length === 0) {
    return res.status(400).json({ error: 'associationIds must be a non-empty array' });
  }

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

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
            db.query(`INSERT INTO ${tableName} (beat_id, ${association_type.slice(0, -1)}_id) VALUES (?, ?)`, [beatId, associationId], (err, results) => {
              if (err) {
                return reject(err);
              }
              resolve(results);
            });
          } else {
            resolve(results);
          }
        });
      })
    );

    Promise.all(checkAndInsertPromises)
      .then(() => {
        db.commit(err => {
          if (err) {
            console.error(err);
            return db.rollback(() => {
              res.status(500).json({ error: 'An error occurred while committing the transaction' });
            });
          }
          res.json({ message: 'Associations added successfully' });
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

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  handleQuery(
    `DELETE FROM ${tableName} WHERE beat_id = ? AND ${association_type.slice(0, -1)}_id = ?`,
    [beat_id, association_id],
    res,
    `${association_type.slice(0, -1)} removed from beat successfully`
  );
});

router.get('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  handleQuery(
    `SELECT * FROM ${tableName} WHERE beat_id = ?`,
    [beat_id],
    res,
    `${association_type} fetched successfully`,
    true
  );
});

router.delete('/:beat_id/:association_type', (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  handleQuery(
    `DELETE FROM ${tableName} WHERE beat_id = ?`,
    [beat_id],
    res,
    `All ${association_type} removed from beat successfully`
  );
});

module.exports = router;