const fs = require('fs');
const path = require('path');
const { handleTransaction, handleQuery } = require('../helpers/dbHelpers');
const db = require('../config/db'); // Import the db module

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

const getBeats = (req, res) => {
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
};

const createBeat = (req, res) => {
  const { title, bpm, tierlist, filePath, duration } = req.body;
  const createdAt = new Date();
  const query = 'INSERT INTO beats (title, audio, bpm, tierlist, created_at, duration) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [title, filePath, bpm, tierlist, createdAt, duration];
  handleQuery(query, params, res, 'Beat added successfully');
};

const getBeatById = (req, res) => {
  const { id } = req.params;
  handleQuery('SELECT * FROM beats WHERE id = ?', [id], res, 'Beat fetched successfully', true);
};

const updateBeat = (req, res) => {
  const { id } = req.params;
  const fields = ['title', 'bpm', 'tierlist', 'filePath'];
  const updates = [];
  const params = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);
  const query = `UPDATE beats SET ${updates.join(', ')} WHERE id = ?`;

  handleQuery(query, params, res, 'Beat updated successfully');
};

const deleteBeat = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete beat with id: ${id}`);

  try {
    const [results] = await db.query('SELECT audio FROM beats WHERE id = ?', [id]);
    const filePath = results[0]?.audio;

    if (filePath) {
      const fullPath = path.join(__dirname, '../../client/public/uploads', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`Failed to delete audio file at path: ${fullPath}`, err);
        }
      });
    }

    const queries = [
      { query: 'DELETE FROM playlists_beats WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_genres WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_moods WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_keywords WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_features WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats WHERE id = ?', params: [id] }
    ];

    handleTransaction(queries, res, 'Beat and all associated data deleted successfully');
  } catch (error) {
    console.error(`Failed to delete beat with id: ${id}`, error);
    res.status(500).json({ error: 'An error occurred while deleting the beat' });
  }
};

const addAssociation = (req, res) => {
  const { beat_id, association_type } = req.params;
  const { association_id } = req.body;

  if (!association_id) {
    return res.status(400).json({ error: 'Association ID is required' });
  }

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `INSERT INTO ${tableName} (beat_id, ${association_type.slice(0, -1)}_id) VALUES (?, ?)`;
  const params = [beat_id, association_id];

  handleQuery(query, params, res, 'Association added successfully');
};

const removeAssociation = (req, res) => {
  const { beat_id, association_type, association_id } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `DELETE FROM ${tableName} WHERE beat_id = ? AND ${association_type.slice(0, -1)}_id = ?`;
  const params = [beat_id, association_id];

  handleQuery(query, params, res, 'Association removed successfully');
};

const getAssociations = (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `SELECT * FROM ${tableName} WHERE beat_id = ?`;
  const params = [beat_id];

  handleQuery(query, params, res, 'Associations fetched successfully', true);
};

const removeAllAssociations = (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `DELETE FROM ${tableName} WHERE beat_id = ?`;
  const params = [beat_id];

  handleQuery(query, params, res, 'All associations removed successfully');
};

module.exports = {
  getBeats,
  createBeat,
  getBeatById,
  updateBeat,
  deleteBeat,
  addAssociation,
  removeAssociation,
  getAssociations,
  removeAllAssociations
};